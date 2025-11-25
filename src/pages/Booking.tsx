import { useState } from "react";
import { ArrowLeft, MapPin, Navigation, Star, Users, Clock, IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import MapPlaceholder from "@/components/MapPlaceholder";
import { Link, useNavigate } from "react-router-dom";

const availableAutos = [
  {
    id: 1,
    driver: "Rajesh Kumar",
    vehicle: "MH 02 AB 1234",
    rating: 4.8,
    seats: 2,
    eta: "3 min",
    fare: 25,
  },
  {
    id: 2,
    driver: "Suresh Sharma",
    vehicle: "MH 02 CD 5678",
    rating: 4.9,
    seats: 1,
    eta: "5 min",
    fare: 22,
  },
  {
    id: 3,
    driver: "Amit Patel",
    vehicle: "MH 02 EF 9012",
    rating: 4.7,
    seats: 3,
    eta: "7 min",
    fare: 28,
  },
];

const Booking = () => {
  const navigate = useNavigate();
  const [rideType, setRideType] = useState("route");
  const [selectedAuto, setSelectedAuto] = useState<number | null>(null);

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

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Book Your Ride</h2>
              
              <div className="space-y-4">
                {/* Pickup */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Pickup Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                    <Input 
                      placeholder="Enter pickup" 
                      defaultValue="MG Road, Pune"
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                </div>

                {/* Destination */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Destination</Label>
                  <div className="relative">
                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                    <Input 
                      placeholder="Enter destination" 
                      defaultValue="Koregaon Park"
                      className="pl-10 h-12 rounded-xl"
                    />
                  </div>
                </div>

                {/* Ride Type */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Ride Type</Label>
                  <RadioGroup value={rideType} onValueChange={setRideType} className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="route" id="route" />
                      <Label htmlFor="route" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Route-based</div>
                        <div className="text-xs text-muted-foreground">Share with passengers on similar route</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="event" id="event" />
                      <Label htmlFor="event" className="flex-1 cursor-pointer">
                        <div className="font-semibold">Event-based</div>
                        <div className="text-xs text-muted-foreground">Going to/from an event</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Fare Estimate */}
                <div className="p-4 bg-muted/50 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estimated Fare</span>
                    <div className="flex items-center gap-1 font-bold text-xl text-primary">
                      <IndianRupee className="h-5 w-5" />
                      <span>22-28</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Available Autos */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Available Autos Near You</h3>
              <MapPlaceholder className="h-[300px] mb-6" />
              
              <div className="space-y-4">
                {availableAutos.map((auto) => (
                  <Card 
                    key={auto.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedAuto === auto.id ? "border-2 border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => setSelectedAuto(auto.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                            👤
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{auto.driver}</h4>
                            <p className="text-sm text-muted-foreground">{auto.vehicle}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="font-medium">{auto.rating}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{auto.seats} seats</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{auto.eta}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 font-bold text-2xl text-primary">
                          <IndianRupee className="h-5 w-5" />
                          <span>{auto.fare}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">per person</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="mt-6 flex gap-4">
                {selectedAuto ? (
                  <Link to="/ride" className="flex-1">
                    <Button size="lg" className="w-full">
                      Confirm Booking
                    </Button>
                  </Link>
                ) : (
                  <Button size="lg" className="w-full" disabled>
                    Select an auto to continue
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Booking;
