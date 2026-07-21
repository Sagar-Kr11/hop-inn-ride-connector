import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface PlaceSuggestion {
  placeId: string;
  text: string;
  secondary?: string;
}

interface PlaceAutocompleteProps {
  value: string;
  onChange: (v: string) => void;
  onSelect?: (place: { placeId: string; description: string; lat?: number; lng?: number }) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  bias?: { lat: number; lng: number; radius?: number };
}

let loaderPromise: Promise<void> | null = null;
const loadGoogleMaps = () => {
  if ((window as any).google?.maps?.places) return Promise.resolve();
  if (loaderPromise) return loaderPromise;
  const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
  const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
  loaderPromise = new Promise((resolve, reject) => {
    (window as any).__initGMapsPlaces = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&loading=async&callback=__initGMapsPlaces${channel ? `&channel=${channel}` : ""}`;
    s.async = true;
    s.defer = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return loaderPromise;
};

const PlaceAutocomplete = ({
  value,
  onChange,
  onSelect,
  placeholder,
  icon,
  bias,
}: PlaceAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const sessionTokenRef = useRef<any>(null);
  const debounceRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGoogleMaps().catch(() => {});
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const fetchSuggestions = async (input: string) => {
    if (!input.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      await loadGoogleMaps();
      const g = (window as any).google;
      const { AutocompleteSuggestion, AutocompleteSessionToken } =
        await g.maps.importLibrary("places");
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new AutocompleteSessionToken();
      }
      const req: any = {
        input,
        sessionToken: sessionTokenRef.current,
        includedRegionCodes: ["in"],
      };
      if (bias) {
        req.locationBias = {
          circle: {
            center: { latitude: bias.lat, longitude: bias.lng },
            radius: bias.radius ?? 30000,
          },
        };
      }
      const { suggestions: sugg } =
        await AutocompleteSuggestion.fetchAutocompleteSuggestions(req);
      setSuggestions(
        (sugg || [])
          .filter((s: any) => s.placePrediction)
          .map((s: any) => ({
            placeId: s.placePrediction.placeId,
            text: s.placePrediction.mainText?.text ?? s.placePrediction.text?.text ?? "",
            secondary: s.placePrediction.secondaryText?.text,
          })),
      );
      setOpen(true);
    } catch (e: any) {
      console.error("Autocomplete error", e);
      const msg = e?.message || String(e);
      setSuggestions([
        { placeId: `__err_${Date.now()}`, text: "Places lookup failed", secondary: msg.slice(0, 140) },
      ]);
      setOpen(true);
    }
  };

  const handleChange = (v: string) => {
    onChange(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(v), 200);
  };

  const handleSelect = async (s: PlaceSuggestion) => {
    const full = s.secondary ? `${s.text}, ${s.secondary}` : s.text;
    onChange(full);
    setOpen(false);
    setSuggestions([]);
    try {
      const g = (window as any).google;
      const { Place } = await g.maps.importLibrary("places");
      const place = new Place({ id: s.placeId });
      await place.fetchFields({ fields: ["location"] });
      const loc = place.location;
      onSelect?.({
        placeId: s.placeId,
        description: full,
        lat: loc?.lat(),
        lng: loc?.lng(),
      });
    } catch {
      onSelect?.({ placeId: s.placeId, description: full });
    }
    sessionTokenRef.current = null;
  };

  return (
    <div ref={containerRef} className="relative">
      {icon}
      <Input
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => suggestions.length && setOpen(true)}
        placeholder={placeholder}
        className={`h-12 rounded-xl ${icon ? "pl-10" : ""}`}
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.placeId}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border/50 last:border-0"
            >
              <div className="font-medium text-sm">{s.text}</div>
              {s.secondary && (
                <div className="text-xs text-muted-foreground">{s.secondary}</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaceAutocomplete;
