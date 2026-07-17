import { useState } from "react";
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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

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
    navigate("/");
  };

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

          <Tabs defaultValue="passenger" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="passenger">Passenger</TabsTrigger>
              <TabsTrigger value="driver">Driver</TabsTrigger>
            </TabsList>

            <TabsContent value="passenger" className="space-y-4">
              {!showOtp ? (
                <>
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <Button className="w-full" size="lg" onClick={handleSendOtp} disabled={sending}>
                    {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Send OTP
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="6-digit code"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="mt-2 text-center text-2xl tracking-widest"
                    />
                    <p className="text-xs text-muted-foreground mt-2">Sent to {normalizePhone(phoneNumber)}</p>
                  </div>
                  <Button className="w-full" size="lg" onClick={handleVerify} disabled={verifying || otp.length < 6}>
                    {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify & Continue
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={() => { setShowOtp(false); setOtp(""); }}>
                    Change number / Resend
                  </Button>
                </>
              )}
            </TabsContent>

            <TabsContent value="driver" className="space-y-4">
              <div>
                <Label htmlFor="driver-name">Full Name</Label>
                <Input id="driver-name" placeholder="Enter your name" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="driver-phone">Phone Number</Label>
                <Input id="driver-phone" type="tel" placeholder="+91 XXXXX XXXXX" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="vehicle">Vehicle Number</Label>
                <Input id="vehicle" placeholder="MH XX XX XXXX" className="mt-2" />
              </div>
              <div>
                <Label htmlFor="permit">Auto Permit Number</Label>
                <Input id="permit" placeholder="Enter permit number" className="mt-2" />
              </div>
              <Button className="w-full" size="lg">Register as Driver</Button>
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
