import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import logoAsset from "@/assets/hop-inn-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "@/hooks/use-toast";

const sanitizeNext = (raw: string | null): string => {
  if (!raw) return "/";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/";
  return raw;
};

const normalizePhone = (raw: string) => {
  const trimmed = raw.replace(/\s|-/g, "");
  if (/^\+\d{7,15}$/.test(trimmed)) return trimmed;
  if (/^\d{10}$/.test(trimmed)) return `+91${trimmed}`;
  return null;
};

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = sanitizeNext(searchParams.get("next"));

  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Driver profile
  const [session, setSession] = useState<any>(null);
  const [hasDriverRow, setHasDriverRow] = useState<boolean | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [permitNumber, setPermitNumber] = useState("");
  const [registering, setRegistering] = useState(false);
  const [tab, setTab] = useState("passenger");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    (async () => {
      if (!session?.user?.id) {
        setHasDriverRow(null);
        return;
      }
      const { data } = await supabase.from("drivers").select("id").eq("user_id", session.user.id).maybeSingle();
      setHasDriverRow(!!data);
      // If they arrived here for driver flow and already have a driver row → go straight to /driver
      if (data && tab === "driver") navigate("/driver");
    })();
  }, [session?.user?.id, tab, navigate]);

  const handleGoogle = async (mode: "passenger" | "driver") => {
    setGoogleLoading(true);
    const nextPath = mode === "driver" ? "/auth?tab=driver" : next;
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}${nextPath}`,
    });
    if (result.error) {
      setGoogleLoading(false);
      toast({ title: "Google sign-in failed", description: result.error.message, variant: "destructive" });
      return;
    }
    if (result.redirected) return;
    setGoogleLoading(false);
    if (mode === "passenger") navigate(next);
    // driver mode: stay on this page, effect will route to /driver or show reg form
  };

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "driver") setTab("driver");
  }, [searchParams]);

  const handleSendOtp = async () => {
    const phone = normalizePhone(phoneNumber);
    if (!phone) {
      toast({ title: "Invalid phone", description: "Use 10-digit Indian number or +country format.", variant: "destructive" });
      return;
    }
    setSending(true);
    const { data, error } = await supabase.functions.invoke("send-otp", { body: { phone } });
    setSending(false);
    if (error || (data as any)?.error) {
      toast({ title: "Could not send OTP", description: (data as any)?.error || error?.message, variant: "destructive" });
      return;
    }
    toast({ title: "OTP sent", description: `Code sent via SMS to ${phone}` });
    setShowOtp(true);
  };

  const handleVerify = async () => {
    const phone = normalizePhone(phoneNumber);
    if (!phone || otp.length < 4) return;
    setVerifying(true);
    const { data, error } = await supabase.functions.invoke("verify-otp", { body: { phone, code: otp } });
    setVerifying(false);
    if (error || (data as any)?.error) {
      toast({ title: "Verification failed", description: (data as any)?.error || error?.message, variant: "destructive" });
      return;
    }
    toast({ title: "Welcome to Hop-Inn!", description: `Verified ${phone}` });
    navigate(next);
  };

  const handleDriverRegister = async () => {
    if (!session?.user?.id) return;
    if (!vehicleNumber.trim() || !permitNumber.trim()) {
      toast({ title: "Missing details", description: "Vehicle number and permit number are required.", variant: "destructive" });
      return;
    }
    setRegistering(true);
    const { error: dErr } = await supabase.from("drivers").insert({
      user_id: session.user.id,
      vehicle_number: vehicleNumber.trim(),
      permit_number: permitNumber.trim(),
      vehicle_type: "auto",
      is_online: false,
      is_verified: false,
    });
    if (dErr) {
      setRegistering(false);
      toast({ title: "Registration failed", description: dErr.message, variant: "destructive" });
      return;
    }
    // Additive role; unique(user_id, role) means we ignore duplicate errors
    await supabase.from("user_roles").insert({ user_id: session.user.id, role: "driver" });
    setRegistering(false);
    toast({ title: "Welcome, driver!", description: "Your registration is submitted for verification." });
    navigate("/driver");
  };

  const needsDriverProfile = tab === "driver" && session?.user && hasDriverRow === false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>

        <Card className="p-8 shadow-2xl">
          <div className="text-center mb-6">
            <img src={logoAsset.url} alt="Hop-Inn logo" className="mx-auto mb-4 h-16 w-16 rounded-full object-cover" />
            <h1 className="text-2xl font-bold mb-2">Welcome to Hop-Inn</h1>
            <p className="text-muted-foreground">Login or create your account</p>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="passenger">Passenger</TabsTrigger>
              <TabsTrigger value="driver">Driver</TabsTrigger>
            </TabsList>

            <TabsContent value="passenger" className="space-y-4">
              <Button variant="outline" className="w-full" onClick={() => handleGoogle("passenger")} disabled={googleLoading}>
                {googleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue with Google
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or use phone</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {!showOtp ? (
                <>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+91 XXXXX XXXXX" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="mt-2" />
                  </div>
                  <Button className="w-full" size="lg" onClick={handleSendOtp} disabled={sending}>
                    {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Send OTP
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input id="otp" type="text" placeholder="6-digit code" maxLength={6}
                      value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="mt-2 text-center text-2xl tracking-widest" />
                    <p className="text-xs text-muted-foreground mt-2">Sent to {normalizePhone(phoneNumber)}</p>
                  </div>
                  <Button className="w-full" size="lg" onClick={handleVerify} disabled={verifying || otp.length < 6}>
                    {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Verify & Continue
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => { setShowOtp(false); setOtp(""); }}>Change number / Resend</Button>
                </>
              )}
            </TabsContent>

            <TabsContent value="driver" className="space-y-4">
              {!session ? (
                <>
                  <Button variant="outline" className="w-full" onClick={() => handleGoogle("driver")} disabled={googleLoading}>
                    {googleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue with Google
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    We use Google to verify driver identity. Vehicle & permit come next.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-xs text-muted-foreground">phone OTP (coming soon)</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input type="tel" placeholder="+91 XXXXX XXXXX" className="mt-2" disabled />
                  </div>
                </>
              ) : needsDriverProfile ? (
                <>
                  <div className="rounded-lg bg-primary/10 p-3 text-sm">
                    Signed in as <strong>{session.user.email}</strong>. Complete your driver profile below.
                  </div>
                  <div>
                    <Label htmlFor="vehicle">Vehicle Number</Label>
                    <Input id="vehicle" placeholder="MH XX XX XXXX" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="permit">Auto Permit Number</Label>
                    <Input id="permit" placeholder="Enter permit number" value={permitNumber} onChange={(e) => setPermitNumber(e.target.value)} className="mt-2" />
                  </div>
                  <Button className="w-full" size="lg" onClick={handleDriverRegister} disabled={registering}>
                    {registering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Register as Driver
                  </Button>
                </>
              ) : hasDriverRow ? (
                <div className="text-center space-y-4">
                  <p className="text-sm">You're already registered as a driver.</p>
                  <Link to="/driver"><Button className="w-full" size="lg">Go to Driver Dashboard</Button></Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center">Loading…</p>
              )}
            </TabsContent>
          </Tabs>

          <p className="text-xs text-center text-muted-foreground mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
