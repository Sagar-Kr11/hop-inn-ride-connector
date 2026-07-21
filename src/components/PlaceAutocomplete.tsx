import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { loadGoogleMaps } from "@/lib/googleMaps";

interface PlaceSuggestion {
  placeId: string;
  text: string;
  secondary?: string;
  prediction?: any;
  isError?: boolean;
}

interface PlaceAutocompleteProps {
  value: string;
  onChange: (v: string) => void;
  onSelect?: (place: { placeId: string; description: string; lat?: number; lng?: number }) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  bias?: { lat: number; lng: number; radius?: number };
}

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
        req.locationBias = { lat: bias.lat, lng: bias.lng };
        req.origin = { lat: bias.lat, lng: bias.lng };
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
            prediction: s.placePrediction,
          })),
      );
      setOpen(true);
    } catch (e: any) {
      console.error("Autocomplete error", e);
      const msg = e?.message || String(e);
      setSuggestions([
        { placeId: `__err_${Date.now()}`, text: "Places lookup failed", secondary: msg.slice(0, 140), isError: true },
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
    if (s.isError) return;

    const full = s.secondary ? `${s.text}, ${s.secondary}` : s.text;
    onChange(full);
    setOpen(false);
    setSuggestions([]);
    try {
      const g = (window as any).google;
      const { Place } = await g.maps.importLibrary("places");
      const place = s.prediction?.toPlace ? s.prediction.toPlace() : new Place({ id: s.placeId });
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
              disabled={s.isError}
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 hover:bg-muted transition-colors border-b border-border/50 last:border-0 disabled:cursor-not-allowed disabled:hover:bg-transparent"
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
