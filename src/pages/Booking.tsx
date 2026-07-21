import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MapPin, Navigation, Star, Users, Clock, IndianRupee, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import GoogleMap from "@/components/GoogleMap";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { estimateFare, haversineKm } from "@/lib/utils";

type LatLng = { lat: number; lng: number };

const PUNE: LatLng = { lat: 18.5204, lng: 73.8567 };

const Booking = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const eventId = params.get("event_id");
  const eventName = params.get("event_name");
  const eventLat = params.get("lat");
  const eventLng = params.get("lng");
  const eventDest = params.get("dest");

  const [rideType, setRideType] = useState<"solo" | "shared_route" | "shared_event">(
    eventId ? "shared_event" : "shared_route",
  );
  const [selectedAuto, setSelectedAuto] = useState<string | null>(null);
  const [pickup, setPickup] = useState("");
  const [pickupCoords, setPickupCoords] = useState<LatLng | null>(null);
  const [destination, setDestination] = useState(eventDest || "");
  const [destCoords, setDestCoords] = useState<LatLng | null>(
    eventLat && eventLng ? { lat: parseFloat(eventLat), lng: parseFloat(eventLng) } : null,
  );
  const [booking, setBooking] = useState(false);

  const center = pickupCoords || destCoords || PUNE;

  // Live drivers near pickup (or map center)
  const [drivers, setDrivers] = useState<any[]>([]);
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("id, user_id, vehicle_number, vehicle_type, rating, total_trips, current_latitude, current_longitude, is_online")
        .eq("is_online", true)
        .not("current_latitude", "is", null)
        .not("current_longitude", "is", null)
        .limit(20);
      if (cancelled) return;
      if (error) {
        console.error(error);
        setDrivers([]);
        return;
      }
      // Rough proximity filter (~15 km bounding box) if we have a pickup
      const filtered = pickupCoords
        ? (data || []).filter((d) =>
            haversineKm(pickupCoords, {
              lat: Number(d.current_latitude),
              lng: Number(d.current_longitude),
            }) < 15,
          )
        : data || [];
      setDrivers(filtered);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [pickupCoords?.lat, pickupCoords?.lng]);

  const distanceKm = useMemo(() => {
    if (!pickupCoords || !destCoords) return null;
    return haversineKm(pickupCoords, destCoords);
  }, [pickupCoords, destCoords]);

  const fareEstimate = distanceKm != null ? estimateFare(distanceKm, rideType) : null;

  const markers = useMemo(() => {
    const m: { lat: number; lng: number; label?: string; title?: string }[] = [];
    if (pickupCoords) m.push({ ...pickupCoords, label: "P", title: "Pickup" });
    if (destCoords) m.push({ ...destCoords, label: "D", title: "Destination" });
    for (const d of drivers) {
      m.push({
        lat: Number(d.current_latitude),
        lng: Number(d.current_longitude),
        label: "🛺",
        title: d.vehicle_number,
      });
    }
    return m;
  }, [pickupCoords, destCoords, drivers]);

  const handleConfirm = async () => {
    if (!pickupCoords || !destCoords) {
      toast({ title: "Missing location", description: "Select pickup and destination from suggestions.", variant: "destructive" });
      return;
    }
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to book a ride." });
      navigate(`/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    setBooking(true);
    const fare = estimateFare(distanceKm ?? 0, rideType);
    const { data: ride, error } = await supabase
      .from("rides")
      .insert({
        passenger_id: user.id,
        pickup_location: pickup,
        pickup_latitude: pickupCoords.lat,
        pickup_longitude: pickupCoords.lng,
        dropoff_location: destination,
        dropoff_latitude: destCoords.lat,
        dropoff_longitude: destCoords.lng,
        ride_type: rideType,
        status: "searching",
        event_id: eventId,
        fare,
        distance_km: distanceKm,
      })
      .select()
      .single();
    if (error || !ride) {
      setBooking(false);
      toast({ title: "Could not create ride", description: error?.message, variant: "destructive" });
      return;
    }

    toast({ title: "Looking for drivers…", description: "You'll be redirected once a driver accepts." });

    // Subscribe for match, plus fallback poll
    const channel = supabase
      .channel(`ride-${ride.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rides", filter: `id=eq.${ride.id}` },
        (payload) => {
          const next = payload.new as { status: string };
          if (next.status === "matched" || next.status === "in_progress") {
            supabase.removeChannel(channel);
            navigate(`/ride?id=${ride.id}`);
          }
        },
      )
      .subscribe();

    // Fallback: navigate to /ride?id=... after 20s regardless; Ride page shows waiting state
    setTimeout(() => {
      supabase.removeChannel(channel);
      navigate(`/ride?id=${ride.id}`);
    }, 20000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        {eventName && (
          <Card className="p-4 mb-4 bg-primary/10 border-primary/30">
            <p className="text-sm">
              Booking a <strong>shared event ride</strong> to <strong>{eventName}</strong>. Destination pre-filled.
            </p>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Book Your Ride</h2>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Pickup Location</Label>
                  <PlaceAutocomplete
                    value={pickup}
                    onChange={setPickup}
                    onSelect={(p) => p.lat && p.lng && setPickupCoords({ lat: p.lat, lng: p.lng })}
                    placeholder="Enter pickup"
                    icon={<MapPin className="absolute left-3 top-3.5 h-5 w-5 text-primary z-10 pointer-events-none" />}
                    bias={{ lat: center.lat, lng: center.lng }}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">Destination</Label>
                  <PlaceAutocomplete
                    value={destination}
                    onChange={setDestination}
                    onSelect={(p) => p.lat && p.lng && setDestCoords({ lat: p.lat, lng: p.lng })}
                    placeholder="Enter destination"
                    icon={<Navigation className="absolute left-3 top-3.5 h-5 w-5 text-secondary z-10 pointer-events-none" />}
                    bias={{ lat: center.lat, lng: center.lng }}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Ride Type</Label>
                  <RadioGroup
                    value={rideType}
                    onValueChange={(v) => setRideType(v as typeof rideType)}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="solo" id="solo" />
                      <Label htmlFor="solo" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Solo</div>
                        <div className="text-xs text-muted-foreground">Ride alone, full fare</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="shared_route" id="shared_route" />
                      <Label htmlFor="shared_route" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Route-based (shared)</div>
                        <div className="text-xs text-muted-foreground">Share with passengers on similar route</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="shared_event" id="shared_event" />
                      <Label htmlFor="shared_event" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Event-based (shared)</div>
                        <div className="text-xs text-muted-foreground">Going to/from an event</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="p-4 bg-muted/50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estimated Fare</span>
                    <div className="flex items-center gap-1 font-bold text-xl text-primary">
                      <IndianRupee className="h-5 w-5" />
                      <span>{fareEstimate != null ? fareEstimate : "—"}</span>
                    </div>
                  </div>
                  {distanceKm != null && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ~{distanceKm.toFixed(1)} km • {rideType === "solo" ? "solo" : "shared"}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Available Autos Near You</h3>
              <GoogleMap className="h-[300px] mb-6" center={center} zoom={13} markers={markers} />

              <div className="space-y-4">
                {drivers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No online drivers nearby right now. You can still confirm — we'll match you as soon as one comes online.
                  </p>
                ) : (
                  drivers.map((d) => {
                    const dist = pickupCoords
                      ? haversineKm(pickupCoords, {
                          lat: Number(d.current_latitude),
                          lng: Number(d.current_longitude),
                        })
                      : null;
                    return (
                      <Card
                        key={d.id}
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                          selectedAuto === d.id ? "border-2 border-primary bg-primary/5" : ""
                        }`}
                        onClick={() => setSelectedAuto(d.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">🛺</div>
                              <div>
                                <h4 className="font-semibold text-lg">{d.vehicle_number}</h4>
                                <p className="text-sm text-muted-foreground capitalize">{d.vehicle_type}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-primary text-primary" />
                                <span className="font-medium">{d.rating?.toFixed(1) ?? "—"}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{d.total_trips ?? 0} trips</span>
                              </span>
                              {dist != null && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>{dist.toFixed(1)} km away</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>

              <div className="mt-6 flex gap-4">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleConfirm}
                  disabled={booking || !pickupCoords || !destCoords}
                >
                  {booking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {!pickupCoords || !destCoords ? "Select pickup & destination" : "Confirm Booking"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Booking;
