import { Calendar, MapPin, IndianRupee, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";

const rides = [
  {
    id: 1,
    date: "Sep 15, 2024",
    time: "9:30 AM",
    from: "MG Road",
    to: "Hinjewadi IT Park",
    driver: "Rajesh Kumar",
    vehicle: "MH 02 AB 1234",
    fare: 45,
    rating: 5,
    status: "Completed",
  },
  {
    id: 2,
    date: "Sep 14, 2024",
    time: "6:15 PM",
    from: "Koregaon Park",
    to: "FC Road",
    driver: "Suresh Sharma",
    vehicle: "MH 02 CD 5678",
    fare: 32,
    rating: 4,
    status: "Completed",
  },
  {
    id: 3,
    date: "Sep 13, 2024",
    time: "2:45 PM",
    from: "Shivaji Nagar",
    to: "Viman Nagar",
    driver: "Amit Patel",
    vehicle: "MH 02 EF 9012",
    fare: 38,
    rating: 5,
    status: "Completed",
  },
];

const History = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Ride History</h1>
          <p className="text-muted-foreground mb-8">View your past rides and download receipts</p>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="text-4xl font-bold text-primary mb-2">23</div>
              <div className="text-sm text-muted-foreground">Total Rides</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-secondary/10 to-secondary/5">
              <div className="text-4xl font-bold text-secondary mb-2">₹892</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </Card>
            <Card className="p-6 text-center bg-gradient-to-br from-accent/10 to-primary/5">
              <div className="text-4xl font-bold text-accent mb-2">4.8</div>
              <div className="text-sm text-muted-foreground">Avg Rating Given</div>
            </Card>
          </div>

          {/* Rides List */}
          <div className="space-y-4">
            {rides.map((ride) => (
              <Card key={ride.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{ride.date}</h3>
                      <p className="text-sm text-muted-foreground">{ride.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 font-bold text-2xl text-primary">
                      <IndianRupee className="h-5 w-5" />
                      <span>{ride.fare}</span>
                    </div>
                    <span className="inline-block px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-full font-medium">
                      {ride.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Pickup</p>
                      <p className="text-sm text-muted-foreground">{ride.from}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Drop-off</p>
                      <p className="text-sm text-muted-foreground">{ride.to}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Driver</p>
                    <p className="font-medium">{ride.driver}</p>
                    <p className="text-xs text-muted-foreground">{ride.vehicle}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < ride.rating
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default History;
