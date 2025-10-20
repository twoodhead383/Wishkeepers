import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Lock, Heart, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import logoImage from "@assets/wishkeepers-logo-1024x300_1755001701704.png";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const formSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(200, "Name too long"),
  email: z.string().email("Invalid email address").max(320, "Email too long"),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must agree to receive updates",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function ComingSoon() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      consent: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/interested-parties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to register your interest");
      }
      
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      toast({
        title: "Thank you!",
        description: "We'll notify you when Wishkeepers launches.",
      });
    },
    onError: (error: any) => {
      const message = error.message || "Failed to register your interest";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-6">
            <img 
              src={logoImage} 
              alt="Wishkeepers" 
              className="h-20 w-auto"
              data-testid="img-logo"
            />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Your Digital Legacy Vault
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 md:p-12">
          {!submitted ? (
            <>
              {/* Coming Soon Badge */}
              <div className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
                Coming Soon
              </div>

              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Secure Your Legacy, Protect Your Loved Ones
              </h2>

              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                Wishkeepers is a secure digital vault designed to help you store
                and share your most important information when it matters most.
              </p>

              {/* Feature List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Bank-Level Security
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Your sensitive information protected with AES-256 encryption
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Peace of Mind
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Store funeral wishes, gifting details, important information, and personal messages
                      for trusted contacts
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Controlled Access
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Nominate trusted contacts who can request access when needed
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Be the First to Know
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Register your interest and we'll notify you when Wishkeepers
                  launches.
                </p>

                {/* Email Capture Form */}
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Your name"
                              {...field}
                              data-testid="input-fullname"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              {...field}
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="consent"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-consent"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-normal text-gray-600 dark:text-gray-300">
                              I agree to receive email updates about Wishkeepers
                              and understand my information will be used to contact
                              me when the app launches. I can unsubscribe at any
                              time.
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      disabled={mutation.isPending}
                      data-testid="button-submit"
                    >
                      {mutation.isPending ? "Submitting..." : "Notify Me at Launch"}
                    </Button>
                  </form>
                </Form>
              </div>
            </>
          ) : (
            /* Success State */
            <div className="text-center py-8" data-testid="success-container">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" data-testid="icon-success" />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4" data-testid="text-success-title">
                You're on the List!
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-2" data-testid="text-success-message">
                Thank you for your interest in Wishkeepers.
              </p>
              <p className="text-gray-600 dark:text-gray-300" data-testid="text-success-details">
                We'll send you an email as soon as we launch.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 dark:text-gray-400">
          <p className="text-sm">
            © 2024 Wishkeepers. Helping families prepare for life's most
            important moments.
          </p>
        </div>
      </div>
    </div>
  );
}
