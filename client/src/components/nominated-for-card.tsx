import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, UserX, Heart } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface NominatedForCardProps {
  contactId: string;
  ownerName: string;
  ownerEmail: string;
  vaultId: string;
}

export function NominatedForCard({ contactId, ownerName, ownerEmail, vaultId }: NominatedForCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deathDialogOpen, setDeathDialogOpen] = useState(false);

  const removeContactMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/trusted-contacts/${contactId}/remove`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to remove trusted contact');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nominated-for'] });
      toast({
        title: "Request sent",
        description: `${ownerName} has been notified of your request to be removed as a trusted contact.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send removal request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const declarePassing = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/data-release-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vaultId,
          deceasedName: ownerName,
        }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to submit declaration');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/nominated-for'] });
      setDeathDialogOpen(false);
      toast({
        title: "Declaration submitted",
        description: "Your declaration has been submitted for admin review. Other trusted contacts will be notified upon approval.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit declaration. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Card className="hover:shadow-lg transition-shadow" data-testid={`card-nominated-${contactId}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-red-500" />
          {ownerName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{ownerEmail}</p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                data-testid={`button-remove-${contactId}`}
              >
                <UserX className="h-4 w-4 mr-2" />
                No Longer Wish to Be Trusted Contact
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove as Trusted Contact?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will notify {ownerName} that you no longer wish to be their trusted contact. 
                  They will need to nominate someone else.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => removeContactMutation.mutate()}
                  disabled={removeContactMutation.isPending}
                >
                  {removeContactMutation.isPending ? 'Sending...' : 'Confirm Removal'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog open={deathDialogOpen} onOpenChange={setDeathDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                data-testid={`button-declare-death-${contactId}`}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Notify of Passing
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl">Declaration of Passing</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3 text-base">
                  <p>
                    I hereby certify that <strong>{ownerName}</strong> has passed away, and as a trusted contact, 
                    I am requesting the release of their Wishkeepers vault to all designated trusted contacts.
                  </p>
                  <p className="text-sm text-muted-foreground mt-4">
                    This declaration will be reviewed by our admin team. Upon approval, the vault contents 
                    will be made available to all trusted contacts named on the account.
                  </p>
                  <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg mt-4">
                    <p className="text-sm text-amber-900 dark:text-amber-100 font-medium">
                      ⚠️ Please ensure this information is accurate before proceeding.
                    </p>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => declarePassing.mutate()}
                  disabled={declarePassing.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {declarePassing.isPending ? 'Submitting...' : 'Submit Declaration'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
