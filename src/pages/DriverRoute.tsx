import { useEffect, useState } from "react";
import { ArrowLeft, MapPin, Navigation, Loader2, Route as RouteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import PlaceAutocomplete from "@/components/PlaceAutocomplete";
import GoogleMap from "@/components/GoogleMap";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type LatLng = { lat: number; lng: number };
const PUNE: LatLng = { lat: 18.5204, lng: 73.8567 };

const DriverRoute = () => {
  const navigate = useNavigate();
  const [driverId, setDriverId] = useState<string | null>(null);
  const [routeId, setRouteId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [startText, setStartText] = useState("");
  const [endText, setEndText] = useState("");
  const [startCoords, setStartCoords] = useState<LatLng | null>(null);
  const [endCoords, setEndCoords] = useState<LatLng | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) {
        navigate("/auth?tab=driver&next=/driver/route");
        return;
      }
      const { data: drv } = await supabase.from("drivers").select("id").eq("user_id", uid).maybeSingle();
      if (!drv) {
        navigate("/auth?tab=driver&next=/driver/route");
        return;
      }
      setDriverId(uid);
      const { data: existing } = await supabase
        .from("driver_routes")
        .select("*")
        .eq("driver_id", uid)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (existing) {
        setRouteId(existing.id);
        setName(existing.route_name || "");
        setStartText(existing.start_location || "");
        setEndText(existing.end_location || "");
        setIsActive(!!existing.is_active);
        if (existing.start_latitude && existing.start_longitude) {
          setStartCoords({ lat: Number(existing.start_latitude), lng: Number(existing.start_longitude) });
        }
        if (existing.end_latitude && existing.end_longitude) {
          setEndCoords({ lat: Number(existing.end_latitude), lng: Number(existing.end_longitude) });
        }
      }
      setLoading(false);
    })();
  }, [navigate]);


  const handleSave = async () => {
    if (!driverId) return;
    if (!startCoords || !endCoords) {
      toast({ title: "Pick both points", description: "Select start and end from suggestions.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      driver_id: driverId,
      route_name: name || `${startText.split(",")[0]} → ${endText.split(",")[0]}`,
      start_location: startText,
      end_location: endText,
      start_latitude: startCoords.lat,
      start_longitude: startCoords.lng,
      end_latitude: endCoords.lat,
      end_longitude: endCoords.lng,
      is_active: isActive,
    };
    const q = routeId
      ? supabase.from("driver_routes").update(payload).eq("id", routeId)
      : supabase.from("driver_routes").insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Route saved", description: isActive ? "Matching will prioritize rides along this route." : "Route saved as inactive." });
    navigate("/driver");
  };

  const handleDeactivate = async () => {
    if (!routeId) return;
    await supabase.from("driver_routes").update({ is_active: false }).eq("id", routeId);
    setIsActive(false);
    toast({ title: "Route deactivated", description: "You'll see all nearby requests again." });
  };

  const markers = [
    ...(startCoords ? [{ ...startCoords, label: "A", title: "Route start" }] : []),
    ...(endCoords ? [{ ...endCoords, label: "B", title: "Route end" }] : []),
  ];
  const center = startCoords || endCoords || PUNE;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-6 max-w-5xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-6 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <RouteIcon className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Set Your Route</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Optional. When set, you'll see route-based shared ride requests along this line first.
              You can operate without a route — you'll just see all nearby requests sorted by distance.
            </p>

            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Route name (optional)</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Home to Office" className="h-12 rounded-xl" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Start point</Label>
                  <PlaceAutocomplete
                    value={startText}
                    onChange={setStartText}
                    onSelect={(p) => p.lat && p.lng && setStartCoords({ lat: p.lat, lng: p.lng })}
                    placeholder="Where do you start?"
                    icon={<MapPin className="absolute left-3 top-3.5 h-5 w-5 text-primary z-10 pointer-events-none" />}
                    bias={{ lat: center.lat, lng: center.lng }}
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">End point</Label>
                  <PlaceAutocomplete
                    value={endText}
                    onChange={setEndText}
                    onSelect={(p) => p.lat && p.lng && setEndCoords({ lat: p.lat, lng: p.lng })}
                    placeholder="Where do you usually end?"
                    icon={<Navigation className="absolute left-3 top-3.5 h-5 w-5 text-secondary z-10 pointer-events-none" />}
                    bias={{ lat: center.lat, lng: center.lng }}
                  />
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <Button size="lg" onClick={handleSave} disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {routeId ? "Update Route" : "Save Route"}
                  </Button>
                  {routeId && isActive && (
                    <Button variant="charcoalOutline" onClick={handleDeactivate}>Deactivate Route</Button>
                  )}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 shadow-lg">
            <h3 className="font-semibold text-lg mb-4">Preview</h3>
            <GoogleMap className="h-[380px]" center={center} zoom={12} markers={markers} />
            {startCoords && endCoords && (
              <p className="text-xs text-muted-foreground mt-3">
                Requests with pickup and dropoff within ~2.5 km of this line will be marked "on your route".
              </p>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DriverRoute;
