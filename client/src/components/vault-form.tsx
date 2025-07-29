import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertVaultSchema, type InsertVault } from "@shared/schema";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Church, Music, Gift, Heart, Umbrella, Building } from "lucide-react";

interface VaultFormProps {
  initialData?: Partial<InsertVault>;
  onSuccess?: () => void;
}

export function VaultForm({ initialData, onSuccess }: VaultFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState("funeral");

  const form = useForm<InsertVault>({
    resolver: zodResolver(insertVaultSchema),
    defaultValues: {
      funeralWishes: initialData?.funeralWishes || "",
      lifeInsurance: initialData?.lifeInsurance || "",
      banking: initialData?.banking || "",
      personalMessages: initialData?.personalMessages || "",
      specialRequests: initialData?.specialRequests || "",
    },
  });

  const saveMutation = useMutation({
    mutationFn: api.createOrUpdateVault,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vault"] });
      toast({
        title: "Vault updated",
        description: "Your information has been saved securely.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save vault information.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertVault) => {
    saveMutation.mutate(data);
  };

  const sections = [
    { id: "funeral", title: "Funeral Wishes", icon: Church, color: "text-green-600" },
    { id: "insurance", title: "Life Insurance", icon: Umbrella, color: "text-blue-600" },
    { id: "banking", title: "Banking", icon: Building, color: "text-yellow-600" },
    { id: "messages", title: "Personal Messages", icon: Heart, color: "text-purple-600" },
    { id: "requests", title: "Special Requests", icon: Gift, color: "text-indigo-600" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Legacy Vault</h2>
        <p className="text-gray-600">Take your time to thoughtfully complete each section. You can always come back to make changes.</p>
      </div>

      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeSection === section.id
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Icon className={`h-4 w-4 mr-2 ${section.color}`} />
              {section.title}
            </button>
          );
        })}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {activeSection === "funeral" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Church className="h-6 w-6 text-green-600 mr-3" />
                  Funeral Wishes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="funeralWishes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Funeral Preferences</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please describe your preferences for your funeral service, burial or cremation, location, music, readings, and any other specific wishes..."
                          className="min-h-[200px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-sm text-gray-500">
                  <p>Consider including:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Service type (traditional, memorial, celebration of life)</li>
                    <li>Burial or cremation preferences</li>
                    <li>Preferred location or venue</li>
                    <li>Music selections or hymns</li>
                    <li>Readings, poems, or passages</li>
                    <li>Any other special instructions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "insurance" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Umbrella className="h-6 w-6 text-blue-600 mr-3" />
                  Life Insurance Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="lifeInsurance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Life Insurance Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please provide your life insurance policy details, provider name, policy number, and beneficiary information..."
                          className="min-h-[150px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-sm text-gray-500 mt-4">
                  <p>Include information about:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Insurance provider name</li>
                    <li>Policy number</li>
                    <li>Coverage amount</li>
                    <li>Beneficiary information</li>
                    <li>Contact details for claims</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "banking" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-6 w-6 text-yellow-600 mr-3" />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="banking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banking Details</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Please list your bank names, account types, and any other relevant financial institutions (do not include login credentials)..."
                          className="min-h-[150px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-sm text-gray-500 mt-4">
                  <p className="font-medium text-red-600">Security Note: Never include passwords, PINs, or login credentials.</p>
                  <p className="mt-2">Include only:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Bank names and branches</li>
                    <li>Account types (checking, savings, etc.)</li>
                    <li>General account references</li>
                    <li>Investment account providers</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "messages" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-6 w-6 text-purple-600 mr-3" />
                  Personal Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="personalMessages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Messages for Loved Ones</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write heartfelt messages for your family and friends. You can address specific people or write a general message..."
                          className="min-h-[200px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-sm text-gray-500 mt-4">
                  <p>Consider writing messages for:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Your spouse or partner</li>
                    <li>Your children</li>
                    <li>Parents and siblings</li>
                    <li>Close friends</li>
                    <li>Anyone special in your life</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "requests" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gift className="h-6 w-6 text-indigo-600 mr-3" />
                  Special Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="specialRequests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Include any special requests for personal belongings, gifts to specific people, charitable donations, or other wishes..."
                          className="min-h-[150px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-sm text-gray-500 mt-4">
                  <p>Examples of special requests:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>"Gift my guitar to my niece Sarah"</li>
                    <li>"Donate my books to the local library"</li>
                    <li>"Please ensure my garden is maintained"</li>
                    <li>"Give my jewelry to my daughters"</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving..." : "Save & Continue"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
