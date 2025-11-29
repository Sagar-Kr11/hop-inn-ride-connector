import { Search, Calendar, History, Shield, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import MapPlaceholder from "@/components/MapPlaceholder";
import { Link } from "react-router-dom";
import heroAuto from "@/assets/hero-auto.jpg";
const Home = () => {
  return <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="container px-4 py-12 md:py-16 relative">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="inline-block py-2 rounded-full text-sm font-medium bg-[#ffc300]/[0.71] px-[19px] text-card-foreground">
                Shared Auto Rides
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Your Ride,<br />
                <span className="text-primary">Your Way</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg text-justify font-normal">
                Share auto rides on your route. Save money, reduce traffic, and travel together with Hop-Inn.
              </p>
              <div className="flex-wrap gap-4 items-center justify-start flex flex-row">
                <Link to="/booking">
                  <Button variant="hero" size="lg">
                    Book a Ride
                  </Button>
                </Link>
                <Link to="/driver">
                  <Button variant="secondary" size="lg">
                    Drive with Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative h-[300px] md:h-[400px] rounded-2xl overflow-hidden shadow-2xl">
              <img alt="Yellow auto rickshaw on Indian street" className="w-full h-full border-muted border-dashed object-cover" src="/lovable-uploads/f110c657-f73e-420c-8a77-8f7b7fcda164.png" />
            </div>
          </div>
        </div>
      </section>

      <main className="container px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Section */}
            <Card className="p-6 border-2 px-[23px] rounded-md shadow-md my-0 text-secondary-foreground bg-accent">
              <h2 className="text-2xl font-bold mb-4 text-foreground">Where to?</h2>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Enter pickup location" className="pl-10 h-12 rounded-xl border-2" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="Enter destination" className="pl-10 h-12 rounded-xl border-2" />
                  </div>
                </div>
                <Link to="/booking" className="block">
                  <Button size="lg" className="w-full bg-[#39b275] text-base font-sans font-semibold border-muted text-popover">
                    Find Shared Auto
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Map View */}
            <Card className="p-4 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Autos Near You</h3>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Live
                </span>
              </div>
              <MapPlaceholder className="h-[400px]" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="font-bold text-2xl text-primary">12</div>
                  <div className="text-sm text-muted-foreground">Autos Available</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="font-bold text-2xl text-secondary">2 min</div>
                  <div className="text-sm text-muted-foreground">Avg. Wait Time</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6 shadow-lg">
              <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/events">
                  <Button variant="outline" className="w-full justify-start h-auto py-4" size="lg">
                    <Calendar className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Events Near You</div>
                      <div className="text-xs text-muted-foreground">Find shared rides to events</div>
                    </div>
                  </Button>
                </Link>
                <Link to="/history">
                  <Button variant="outline" className="w-full justify-start h-auto py-4" size="lg">
                    <History className="mr-3 h-5 w-5" />
                    <div className="text-left">
                      <div className="font-semibold">Ride History</div>
                      <div className="text-xs text-muted-foreground">View past trips</div>
                    </div>
                  </Button>
                </Link>
                <Link to="/safety">
                  <Button variant="outline" className="w-full justify-start h-auto py-4 border-destructive/50 hover:bg-destructive/10" size="lg">
                    <Shield className="mr-3 h-5 w-5 text-destructive" />
                    <div className="text-left">
                      <div className="font-semibold text-destructive">Safety & SOS</div>
                      <div className="text-xs text-muted-foreground">Emergency support</div>
                    </div>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Info Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
              <h3 className="font-semibold text-lg mb-2">Why Hop-Inn?</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Share rides on your route and save up to 50%</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Verified drivers with auto permits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Live tracking and in-app support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Event-based rides to festivals & concerts</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>;
};
export default Home;