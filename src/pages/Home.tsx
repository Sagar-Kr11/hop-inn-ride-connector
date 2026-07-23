import { DollarSign, Zap, Users, MapPin, Clock, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-auto-rickshaw.jpg";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const marqueeItems = [
  "SAVE MONEY",
  "REDUCE TRAFFIC",
  "TRAVEL TOGETHER",
  "ECO-FRIENDLY",
  "CONVENIENT",
  "SAFE",
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[500px] md:min-h-[600px]">
          {/* Background image */}
          <div className="absolute inset-0">
            <img
              src={heroImage}
              alt="Hop-Inn auto rickshaw with happy passengers on Indian street"
              className="w-full h-full object-cover"
              width={1920}
              height={1080}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          </div>

          {/* Hero content */}
          <div className="container px-4 py-16 md:py-24 relative z-10">
            <div className="max-w-xl space-y-6">
              <div className="inline-block px-5 py-2 rounded-full text-sm font-semibold bg-primary text-primary-foreground">
                Shared Auto Rides
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Your Ride,{" "}
                <span className="text-primary underline decoration-primary underline-offset-4">
                  Your Way
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Share auto rides on your route. Save money, reduce traffic, and
                travel together with Hop-Inn.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/booking">
                  <Button variant="hero" size="lg" className="text-base font-semibold px-8">
                    Book a Ride
                  </Button>
                </Link>
                <Link to="/auth?tab=driver&next=/driver">
                  <Button variant="charcoal" size="lg" className="text-base font-semibold px-8">
                    Drive with Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Marquee Banner */}
      <section className="bg-foreground text-background py-3 overflow-hidden">
        <div className="marquee-track flex whitespace-nowrap">
          {[...Array(3)].map((_, setIndex) =>
            marqueeItems.map((item, i) => (
              <span key={`${setIndex}-${i}`} className="mx-4 text-sm font-bold tracking-widest uppercase flex items-center gap-4">
                {item}
                <span className="text-primary">•</span>
              </span>
            ))
          )}
        </div>
      </section>

      {/* Why Choose Hop-Inn */}
      <section className="container px-4 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">
          Why Choose Hop-Inn?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-8 border-2 border-border hover:shadow-lg transition-shadow">
            <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-5">
              <DollarSign className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Affordable</h3>
            <p className="text-muted-foreground">
              Share auto rides on your route. Save money, reduce traffic, and travel together affordably.
            </p>
          </Card>

          <Card className="p-8 border-2 border-border hover:shadow-lg transition-shadow">
            <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-5">
              <Zap className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Efficient</h3>
            <p className="text-muted-foreground">
              Smart routing matches you with co-riders heading your way, cutting empty seats and congestion.
            </p>
          </Card>

          <Card className="p-8 border-2 border-border hover:shadow-lg transition-shadow">
            <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-5">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Community-Driven</h3>
            <p className="text-muted-foreground">
              Built for Indian cities — supporting local drivers and communities while making shared travel easy for everyone.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card border-y border-border">
        <div className="container px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-10">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", icon: MapPin, title: "Enter Your Route", desc: "Tell us your pickup and drop-off locations" },
              { step: "2", icon: Users, title: "Get Matched", desc: "We find co-riders heading your way" },
              { step: "3", icon: Clock, title: "Ride Together", desc: "Share an auto and split the fare" },
              { step: "4", icon: Star, title: "Rate & Save", desc: "Rate your ride and enjoy savings" },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="text-sm font-bold text-primary">Step {item.step}</div>
                <h4 className="text-lg font-bold text-foreground">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile app coming soon (placeholder — no fake store badges) */}
      <section className="bg-foreground text-background">
        <div className="container px-4 py-16 md:py-20 text-center max-w-2xl mx-auto space-y-5">
          <div className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground">
            Planned — Not Yet Available
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
            A Mobile App Is On The Way
          </h2>
          <p className="text-background/70 text-lg">
            For now, Hop-Inn runs as a responsive web app — book rides, track drivers, and manage safety contacts from any phone browser. Native Android & iOS apps are on our roadmap.
          </p>
          <Link to="/booking" className="inline-block pt-2">
            <Button variant="hero" size="lg" className="text-base font-semibold px-8">
              Try It In Your Browser
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 py-16">
        <Card className="p-10 md:p-16 bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Hop In?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of riders saving money and reducing traffic. Book your first shared auto ride today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/booking">
              <Button variant="hero" size="lg" className="text-base font-semibold px-8">
                Book a Ride
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/events">
              <Button variant="outline" size="lg" className="text-base font-semibold px-8">
                Browse Events
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
