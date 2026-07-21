import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import eventIllustration from "@/assets/event-festival.jpg";
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

      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <img src={eventIllustration} alt="Festive street event" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
        </div>

        <div className="container px-4 py-16 relative">
          <div className="max-w-2xl">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary mb-4">
              Hyperlocal Event Rides
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Events Near You</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Find shared auto rides to festivals, concerts, and local events across India. Travel together, save money, and never miss the fun!
            </p>
          </div>
        </div>
      </section>

      <main className="container px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">{events?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Active Events</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-secondary mb-1">Live</div>
            <div className="text-sm text-muted-foreground">Auto Matching</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-accent mb-1">3</div>
            <div className="text-sm text-muted-foreground">Cities Covered</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-3xl font-bold text-primary mb-1">₹15-40</div>
            <div className="text-sm text-muted-foreground">Avg Shared Fare</div>
          </Card>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
          <p className="text-muted-foreground mb-6">Tap an event to book a shared event ride straight to the venue</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading events...</div>
        ) : !events || events.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No upcoming events found</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event) => {
              const eventDate = new Date(event.event_date);
              const bookingHref = `/booking?event_id=${event.id}&event_name=${encodeURIComponent(event.name)}&lat=${event.location_latitude}&lng=${event.location_longitude}&dest=${encodeURIComponent(event.location_name)}`;
              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {event.image_url && (
                    <div className="h-48 overflow-hidden">
                      <img src={event.image_url} alt={event.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{event.name}</h3>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{event.description}</p>
                      )}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />{event.location_name}</p>
                        <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />{format(eventDate, "MMM dd, yyyy")}</p>
                        <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{format(eventDate, "h:mm a")}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Link to={bookingHref}>
                        <Button className="w-full">
                          Book Shared Ride to Event
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Events;
