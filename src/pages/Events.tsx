import { Calendar, MapPin, Users, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import eventIllustration from "@/assets/event-illustration.jpg";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const Events = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <img 
            src={eventIllustration} 
            alt="Festive street event" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>
        
        <div className="container px-4 py-16 relative">
          <div className="max-w-2xl">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              Hyperlocal Event Rides
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Events Near You
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Find shared auto rides to festivals, concerts, and local events. Travel together, save money, and never miss the fun!
            </p>
            <div className="flex gap-4">
              <Button variant="hero" size="lg">
                <Calendar className="mr-2 h-5 w-5" />
                Browse Events
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="container px-4 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">{events?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Active Events</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-secondary mb-1">105</div>
            <div className="text-sm text-muted-foreground">Autos Available</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-accent mb-1">22K+</div>
            <div className="text-sm text-muted-foreground">Expected Attendees</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">₹15-40</div>
            <div className="text-sm text-muted-foreground">Avg Shared Fare</div>
          </Card>
        </div>

        {/* Events List */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
          <p className="text-muted-foreground mb-6">
            Book shared rides to popular events in your area
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No upcoming events found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event) => {
              const eventDate = new Date(event.event_date);
              const formattedDate = format(eventDate, "MMM dd, yyyy");
              const formattedTime = format(eventDate, "h:mm a");
              
              return (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {event.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={event.image_url} 
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          {event.location_name}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          {formattedDate}
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          {formattedTime}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-primary">High Demand</div>
                        <div className="text-xs text-muted-foreground">Book early</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Link to="/booking" className="w-full">
                        <Button variant="secondary" className="w-full">
                          Go to Event
                        </Button>
                      </Link>
                      <Button variant="outline" className="w-full">
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
          </div>
        )}

        {/* Info Section */}
        <Card className="mt-8 p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
          <h3 className="text-2xl font-bold mb-4">How Event Rides Work</h3>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl mb-3">
                🎯
              </div>
              <h4 className="font-semibold">Find Your Event</h4>
              <p className="text-sm text-muted-foreground">
                Browse events happening near you and select where you want to go
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center text-2xl mb-3">
                🚕
              </div>
              <h4 className="font-semibold">Share the Ride</h4>
              <p className="text-sm text-muted-foreground">
                Get matched with other attendees heading to the same event
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-2xl mb-3">
                💰
              </div>
              <h4 className="font-semibold">Save & Enjoy</h4>
              <p className="text-sm text-muted-foreground">
                Split the fare, arrive together, and enjoy the event hassle-free
              </p>
            </div>
            <div className="space-y-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl mb-3">
                🤝
              </div>
              <h4 className="font-semibold">Connect with People</h4>
              <p className="text-sm text-muted-foreground">
                Create a random group and enjoy your travel back n forth
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Events;
