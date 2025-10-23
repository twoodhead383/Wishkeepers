import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { insertTrustedContactSchema, type InsertTrustedContact } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, CheckCircle, Clock, Plus, Edit, X } from "lucide-react";

export default function TrustedContacts() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: contactsData, isLoading } = useQuery({
    queryKey: ["/api/trusted-contacts"],
    queryFn: api.getTrustedContacts,
  });

  const addContactMutation = useMutation({
    mutationFn: api.addTrustedContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trusted-contacts"] });
      toast({
        title: "Invitation sent",
        description: "Your trusted contact invitation has been sent successfully.",
      });
      setShowAddForm(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resendInviteMutation = useMutation({
    mutationFn: (contactId: string) => 
      fetch(`/api/trusted-contacts/${contactId}/resend`, {
        method: 'POST',
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error('Failed to resend invitation');
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trusted-contacts"] });
      toast({
        title: "Invitation resent",
        description: "The invitation has been sent again successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resend invitation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertTrustedContact>({
    resolver: zodResolver(insertTrustedContactSchema),
    defaultValues: {
      contactEmail: "",
      contactName: "",
    },
  });

  const onSubmit = (data: InsertTrustedContact) => {
    addContactMutation.mutate(data);
  };

  const contacts = contactsData?.contacts || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "denied":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "pending":
        return <Clock className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading trusted contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Trusted Contacts
              </CardTitle>
              <p className="text-gray-600">
                These are the people who can access your vault information when needed. 
                We recommend nominating 1-2 trusted individuals.
              </p>
            </CardHeader>

            <CardContent>
              {/* Current Contacts */}
              {contacts.length > 0 && (
                <div className="space-y-4 mb-8">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`flex items-center justify-between p-4 rounded-xl border ${
                        contact.status === "confirmed"
                          ? "bg-green-50 border-green-200"
                          : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
                          contact.status === "confirmed" ? "bg-green-100" : "bg-yellow-100"
                        }`}>
                          <User className={`h-6 w-6 ${
                            contact.status === "confirmed" ? "text-green-600" : "text-yellow-600"
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{contact.contactName}</h3>
                          <p className="text-sm text-gray-600">{contact.contactEmail}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(contact.status)}`}>
                            {getStatusIcon(contact.status)}
                            {contact.status === "confirmed" ? "Confirmed" : "Invitation Pending"}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {contact.status === "pending" && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => resendInviteMutation.mutate(contact.id)}
                            disabled={resendInviteMutation.isPending}
                            data-testid={`button-resend-${contact.id}`}
                          >
                            {resendInviteMutation.isPending ? "Sending..." : "Resend Pending Invites"}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-600">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Contact */}
              {!showAddForm ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Add Trusted Contact</h3>
                  <p className="text-gray-600 mb-6">
                    Invite someone you trust to be able to access your vault when needed.
                  </p>
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add Trusted Contact
                  </Button>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Trusted Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="contactName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter their full name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter their email address" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex space-x-4">
                          <Button 
                            type="submit" 
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            disabled={addContactMutation.isPending}
                          >
                            {addContactMutation.isPending ? "Sending..." : "Send Invitation"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setShowAddForm(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
