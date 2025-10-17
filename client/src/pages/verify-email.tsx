import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Mail, RefreshCw } from "lucide-react";
import logoImage from "@assets/wishkeepers-logo-1024x300_1755001701704.png";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/verify-email/:email");
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const email = params?.email ? decodeURIComponent(params.email) : "";

  useEffect(() => {
    if (!email) {
      setLocation("/register");
    }
  }, [email, setLocation]);

  const verifyMutation = useMutation({
    mutationFn: async (verificationCode: string) => {
      const response = await apiRequest("POST", "/api/verify-email", {
        email,
        code: verificationCode
      });
      return response;
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success!",
        description: "Email verified successfully. Redirecting to dashboard...",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      setTimeout(() => setLocation("/dashboard"), 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/resend-verification", {
        email
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Code Sent",
        description: "A new verification code has been sent to your email.",
      });
      setCode("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      verifyMutation.mutate(code);
    } else {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
    }
  };

  const handleResend = () => {
    resendMutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src={logoImage} 
              alt="Wishkeepers" 
              className="h-12 w-auto"
            />
          </div>
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-gray-600">
            We've sent a verification code to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                data-testid="input-verification-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(value);
                }}
                maxLength={6}
                className="text-center text-2xl tracking-widest font-mono"
                autoComplete="off"
              />
            </div>

            <Button 
              type="submit" 
              data-testid="button-verify"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={verifyMutation.isPending || code.length !== 6}
            >
              {verifyMutation.isPending ? "Verifying..." : "Verify Email"}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Can't find the email?</strong>
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Please check your spam or junk folder. The email should arrive within a few minutes.
              </p>
            </div>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                data-testid="button-resend-code"
                onClick={handleResend}
                disabled={resendMutation.isPending}
                className="text-blue-600 hover:text-blue-700"
              >
                {resendMutation.isPending ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
