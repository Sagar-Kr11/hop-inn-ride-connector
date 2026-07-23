import { useEffect, useState, useCallback } from "react";
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
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [hasDriverRow, setHasDriverRow] = useState<boolean | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [permitNumber, setPermitNumber] = useState("");
  const [registering, setRegistering] = useState(false);
  const [tab, setTab] = useState<string>(() => (searchParams.get("tab") === "driver" ? "driver" : "passenger"));

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionLoaded(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setSessionLoaded(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Keep tab in sync if the URL changes after mount.
  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "driver" && tab !== "driver") setTab("driver");
  }, [searchParams, tab]);

  // Query drivers whenever the auth user changes.
  useEffect(() => {
    let active = true;
    (async () => {
      if (!session?.user?.id) {
        setHasDriverRow(null);
        return;
      }
      const { data } = await supabase
        .from("drivers")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (!active) return;
      setHasDriverRow(!!data);
    })();
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  // Dedicated redirect effect — fires whenever any of these settle,
  // independent of the drivers-query effect, so no tab/session race can strand the user.
  useEffect(() => {
    if (tab === "driver" && session?.user?.id && hasDriverRow === true) {
      navigate("/driver", { replace: true });
    }
  }, [tab, session?.user?.id, hasDriverRow, navigate]);

  const checkDriverRow = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("drivers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    return !!data;
  }, []);

  const handleGoogle = async (mode: "passenger" | "driver") => {
    setGoogleLoading(true);

    // If already signed in, don't re-run OAuth — just route correctly.
    if (session?.user?.id) {
      if (mode === "driver") {
        const exists = await checkDriverRow(session.user.id);
        setGoogleLoading(false);
        if (exists) {
          navigate("/driver", { replace: true });
        } else {
          setHasDriverRow(false); // reveal the registration form
        }
      } else {
        setGoogleLoading(false);
        navigate(next, { replace: true });
      }
      return;
    }

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

    // Popup/inline flow: tokens returned synchronously, session was set by the wrapper.
    // Re-read the session directly rather than waiting on effects.
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user?.id;
    setSession(data.session);
    setGoogleLoading(false);
    if (!uid) return;
    if (mode === "driver") {
      const exists = await checkDriverRow(uid);
      setHasDriverRow(exists);
      if (exists) navigate("/driver", { replace: true });
    } else {
      navigate(next, { replace: true });
    }
  };

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

    // Defensive pre-check: if a drivers row already exists, skip insert and route.
    const already = await checkDriverRow(session.user.id);
    if (already) {
      setRegistering(false);
      setHasDriverRow(true);
      toast({ title: "Already registered", description: "You're already a Hop-Inn driver. Taking you to the dashboard." });
      navigate("/driver", { replace: true });
      return;
    }

    console.log("[Auth] inserting drivers row for", session.user.id);
    const { error: dErr } = await supabase.from("drivers").insert({
      user_id: session.user.id,
      vehicle_number: vehicleNumber.trim(),
      permit_number: permitNumber.trim(),
      vehicle_type: "auto",
      is_online: false,
      is_verified: false,
    });
    if (dErr) {
      // Postgres unique_violation — treat as "already registered".
      if ((dErr as any).code === "23505" || /duplicate key|unique/i.test(dErr.message)) {
        console.log("[Auth] insert returned unique_violation; row already exists");
        setHasDriverRow(true);
        setRegistering(false);
        toast({ title: "Already registered", description: "This account is already a Hop-Inn driver." });
        navigate("/driver", { replace: true });
        return;
      }
      console.error("[Auth] drivers insert failed", dErr);
      setRegistering(false);
      toast({ title: "Registration failed", description: dErr.message, variant: "destructive" });
      return;
    }
    console.log("[Auth] drivers insert succeeded; polling for SELECT visibility");

    // Confirm the row is actually SELECT-able (same query Driver.tsx runs) before navigating.
    let confirmed = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      const { data: check, error: checkErr } = await supabase
        .from("drivers")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();
      console.log("[Auth] confirm attempt", attempt, "->", !!check, checkErr?.message ?? "");
      if (check) {
        confirmed = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 400));
    }

    if (!confirmed) {
      console.error("[Auth] drivers row never became SELECT-able after 5 attempts");
      setRegistering(false);
      toast({
        title: "Registration saved, but not visible yet",
        description: "Please try signing in again in a moment.",
        variant: "destructive",
      });
      return;
    }

    // Additive role; unique(user_id, role) means we ignore duplicate errors
    await supabase.from("user_roles").insert({ user_id: session.user.id, role: "driver" });
    setHasDriverRow(true);
    setRegistering(false);
    console.log("[Auth] confirmed; navigating to /driver");
    toast({ title: "Welcome, driver!", description: "Your registration is submitted for verification." });
    navigate("/driver", { replace: true, state: { justRegistered: true } });
  };

  const needsDriverProfile = tab === "driver" && session?.user && hasDriverRow === false;
  const driverAwaitingCheck = tab === "driver" && session?.user && hasDriverRow === null;

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
            <p className="text-muted-foreground">Sign in or create your account — same button works for both.</p>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="passenger">Passenger</TabsTrigger>
              <TabsTrigger value="driver">Driver</TabsTrigger>
            </TabsList>

            <TabsContent value="passenger" className="space-y-4">
              {session?.user ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-primary/10 p-3 text-sm">
                    Signed in as <strong>{session.user.email ?? session.user.phone ?? "your account"}</strong>.
                  </div>
                  <Button className="w-full" size="lg" onClick={() => navigate(next, { replace: true })}>
                    Continue to Hop-Inn
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={async () => {
                      await supabase.auth.signOut();
                    }}
                  >
                    Sign out
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="outline" className="w-full" onClick={() => handleGoogle("passenger")} disabled={googleLoading}>
                    {googleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue with Google (sign in or sign up)
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
                </>
              )}
            </TabsContent>

            <TabsContent value="driver" className="space-y-4">
              {!sessionLoaded ? (
                <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Checking your session…
                </p>
              ) : !session ? (
                <>
                  <Button variant="outline" className="w-full" onClick={() => handleGoogle("driver")} disabled={googleLoading}>
                    {googleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue with Google (sign in or sign up)
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Returning drivers go straight to the dashboard. New drivers add vehicle & permit next.
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
              ) : driverAwaitingCheck ? (
                <p className="text-sm text-muted-foreground text-center flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Looking up your driver profile…
                </p>
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
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={async () => {
                      await supabase.auth.signOut();
                    }}
                  >
                    Use a different account
                  </Button>
                </>
              ) : hasDriverRow ? (
                <div className="text-center space-y-4">
                  <p className="text-sm">You're already registered as a driver. Redirecting…</p>
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
