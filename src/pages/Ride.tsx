import { useEffect, useState } from "react";
import { Phone, MessageCircle, Share2, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import GoogleMap from "@/components/GoogleMap";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Ride = () => {
  const [params] = useSearchParams();
  const rideId = params.get("id");
  const [ride, setRide] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [driverProfile, setDriverProfile] = useState<any>(null);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    if (!rideId) return;
    let cancelled = false;

    const loadRide = async () => {
      const { data } = await supabase.from("rides").select("*").eq("id", rideId).maybeSingle();
      if (cancelled) return;
      setRide(data);
      if (data?.driver_id) {
        const { data: d } = await supabase
          .from("drivers")
          .select("*")
          .eq("user_id", data.driver_id)
          .maybeSingle();
        if (!cancelled) setDriver(d);
        if (d) {
          const { data: p } = await supabase
            .from("profiles")
            .select("full_name, phone_number, avatar_url")
            .eq("id", d.user_id)
            .maybeSingle();
          if (!cancelled) setDriverProfile(p);
        }
      }
    };
    loadRide();

    const rideChan = supabase
      .channel(`ride-detail-${rideId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rides", filter: `id=eq.${rideId}` },
        () => loadRide(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(rideChan);
    };
  }, [rideId]);

  // Live driver location
  useEffect(() => {
    if (!ride?.driver_id) return;
    const chan = supabase
      .channel(`driver-loc-${ride.driver_id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "drivers", filter: `user_id=eq.${ride.driver_id}` },
        (payload) => setDriver(payload.new),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(chan);
    };
  }, [ride?.driver_id]);

  const handleSOS = async () => {
    setTriggering(true);
    let pos: GeolocationPosition | null = null;
    try {
      pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }),
      );
    } catch {
      /* no-op — SOS still fires */
    }
    const { data, error } = await supabase.functions.invoke("trigger-sos", {
      body: {
        ride_id: rideId,
        latitude: pos?.coords.latitude,
        longitude: pos?.coords.longitude,
      },
    });
    setTriggering(false);
    if (error || (data as any)?.error) {
      toast({ title: "SOS failed to send", description: (data as any)?.error || error?.message, variant: "destructive" });
      return;
    }
    const d = data as any;
    toast({
      title: "🚨 SOS sent",
      description: `Alert logged. ${d.sms_sent}/${d.contacts_total} contacts notified.`,
    });
  };

  if (!rideId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container px-4 py-12 text-center">
          <p className="text-muted-foreground">No ride specified.</p>
        </main>
      </div>
    );
  }

  const mapCenter =
    driver?.current_latitude && driver?.current_longitude
      ? { lat: Number(driver.current_latitude), lng: Number(driver.current_longitude) }
      : ride
        ? { lat: Number(ride.pickup_latitude), lng: Number(ride.pickup_longitude) }
        : { lat: 18.5204, lng: 73.8567 };

  const markers: { lat: number; lng: number; label?: string; title?: string }[] = [];
  if (ride) {
    markers.push({ lat: Number(ride.pickup_latitude), lng: Number(ride.pickup_longitude), label: "P", title: "Pickup" });
    markers.push({ lat: Number(ride.dropoff_latitude), lng: Number(ride.dropoff_longitude), label: "D", title: "Drop" });
  }
  if (driver?.current_latitude && driver?.current_longitude) {
    markers.push({
      lat: Number(driver.current_latitude),
      lng: Number(driver.current_longitude),
      label: "🛺",
      title: "Driver",
    });
  }

  const status = ride?.status ?? "loading";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-4 shadow-lg mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Live Tracking</h2>
                <span className="flex items-center gap-2 text-sm text-secondary capitalize">
                  <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                  {status.replace("_", " ")}
                </span>
              </div>
              <GoogleMap className="h-[500px]" center={mapCenter} zoom={14} markers={markers} />
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Trip Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-3 w-3 rounded-full bg-primary mt-1.5" />
                  <div className="flex-1">
                    <p className="font-medium">Pickup</p>
                    <p className="text-sm text-muted-foreground">{ride?.pickup_location ?? "—"}</p>
                  </div>
                </div>
                <div className="ml-1.5 h-8 w-0.5 bg-border" />
                <div className="flex items-start gap-3">
                  <div className="h-3 w-3 rounded-full bg-secondary mt-1.5" />
                  <div className="flex-1">
                    <p className="font-medium">Drop-off</p>
                    <p className="text-sm text-muted-foreground">{ride?.dropoff_location ?? "—"}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6 shadow-lg">
              {ride?.driver_id && driver ? (
                <>
                  <div className="text-center mb-4">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-5xl mx-auto mb-3">
                      🛺
                    </div>
                    <h3 className="text-xl font-bold">{driverProfile?.full_name ?? "Your driver"}</h3>
                    <p className="text-sm text-muted-foreground">{driver.vehicle_number}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <span className="text-2xl">⭐</span>
                      <span className="font-bold text-lg">{driver.rating?.toFixed(1) ?? "—"}</span>
                      <span className="text-sm text-muted-foreground">({driver.total_trips ?? 0} rides)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <a href={driverProfile?.phone_number ? `tel:${driverProfile.phone_number}` : undefined}>
                      <Button variant="secondary" className="flex-col h-auto py-3 w-full" disabled={!driverProfile?.phone_number}>
                        <Phone className="h-5 w-5 mb-1" />
                        <span className="text-xs">Call</span>
                      </Button>
                    </a>
                    <Button variant="secondary" className="flex-col h-auto py-3">
                      <MessageCircle className="h-5 w-5 mb-1" />
                      <span className="text-xs">Chat</span>
                    </Button>
                  </div>

                  <Button variant="outline" className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Trip
                  </Button>
                </>
              ) : (
                <div className="text-center py-6">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
                  <p className="font-semibold">Looking for a driver…</p>
                  <p className="text-sm text-muted-foreground mt-1">We'll notify you as soon as one accepts.</p>
                </div>
              )}
            </Card>

            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="font-semibold text-lg mb-4">Fare</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance</span>
                  <span>{ride?.distance_km ? `${Number(ride.distance_km).toFixed(1)} km` : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ride type</span>
                  <span className="capitalize">{ride?.ride_type?.replace("_", " ") ?? "—"}</span>
                </div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{ride?.fare ?? "—"}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 border-destructive/30">
              <div className="text-center space-y-3">
                <Shield className="h-10 w-10 text-destructive mx-auto" />
                <h3 className="font-semibold">Safety First</h3>
                <p className="text-sm text-muted-foreground">Emergency contacts will be alerted with your live location.</p>
                <Button
                  variant="destructive"
                  className="w-full font-bold"
                  size="lg"
                  onClick={handleSOS}
                  disabled={triggering}
                >
                  {triggering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Emergency SOS
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Ride;
