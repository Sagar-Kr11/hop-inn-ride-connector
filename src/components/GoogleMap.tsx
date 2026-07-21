import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/googleMaps";

interface GoogleMapProps {
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: { lat: number; lng: number; label?: string; title?: string }[];
}

const DEFAULT_CENTER = { lat: 18.5204, lng: 73.8567 }; // Pune

const GoogleMap = ({
  className = "",
  center = DEFAULT_CENTER,
  zoom = 14,
  markers = [],
}: GoogleMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRefs = useRef<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const g = (window as any).google;
        mapRef.current = new g.maps.Map(containerRef.current, {
          center,
          zoom,
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        });
      })
      .catch((e) => setError(e.message));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.setCenter(center);
    mapRef.current.setZoom(zoom);
  }, [center.lat, center.lng, zoom]);

  useEffect(() => {
    const g = (window as any).google;
    if (!g || !mapRef.current) return;
    markerRefs.current.forEach((m) => m.setMap(null));
    markerRefs.current = markers.map(
      (m) =>
        new g.maps.Marker({
          position: { lat: m.lat, lng: m.lng },
          map: mapRef.current,
          label: m.label,
          title: m.title,
        }),
    );
  }, [markers]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-muted ${className}`}>
      <div ref={containerRef} className="absolute inset-0" />
      {error && (
        <div className="absolute inset-0 flex items-center justify-center p-4 text-sm text-destructive text-center">
          {error}
        </div>
      )}
    </div>
  );
};

export default GoogleMap;
