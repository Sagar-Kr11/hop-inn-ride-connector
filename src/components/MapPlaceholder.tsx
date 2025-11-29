import { MapPin, Navigation } from "lucide-react";
import mapIllustration from "@/assets/map-illustration.jpg";
interface MapPlaceholderProps {
  className?: string;
  showControls?: boolean;
}
const MapPlaceholder = ({
  className = "",
  showControls = true
}: MapPlaceholderProps) => {
  return <div className={`relative overflow-hidden rounded-2xl bg-muted ${className}`}>
      <img alt="Map view showing available autos" src="/lovable-uploads/290256d9-3060-4b2e-8fe4-109ad2185029.png" className="w-full h-full object-cover opacity-80 rounded shadow-lg" />
      
      {/* Overlay elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/30" />
      
      {/* Current location marker */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="h-12 w-12 rounded-full animate-ping absolute bg-secondary-foreground" />
          <MapPin className="h-8 w-8 text-primary relative z-10" fill="currentColor" />
        </div>
      </div>

      {/* Auto markers */}
      <div className="absolute top-1/4 left-1/3 h-6 w-6 rounded-full bg-auto-yellow border-2 border-charcoal flex items-center justify-center text-xs font-bold">
        🛺
      </div>
      <div className="absolute top-2/3 right-1/4 h-6 w-6 rounded-full bg-auto-yellow border-2 border-charcoal flex items-center justify-center text-xs font-bold">
        🛺
      </div>
      <div className="absolute bottom-1/4 left-1/4 h-6 w-6 rounded-full bg-auto-yellow border-2 border-charcoal flex items-center justify-center text-xs font-bold">
        🛺
      </div>

      {showControls && <button className="absolute top-4 right-4 h-10 w-10 rounded-full bg-card shadow-lg flex items-center justify-center hover:bg-card/90 transition-colors">
          <Navigation className="h-5 w-5 text-foreground" />
        </button>}
    </div>;
};
export default MapPlaceholder;