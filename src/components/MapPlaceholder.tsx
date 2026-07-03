import GoogleMap from "./GoogleMap";

interface MapPlaceholderProps {
  className?: string;
  showControls?: boolean;
}

// Sample auto locations around Pune for demo
const DEMO_MARKERS = [
  { lat: 18.5204, lng: 73.8567, label: "🛺", title: "Auto 1" },
  { lat: 18.5314, lng: 73.8446, label: "🛺", title: "Auto 2" },
  { lat: 18.5089, lng: 73.8656, label: "🛺", title: "Auto 3" },
];

const MapPlaceholder = ({ className = "" }: MapPlaceholderProps) => {
  return (
    <GoogleMap
      className={className}
      center={{ lat: 18.5204, lng: 73.8567 }}
      zoom=  {14}
      markers={DEMO_MARKERS}
    />
  );
};

export default MapPlaceholder;
