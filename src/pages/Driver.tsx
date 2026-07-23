import { useEffect, useRef, useState } from "react";
import { Power, Route, IndianRupee, Users, TrendingUp, MapPin, Calendar, ArrowRight, AlertTriangle, Phone, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import GoogleMap from "@/components/GoogleMap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { haversineKm, pointToSegmentKm } from "@/lib/utils";

type ActiveRoute = {
  id: string;
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  name: string;
};
const ROUTE_THRESHOLD_KM = 2.5;

const Driver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = (location.state as any)?.justRegistered === true;
  const [userId, setUserId] = useState<string | null>(null);
  const [driverRow, setDriverRow] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [loc, setLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeRoute, setActiveRoute] = useState<ActiveRoute | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastPushRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    console.log("[Driver] mount; justRegistered flag =", justRegistered);
    const loadForUser = async (uid: string | null, allowRetry = justRegistered) => {
      if (!uid) {
        navigate("/auth?tab=driver&next=/driver");
        return;
      }
      if (cancelled) return;
      setUserId(uid);
      let { data } = await supabase.from("drivers").select("*").eq("user_id", uid).maybeSingle();
      if (!data && allowRetry) {
        // Post-registration race: row may not be visible yet — retry briefly before bouncing.
        await new Promise((r) => setTimeout(r, 600));
        if (cancelled) return;
        ({ data } = await supabase.from("drivers").select("*").eq("user_id", uid).maybeSingle());
      }
      if (cancelled) return;
      if (!data) {
        navigate("/auth?tab=driver&next=/driver");
        return;
      }
      setDriverRow(data);
      setIsOnline(!!data.is_online);
      if (data.current_latitude && data.current_longitude) {
        setLoc({ lat: Number(data.current_latitude), lng: Number(data.current_longitude) });
      }
    };
    supabase.auth.getSession().then(({ data }) => loadForUser(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      // React to late OAuth hydration — only re-run if we didn't already have a user
      if (!userId && session?.user.id) loadForUser(session.user.id);
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Toggle online / geolocation watch
  const toggleOnline = async (next: boolean) => {
    if (!driverRow) return;
    setIsOnline(next);
    await supabase.from("drivers").update({ is_online: next }).eq("id", driverRow.id);
    if (next) {
      if (!navigator.geolocation) {
        toast({ title: "Geolocation unsupported", variant: "destructive" });
        return;
      }
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (pos) => {
          const now = Date.now();
          if (now - lastPushRef.current < 10000) return;
          lastPushRef.current = now;
          const nl = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setLoc(nl);
          await supabase
            .from("drivers")
            .update({ current_latitude: nl.lat, current_longitude: nl.lng })
            .eq("id", driverRow.id);
        },
        (err) => console.warn("geo err", err),
        { enableHighAccuracy: true, maximumAge: 5000 },
      );
    } else {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // Load active route for this driver
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const loadRoute = async () => {
      const { data } = await supabase
        .from("driver_routes")
        .select("*")
        .eq("driver_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (data && data.start_latitude && data.end_latitude) {
        setActiveRoute({
          id: data.id,
          name: data.route_name,
          start: { lat: Number(data.start_latitude), lng: Number(data.start_longitude) },
          end: { lat: Number(data.end_latitude), lng: Number(data.end_longitude) },
        });
      } else {
        setActiveRoute(null);
      }
    };
    loadRoute();
    return () => { cancelled = true; };
  }, [userId]);


  // Load nearby search-status rides
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("rides")
        .select("id, pickup_location, dropoff_location, pickup_latitude, pickup_longitude, dropoff_latitude, dropoff_longitude, fare, ride_type, created_at, passenger_id")
        .eq("status", "searching")
        .is("driver_id", null)
        .order("created_at", { ascending: false })
        .limit(20);
      const rows = (data || []).map((r) => {
        const pickup = { lat: Number(r.pickup_latitude), lng: Number(r.pickup_longitude) };
        const dropoff = { lat: Number(r.dropoff_latitude), lng: Number(r.dropoff_longitude) };
        let onRoute = false;
        if (activeRoute && r.ride_type === "shared_route") {
          const dPickup = pointToSegmentKm(pickup, activeRoute.start, activeRoute.end);
          const dDrop = pointToSegmentKm(dropoff, activeRoute.start, activeRoute.end);
          onRoute = dPickup <= ROUTE_THRESHOLD_KM && dDrop <= ROUTE_THRESHOLD_KM;
        }
        return {
          ...r,
          distanceKm: loc ? haversineKm(loc, pickup) : null,
          onRoute,
        };
      });
      rows.sort((a, b) => {
        if (activeRoute) {
          if (a.onRoute !== b.onRoute) return a.onRoute ? -1 : 1;
        }
        return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
      });
      setRequests(rows);
    };
    load();
    const chan = supabase
      .channel("driver-requests")
      .on("postgres_changes", { event: "*", schema: "public", table: "rides" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(chan);
    };
  }, [loc?.lat, loc?.lng, activeRoute?.id]);

  const acceptRide = async (rideId: string) => {
    if (!driverRow || !userId) return;
    const { error } = await supabase
      .from("rides")
      .update({ driver_id: userId, status: "matched" })
      .eq("id", rideId)
      .eq("status", "searching")
      .is("driver_id", null);
    if (error) {
      toast({ title: "Could not accept", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Ride accepted", description: "Head to the pickup location." });
    navigate(`/ride?id=${rideId}`);
  };

  // Earnings aggregates
  const { data: stats } = useQuery({
    queryKey: ["driver-stats", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("rides")
        .select("fare, driver_rating, status")
        .eq("driver_id", userId)
        .eq("status", "completed");
      const trips = data?.length ?? 0;
      const earnings = (data || []).reduce((s, r) => s + (Number(r.fare) || 0), 0);
      const rated = (data || []).filter((r) => r.driver_rating != null);
      const rating = rated.length
        ? rated.reduce((s, r) => s + Number(r.driver_rating), 0) / rated.length
        : null;
      return { trips, earnings, rating };
    },
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ["dashboard-events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const handleSOS = async () => {
    let pos: GeolocationPosition | null = null;
    try {
      pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }));
    } catch { /* still fire */ }
    const { data, error } = await supabase.functions.invoke("trigger-sos", {
      body: { latitude: pos?.coords.latitude ?? loc?.lat, longitude: pos?.coords.longitude ?? loc?.lng },
    });
    if (error || (data as any)?.error) {
      toast({ title: "SOS failed", description: (data as any)?.error || error?.message, variant: "destructive" });
      return;
    }
    const d = data as any;
    toast({ title: "🚨 SOS sent", description: `Notified ${d.sms_sent}/${d.contacts_total} contacts.` });
  };

  const mapCenter = loc || { lat: 18.5204, lng: 73.8567 };
  const mapMarkers = [
    ...(loc ? [{ ...loc, label: "🛺", title: "You" }] : []),
    ...requests.slice(0, 8).map((r) => ({
      lat: Number(r.pickup_latitude),
      lng: Number(r.pickup_longitude),
      label: "P",
      title: r.pickup_location,
    })),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6">
        <Card className="p-6 mb-8 shadow-sm bg-card border border-border">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
              <p className="text-muted-foreground">
                {driverRow ? `Vehicle ${driverRow.vehicle_number}` : "Loading…"}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="lg" className="font-bold shadow-lg animate-pulse">
                    <AlertTriangle className="h-5 w-5" />
                    SOS Alert
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-destructive" />
                      Send Emergency Alert?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will alert your emergency contacts via SMS with your live location. Use only in a real emergency.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSOS} className="bg-destructive hover:bg-destructive/90">
                      <Phone className="h-4 w-4" />
                      Send Alert
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Label htmlFor="online-toggle" className="font-semibold">{isOnline ? "Online" : "Offline"}</Label>
              <Switch
                id="online-toggle"
                checked={isOnline}
                onCheckedChange={toggleOnline}
                className="data-[state=checked]:bg-secondary"
              />
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="flex items-center gap-3 mb-2">
                  <IndianRupee className="h-8 w-8 text-primary" />
                  <span className="text-sm text-muted-foreground">Total Earnings</span>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {stats ? `₹${stats.earnings}` : "—"}
                </div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5">
                <div className="flex items-center gap-3 mb-2">
                  <Route className="h-8 w-8 text-secondary" />
                  <span className="text-sm text-muted-foreground">Completed Trips</span>
                </div>
                <div className="text-3xl font-bold text-secondary">{stats?.trips ?? 0}</div>
              </Card>
              <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-8 w-8 text-accent" />
                  <span className="text-sm text-muted-foreground">Rating</span>
                </div>
                <div className="text-3xl font-bold text-accent">
                  {stats?.rating != null ? `${stats.rating.toFixed(1)} ⭐` : "No rides yet"}
                </div>
              </Card>
            </div>

            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Your Location & Requests</h3>
              <GoogleMap className="h-[300px] mb-4" center={mapCenter} zoom={13} markers={mapMarkers} />
              {!isOnline && (
                <p className="text-sm text-muted-foreground">Go online to start receiving ride requests near your location.</p>
              )}
            </Card>

            <Card className="p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Nearby Passenger Requests</h3>
                {activeRoute ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-secondary/15 text-secondary font-medium">
                    Route: {activeRoute.name}
                  </span>
                ) : (
                  <Link to="/driver/route" className="text-xs text-primary underline">Set a route</Link>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {activeRoute
                  ? "Shared-route rides matching your line are shown first."
                  : "Live requests where no driver is assigned yet."}
              </p>
              <div className="space-y-3">
                {requests.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No open requests right now.</p>
                ) : (
                  requests.map((r) => (
                    <Card key={r.id} className={`p-4 hover:shadow-md transition-shadow ${r.onRoute ? "border-2 border-secondary/60 bg-secondary/5" : ""}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {r.onRoute && (
                              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground font-bold">On your route</span>
                            )}
                            {activeRoute && !r.onRoute && r.ride_type === "shared_route" && (
                              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">Off route</span>
                            )}
                          </div>
                          <p className="text-sm mb-1"><span className="text-primary">●</span> {r.pickup_location}</p>
                          <p className="text-sm mb-2"><span className="text-secondary">●</span> {r.dropoff_location}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {r.ride_type.replace("_", " ")}
                            {r.distanceKm != null ? ` • ${r.distanceKm.toFixed(1)} km from you` : ""}
                          </p>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex items-center gap-1 font-bold text-xl text-primary">
                            <IndianRupee className="h-5 w-5" />
                            <span>{r.fare ?? "—"}</span>
                          </div>
                          <Button size="sm" variant="secondary" onClick={() => acceptRide(r.id)}>Accept</Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 shadow-lg">
              <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/driver/route"><Button variant="charcoalOutline" className="w-full justify-start" size="lg">
                  <Route className="mr-3 h-5 w-5" />{activeRoute ? "Edit Route" : "Set Route"}
                </Button></Link>
                <Link to="/history"><Button variant="charcoalOutline" className="w-full justify-start" size="lg">
                  <IndianRupee className="mr-3 h-5 w-5" />Earnings Report
                </Button></Link>
                <Link to="/safety"><Button variant="charcoalOutline" className="w-full justify-start" size="lg">
                  <Shield className="mr-3 h-5 w-5" />Safety Contacts
                </Button></Link>
              </div>
            </Card>

            <Card className="p-6 shadow-lg border-2 border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-lg">Events Near You</h3>
                </div>
                <Link to="/events">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              {upcomingEvents && upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{event.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{event.location_name}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-primary">
                          {format(new Date(event.event_date), "MMM dd")}
                        </p>
                        <p className="text-xs text-muted-foreground">High Demand</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events nearby</p>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Driver;
