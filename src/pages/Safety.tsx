import { useEffect, useState } from "react";
import { Shield, Phone, AlertCircle, Users, MapPin, Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type Contact = { name: string; phone_number: string };

const emptyContacts: Contact[] = [
  { name: "", phone_number: "" },
  { name: "", phone_number: "" },
  { name: "", phone_number: "" },
];

const Safety = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>(emptyContacts);
  const [saving, setSaving] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const loadContacts = async (uid: string) => {
    const { data } = await supabase
      .from("emergency_contacts")
      .select("name, phone_number")
      .eq("user_id", uid)
      .order("created_at", { ascending: true });
    const filled = [...emptyContacts];
    (data || []).slice(0, 3).forEach((c, i) => {
      filled[i] = { name: c.name, phone_number: c.phone_number };
    });
    setContacts(filled);
  };

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user.id ?? null;
      setUserId(uid);
      if (uid) loadContacts(uid);
    });
    // Reactive updates — fixes stale-null userId after OAuth redirect / late hydration
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user.id ?? null;
      setUserId(uid);
      if (uid) loadContacts(uid);
    });
    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const updateContact = (i: number, field: keyof Contact, val: string) => {
    setContacts((prev) => prev.map((c, idx) => (idx === i ? { ...c, [field]: val } : c)));
  };

  const normalizePhone = (raw: string): string | null => {
    const cleaned = raw.replace(/[\s\-()]/g, "");
    if (/^\+[1-9]\d{7,14}$/.test(cleaned)) return cleaned;
    const digits = cleaned.replace(/\D/g, "");
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    return null;
  };

  const handleSave = async () => {
    if (!userId) {
      navigate("/auth?next=/safety");
      return;
    }
    setSaving(true);
    const filled = contacts.filter((c) => c.name.trim() && c.phone_number.trim());
    const invalid: string[] = [];
    const rows = filled.flatMap((c) => {
      const normalized = normalizePhone(c.phone_number);
      if (!normalized) {
        invalid.push(`${c.name.trim()} (${c.phone_number})`);
        return [];
      }
      return [{ user_id: userId, name: c.name.trim(), phone_number: normalized }];
    });
    if (invalid.length > 0) {
      setSaving(false);
      toast({
        title: "Invalid phone number",
        description: `Use 10-digit Indian numbers or +country format. Fix: ${invalid.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    // Replace strategy: delete existing then insert
    await supabase.from("emergency_contacts").delete().eq("user_id", userId);
    if (rows.length > 0) {
      const { error } = await supabase.from("emergency_contacts").insert(rows);
      if (error) {
        setSaving(false);
        toast({ title: "Save failed", description: error.message, variant: "destructive" });
        return;
      }
    }
    setSaving(false);
    toast({ title: "Contacts saved", description: `${rows.length} emergency contact${rows.length === 1 ? "" : "s"} on file.` });
    if (userId) loadContacts(userId);
  };

  const handleSOS = async () => {
    if (!userId) {
      toast({ title: "Sign in required", description: "Please sign in so we know who to alert and can reach your emergency contacts.", variant: "destructive" });
      navigate("/auth?next=/safety");
      return;
    }
    setTriggering(true);
    let pos: GeolocationPosition | null = null;
    try {
      pos = await new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000 }),
      );
    } catch {
      /* keep going even without location */
    }
    const { data, error } = await supabase.functions.invoke("trigger-sos", {
      body: { latitude: pos?.coords.latitude, longitude: pos?.coords.longitude },
    });
    setTriggering(false);
    if (error || (data as any)?.error) {
      toast({ title: "SOS failed", description: (data as any)?.error || error?.message, variant: "destructive" });
      return;
    }
    const d = data as any;
    if (d.contacts_total === 0) {
      toast({
        title: "🚨 SOS logged",
        description: "Alert saved, but you have no emergency contacts on file. Add contacts below so SMS can go out next time.",
      });
      return;
    }
    toast({
      title: "🚨 SOS sent",
      description: `Logged. Notified ${d.sms_sent}/${d.contacts_total} contact${d.contacts_total === 1 ? "" : "s"}.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container px-4 py-8">
        <div className="text-center mb-14">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-5">
            <Shield className="h-10 w-10 text-destructive" strokeWidth={1.75} />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">Your Safety Matters</h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Hop-Inn keeps riders and drivers safe with instant SOS, verified drivers, and live trip sharing.
          </p>
        </div>

        <Card className="p-8 mb-8 border-2 border-destructive/50 shadow-lg">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive flex items-center justify-center gap-2">
              <AlertCircle className="h-8 w-8" />
              Emergency SOS
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Press to alert your emergency contacts with your live location.
            </p>
            <Button
              onClick={handleSOS}
              disabled={triggering}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-20 w-20 rounded-full text-xl font-bold shadow-lg"
            >
              {triggering ? <Loader2 className="h-6 w-6 animate-spin" /> : "SOS"}
            </Button>
            <p className="text-sm text-muted-foreground">Tap once • Contacts notified via SMS</p>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Safety Features</h2>
            <Card className="p-6">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Live Trip Tracking</h3>
                  <p className="text-sm text-muted-foreground">Real-time driver location on your ride map, updated live.</p>
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
                  <p className="text-sm text-muted-foreground">Vehicle & permit numbers verified. Ratings from real rides.</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">One-tap SMS Alerts</h3>
                  <p className="text-sm text-muted-foreground">SOS pings every contact via Twilio SMS with your live coordinates.</p>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex gap-4">
                <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">SOS Log</h3>
                  <p className="text-sm text-muted-foreground">Every SOS is logged server-side, even if SMS delivery fails.</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Emergency Contacts</h2>
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Your Trusted Contacts</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add up to 3 emergency contacts who will receive an SMS when you press SOS.
              </p>
              <div className="space-y-4">
                {contacts.map((c, i) => (
                  <div key={i} className="space-y-2 pt-2 border-t border-border first:border-0 first:pt-0">
                    <Label>Contact {i + 1} Name</Label>
                    <Input
                      placeholder="Name"
                      value={c.name}
                      onChange={(e) => updateContact(i, "name", e.target.value)}
                    />
                    <Label>Contact {i + 1} Phone</Label>
                    <Input
                      type="tel"
                      placeholder="9876543210 or +919876543210"
                      value={c.phone_number}
                      onChange={(e) => updateContact(i, "phone_number", e.target.value)}
                    />
                  </div>
                ))}
                <Button className="w-full mt-4" onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Emergency Contacts
                </Button>
                {!userId && (
                  <p className="text-xs text-muted-foreground text-center">Sign in to save contacts.</p>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-destructive/5 to-destructive/10">
              <h3 className="font-semibold text-lg mb-4">Emergency Helplines</h3>
              <div className="space-y-3">
                <a href="tel:100"><Button variant="outline" className="w-full justify-between h-auto py-4">
                  <div className="text-left"><div className="font-semibold">Police</div><div className="text-xs text-muted-foreground">National Emergency</div></div>
                  <div className="text-xl font-bold">100</div>
                </Button></a>
                <a href="tel:1091"><Button variant="outline" className="w-full justify-between h-auto py-4">
                  <div className="text-left"><div className="font-semibold">Women Helpline</div><div className="text-xs text-muted-foreground">24x7 Support</div></div>
                  <div className="text-xl font-bold">1091</div>
                </Button></a>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Safety;
