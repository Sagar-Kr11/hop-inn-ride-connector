import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/googleMaps";

interface GoogleMapProps {
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: { lat: number; lng: number; label?: string; title?: string }[];
}

const DEFAULT_CENTER = { lat: 18.5204, lng: 73.8567 }; // Pune

// Muted cream/charcoal map style — keeps yellow markers as the only saturated pop.
// Base is a warm off-white (matches --background cream), roads light gray,
// water soft blue-gray, parks muted sage, most default POI icons hidden.
const HOP_INN_MAP_STYLES: any[] = [
  { elementType: "geometry", stylers: [{ color: "#f5efe0" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#4a4a4a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5efe0" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#c9c1ad" }] },
  { featureType: "administrative.land_parcel", stylers: [{ visibility: "off" }] },
  { featureType: "administrative.neighborhood", stylers: [{ visibility: "off" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#c8d6bf" }] },
  { featureType: "poi.park", elementType: "labels.text", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ebe4d1" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#e0d6ba" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#d1c59f" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#7a7364" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#b8c5cc" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#5c6b73" }] },
] as any;

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
          styles: HOP_INN_MAP_STYLES,
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
          label: m.label
            ? { text: m.label, color: "#1f2937", fontWeight: "700" }
            : undefined,
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
