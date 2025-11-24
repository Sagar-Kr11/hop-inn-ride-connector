import { Shield, Phone, AlertCircle, Users, MapPin, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";

const Safety = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <Shield className="h-10 w-10 text-destructive" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Your Safety Matters</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hop-Inn is committed to ensuring safe rides for all passengers and drivers. Access emergency features and safety resources here.
          </p>
        </div>

        {/* Emergency SOS */}
        <Card className="p-8 mb-8 border-2 border-destructive/50 shadow-lg">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-8 w-8" />
              Emergency SOS
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              In case of emergency, press the button below to alert authorities and your emergency contacts
            </p>
            <Button 
              size="lg" 
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-20 w-20 rounded-full text-2xl font-bold shadow-lg hover:shadow-xl"
            >
              SOS
            </Button>
            <p className="text-sm text-muted-foreground">
              Tap once to trigger alert • Authorities will be notified immediately
            </p>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Safety Features */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Safety Features</h2>
            
            <Card className="p-6">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Live Trip Tracking</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your live location with trusted contacts. They can track your ride in real-time from pickup to drop-off.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Verified Drivers</h3>
                  <p className="text-sm text-muted-foreground">
                    All drivers undergo background verification. View driver details, ratings, and vehicle information before your ride.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">24/7 Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Our support team is available round the clock. Call, chat, or trigger an emergency alert anytime.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Smart Alerts</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified if your ride deviates from route or if there's an extended stop. Automatic alerts to emergency contacts.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Emergency Contacts</h2>
            
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Your Trusted Contacts</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add up to 3 emergency contacts who will be notified in case of an alert
              </p>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contact1-name">Contact 1 Name</Label>
                  <Input id="contact1-name" placeholder="Name" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="contact1-phone">Contact 1 Phone</Label>
                  <Input id="contact1-phone" type="tel" placeholder="+91 XXXXX XXXXX" className="mt-2" />
                </div>
                
                <div className="pt-2">
                  <Label htmlFor="contact2-name">Contact 2 Name</Label>
                  <Input id="contact2-name" placeholder="Name" className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="contact2-phone">Contact 2 Phone</Label>
                  <Input id="contact2-phone" type="tel" placeholder="+91 XXXXX XXXXX" className="mt-2" />
                </div>

                <Button className="w-full mt-4">Save Emergency Contacts</Button>
              </div>
            </Card>

            {/* Quick Dial */}
            <Card className="p-6 bg-gradient-to-br from-destructive/5 to-destructive/10">
              <h3 className="font-semibold text-lg mb-4">Emergency Helplines</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-between h-auto py-4">
                  <div className="text-left">
                    <div className="font-semibold">Police</div>
                    <div className="text-xs text-muted-foreground">National Emergency</div>
                  </div>
                  <div className="text-xl font-bold">100</div>
                </Button>
                
                <Button variant="outline" className="w-full justify-between h-auto py-4">
                  <div className="text-left">
                    <div className="font-semibold">Women Helpline</div>
                    <div className="text-xs text-muted-foreground">24x7 Support</div>
                  </div>
                  <div className="text-xl font-bold">1091</div>
                </Button>
                
                <Button variant="outline" className="w-full justify-between h-auto py-4">
                  <div className="text-left">
                    <div className="font-semibold">Hop-Inn Support</div>
                    <div className="text-xs text-muted-foreground">Ride Assistance</div>
                  </div>
                  <Phone className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Safety Tips */}
        <Card className="mt-8 p-8 bg-gradient-to-br from-primary/5 to-secondary/5">
          <h3 className="text-2xl font-bold mb-6 text-center">Safety Tips</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">✓</div>
              <h4 className="font-semibold">Verify Driver Details</h4>
              <p className="text-sm text-muted-foreground">
                Always check driver photo, name, and vehicle number before boarding
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">📍</div>
              <h4 className="font-semibold">Share Your Trip</h4>
              <p className="text-sm text-muted-foreground">
                Let friends or family track your ride in real-time
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl mb-2">👥</div>
              <h4 className="font-semibold">Trust Your Instincts</h4>
              <p className="text-sm text-muted-foreground">
                If something feels wrong, use the SOS button immediately
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Safety;
