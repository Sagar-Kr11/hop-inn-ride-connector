import { Power, Route, IndianRupee, Users, TrendingUp, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { useState } from "react";
const nearbyRequests = [{
  id: 1,
  passenger: "Priya S.",
  pickup: "FC Road",
  destination: "Hinjewadi",
  distance: "0.5 km away",
  fare: 45
}, {
  id: 2,
  passenger: "Rahul M.",
  pickup: "Shivaji Nagar",
  destination: "Kothrud",
  distance: "0.8 km away",
  fare: 38
}, {
  id: 3,
  passenger: "Sneha K.",
  pickup: "Camp Area",
  destination: "Viman Nagar",
  distance: "1.2 km away",
  fare: 52
}];
const Driver = () => {
  const [isOnline, setIsOnline] = useState(true);
  return <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-6">
        {/* Status Header */}
        <Card className="p-6 mb-6 shadow-lg bg-[#face4a]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Driver Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, Rajesh!</p>
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="online-toggle" className="font-semibold">
                {isOnline ? "Online" : "Offline"}
              </Label>
              <Switch id="online-toggle" checked={isOnline} onCheckedChange={setIsOnline} className="data-[state=checked]:bg-secondary" />
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Earnings Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="flex items-center gap-3 mb-2">
                  <IndianRupee className="h-8 w-8 text-primary" />
                  <span className="text-sm text-muted-foreground">Today's Earnings</span>
                </div>
                <div className="text-3xl font-bold text-primary">₹420</div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-secondary/10 to-secondary/5">
                <div className="flex items-center gap-3 mb-2">
                  <Route className="h-8 w-8 text-secondary" />
                  <span className="text-sm text-muted-foreground">Trips Today</span>
                </div>
                <div className="text-3xl font-bold text-secondary">12</div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-br from-accent/10 to-primary/5">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-8 w-8 text-accent" />
                  <span className="text-sm text-muted-foreground">Rating</span>
                </div>
                <div className="text-3xl font-bold text-accent">4.8 ⭐</div>
              </Card>
            </div>

            {/* Current Route */}
            <Card className="p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Current Route</h3>
                <Button variant="secondary">Set New Route</Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-muted/30 rounded-xl">
                  <MapPin className="h-6 w-6 text-primary mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-1">Shivaji Nagar → Hinjewadi</p>
                    <p className="text-sm text-muted-foreground">Via FC Road, Paud Road</p>
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        2/3 seats filled
                      </span>
                      <span className="text-muted-foreground">~45 min</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Nearby Requests */}
            <Card className="p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">Nearby Passenger Requests</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Passengers along your route looking for rides
              </p>
              
              <div className="space-y-3">
                {nearbyRequests.map(request => <Card key={request.id} className="p-4 hover:shadow-md transition-shadow bg-destructive-foreground">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            👤
                          </div>
                          <div>
                            <h4 className="font-semibold">{request.passenger}</h4>
                            <p className="text-xs text-muted-foreground">{request.distance}</p>
                          </div>
                        </div>
                        
                        <div className="text-sm space-y-1 ml-13">
                          <p className="flex items-center gap-2">
                            <span className="text-primary">●</span> {request.pickup}
                          </p>
                          <p className="flex items-center gap-2">
                            <span className="text-secondary">●</span> {request.destination}
                          </p>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <div className="flex items-center gap-1 font-bold text-xl text-primary">
                          <IndianRupee className="h-5 w-5" />
                          <span>{request.fare}</span>
                        </div>
                        <Button size="sm" variant="secondary">Accept</Button>
                      </div>
                    </div>
                  </Card>)}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6 shadow-lg">
              <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Route className="mr-3 h-5 w-5" />
                  Set Route
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <Users className="mr-3 h-5 w-5" />
                  View Passengers
                </Button>
                <Button variant="outline" className="w-full justify-start" size="lg">
                  <IndianRupee className="mr-3 h-5 w-5" />
                  Earnings Report
                </Button>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-6 bg-gradient-to-br from-secondary/10 to-primary/5">
              <h3 className="font-semibold text-lg mb-3">💡 Driver Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-secondary">✓</span>
                  <span>Accept requests early for better earnings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">✓</span>
                  <span>Event routes have higher demand</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-secondary">✓</span>
                  <span>​Have a friendly nature with passengers         </span>
                </li>
              </ul>
            </Card>

            {/* Event Notification */}
            <Card className="p-6 bg-gradient-to-br from-accent/20 to-primary/20 border-2 border-primary">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎉</span>
                <h3 className="font-semibold">High Demand Alert</h3>
              </div>
              <p className="text-sm mb-3">
                Sunburn Festival happening at Goa Lawns. High passenger demand expected!
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                Set Event Route
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>;
};
export default Driver;