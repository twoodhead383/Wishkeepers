import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, UserPlus, Upload, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Prospect {
  email: string;
  firstName: string;
}

export default function InviteUsers() {
  const [singleEmail, setSingleEmail] = useState("");
  const [singleFirstName, setSingleFirstName] = useState("");
  const [csvText, setCsvText] = useState("");
  const [csvProspects, setCsvProspects] = useState<Prospect[]>([]);
  const { toast } = useToast();

  const inviteMutation = useMutation({
    mutationFn: async (prospects: Prospect[]) => {
      const res = await apiRequest("POST", "/api/admin/invite-prospects", { prospects });
      return await res.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Invitations sent",
        description: data?.message || `Successfully sent ${data?.results?.sent || 0} invitation(s)`,
      });
      // Reset forms
      setSingleEmail("");
      setSingleFirstName("");
      setCsvText("");
      setCsvProspects([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitations",
        variant: "destructive",
      });
    },
  });

  const handleSingleInvite = () => {
    if (!singleEmail || !singleFirstName) {
      toast({
        title: "Missing information",
        description: "Please enter both email and first name",
        variant: "destructive",
      });
      return;
    }

    inviteMutation.mutate([{ email: singleEmail, firstName: singleFirstName }]);
  };

  const parseCsv = () => {
    if (!csvText.trim()) {
      toast({
        title: "No CSV data",
        description: "Please paste CSV data in the text area",
        variant: "destructive",
      });
      return;
    }

    try {
      const lines = csvText.trim().split('\n');
      const prospects: Prospect[] = [];
      
      // Skip header row if it exists
      const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split by comma (handle simple CSV)
        const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''));
        
        if (parts.length >= 2) {
          const [firstName, email] = parts;
          if (email && firstName) {
            prospects.push({ email, firstName });
          }
        }
      }

      if (prospects.length === 0) {
        toast({
          title: "No valid prospects found",
          description: "CSV should have format: FirstName,Email",
          variant: "destructive",
        });
        return;
      }

      setCsvProspects(prospects);
      toast({
        title: "CSV parsed",
        description: `Found ${prospects.length} prospect(s)`,
      });
    } catch (error) {
      toast({
        title: "Parse error",
        description: "Failed to parse CSV. Expected format: FirstName,Email",
        variant: "destructive",
      });
    }
  };

  const handleCsvInvite = () => {
    if (csvProspects.length === 0) {
      toast({
        title: "No prospects",
        description: "Please parse CSV data first",
        variant: "destructive",
      });
      return;
    }

    inviteMutation.mutate(csvProspects);
  };

  const removeProspect = (index: number) => {
    setCsvProspects(csvProspects.filter((_, i) => i !== index));
  };

  return (
    <AdminLayout>
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Invite Prospective Users</h1>
            <p className="text-gray-600">Send invitations to potential users to join Wishkeepers</p>
          </div>

          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="single" data-testid="tab-single-invite">
                <UserPlus className="h-4 w-4 mr-2" />
                Single Invitation
              </TabsTrigger>
              <TabsTrigger value="bulk" data-testid="tab-bulk-invite">
                <Upload className="h-4 w-4 mr-2" />
                Bulk CSV Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              <Card>
                <CardHeader>
                  <CardTitle>Send Individual Invitation</CardTitle>
                  <CardDescription>
                    Enter the prospect's information to send them an invitation email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={singleFirstName}
                      onChange={(e) => setSingleFirstName(e.target.value)}
                      data-testid="input-first-name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={singleEmail}
                      onChange={(e) => setSingleEmail(e.target.value)}
                      data-testid="input-email"
                    />
                  </div>

                  <Button
                    onClick={handleSingleInvite}
                    disabled={inviteMutation.isPending}
                    className="w-full"
                    data-testid="button-send-single-invite"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload CSV File</CardTitle>
                    <CardDescription>
                      Paste CSV data with format: FirstName,Email (one per line)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="csvData">CSV Data</Label>
                      <Textarea
                        id="csvData"
                        placeholder={`FirstName,Email\nJohn,john@example.com\nJane,jane@example.com\nBob,bob@example.com`}
                        value={csvText}
                        onChange={(e) => setCsvText(e.target.value)}
                        rows={8}
                        data-testid="textarea-csv"
                      />
                      <p className="text-sm text-gray-500">
                        Format: FirstName,Email (header row is optional)
                      </p>
                    </div>

                    <Button
                      onClick={parseCsv}
                      variant="outline"
                      className="w-full"
                      data-testid="button-parse-csv"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Parse CSV
                    </Button>
                  </CardContent>
                </Card>

                {csvProspects.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Parsed Prospects ({csvProspects.length})</CardTitle>
                      <CardDescription>
                        Review the prospects before sending invitations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {csvProspects.map((prospect, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                            data-testid={`prospect-item-${index}`}
                          >
                            <div>
                              <p className="font-medium text-gray-900">{prospect.firstName}</p>
                              <p className="text-sm text-gray-600">{prospect.email}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProspect(index)}
                              data-testid={`button-remove-prospect-${index}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={handleCsvInvite}
                        disabled={inviteMutation.isPending}
                        className="w-full mt-4"
                        data-testid="button-send-bulk-invites"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send {csvProspects.length} Invitation{csvProspects.length !== 1 ? 's' : ''}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
