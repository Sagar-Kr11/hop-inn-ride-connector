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
                <Link to="/driver">
                  <Button variant="secondary" size="lg" className="text-base font-semibold px-8">
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
              Efficient routing converts traffic, and travel traffic accessible for everyone on the go.
            </p>
          </Card>

          <Card className="p-8 border-2 border-border hover:shadow-lg transition-shadow">
            <div className="h-14 w-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-5">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">Community-Driven</h3>
            <p className="text-muted-foreground">
              Community-driven to support Indian community and communities, building connections through travel.
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

      {/* Download App Section */}
      <section className="bg-foreground text-background">
        <div className="container px-4 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground">
                Coming Soon
              </div>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Get the Hop-Inn App
              </h2>
              <p className="text-background/70 text-lg max-w-md">
                Book rides, track your auto in real-time, and manage everything from your pocket. Available soon on Android & iOS.
              </p>
              <div className="flex flex-wrap gap-4">
                {/* Google Play Badge */}
                <a href="#" className="inline-block transition-transform hover:scale-105">
                  <div className="flex items-center gap-3 bg-background/10 border border-background/20 rounded-xl px-5 py-3">
                    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302L15.396 12l2.302-2.492zM5.864 3.387l10.937 6.333-2.302 2.302L5.864 3.387z"/>
                    </svg>
                    <div>
                      <div className="text-xs text-background/60 uppercase tracking-wide">Get it on</div>
                      <div className="text-base font-semibold">Google Play</div>
                    </div>
                  </div>
                </a>
                {/* App Store Badge */}
                <a href="#" className="inline-block transition-transform hover:scale-105">
                  <div className="flex items-center gap-3 bg-background/10 border border-background/20 rounded-xl px-5 py-3">
                    <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <div>
                      <div className="text-xs text-background/60 uppercase tracking-wide">Download on the</div>
                      <div className="text-base font-semibold">App Store</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={phoneMockup}
                alt="Hop-Inn mobile app showing ride booking interface"
                className="max-h-[450px] w-auto drop-shadow-2xl"
                loading="lazy"
                width={512}
                height={1024}
              />
            </div>
          </div>
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
