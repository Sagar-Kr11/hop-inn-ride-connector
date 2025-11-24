import { Phone, MessageCircle, Share2, Shield, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import MapPlaceholder from "@/components/MapPlaceholder";

const Ride = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <Card className="p-4 shadow-lg mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Live Tracking</h2>
                <span className="flex items-center gap-2 text-sm text-secondary">
                  <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                  En Route
                </span>
              </div>
              <MapPlaceholder className="h-[500px]" />
            </Card>

            {/* Trip Details */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Trip Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="h-3 w-3 rounded-full bg-primary mt-1.5" />
                  <div className="flex-1">
                    <p className="font-medium">Pickup</p>
                    <p className="text-sm text-muted-foreground">MG Road, Pune</p>
                    <p className="text-xs text-muted-foreground">Estimated: 9:30 AM</p>
                  </div>
                </div>
                <div className="ml-1.5 h-8 w-0.5 bg-border" />
                <div className="flex items-start gap-3">
                  <div className="h-3 w-3 rounded-full bg-secondary mt-1.5" />
                  <div className="flex-1">
                    <p className="font-medium">Drop-off</p>
                    <p className="text-sm text-muted-foreground">Koregaon Park</p>
                    <p className="text-xs text-muted-foreground">Estimated: 10:15 AM</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Info */}
            <Card className="p-6 shadow-lg">
              <div className="text-center mb-4">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-5xl mx-auto mb-3">
                  👤
                </div>
                <h3 className="text-xl font-bold">Rajesh Kumar</h3>
                <p className="text-sm text-muted-foreground">MH 02 AB 1234</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className="text-2xl">⭐</span>
                  <span className="font-bold text-lg">4.8</span>
                  <span className="text-sm text-muted-foreground">(142 rides)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button variant="secondary" className="flex-col h-auto py-3">
                  <Phone className="h-5 w-5 mb-1" />
                  <span className="text-xs">Call</span>
                </Button>
                <Button variant="secondary" className="flex-col h-auto py-3">
                  <MessageCircle className="h-5 w-5 mb-1" />
                  <span className="text-xs">Chat</span>
                </Button>
              </div>

              <Button variant="outline" className="w-full">
                <Share2 className="mr-2 h-4 w-4" />
                Share Trip
              </Button>
            </Card>

            {/* Fare Details */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <h3 className="font-semibold text-lg mb-4">Fare Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Fare</span>
                  <span>₹30</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distance (8 km)</span>
                  <span>₹16</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shared Discount</span>
                  <span className="text-secondary">-₹21</span>
                </div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹25</span>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Per person fare • 2 passengers
                </p>
              </div>
            </Card>

            {/* Safety */}
            <Card className="p-6 border-2 border-destructive/30">
              <div className="text-center space-y-3">
                <Shield className="h-10 w-10 text-destructive mx-auto" />
                <h3 className="font-semibold">Safety First</h3>
                <p className="text-sm text-muted-foreground">
                  Your trip is being monitored. Emergency contacts notified.
                </p>
                <Button 
                  variant="destructive" 
                  className="w-full font-bold"
                  size="lg"
                >
                  Emergency SOS
                </Button>
              </div>
            </Card>

            {/* Co-Passengers */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Co-Passengers</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    👤
                  </div>
                  <div>
                    <p className="font-medium">Priya S.</p>
                    <p className="text-xs text-muted-foreground">⭐ 4.9</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Ride;
