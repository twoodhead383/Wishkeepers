import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { 
  Church, 
  Umbrella, 
  Building, 
  MessageCircle, 
  Gift, 
  Users, 
  CheckCircle,
  AlertCircle,
  ArrowRight 
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: vaultData, isLoading } = useQuery({
    queryKey: ["/api/vault"],
    queryFn: api.getVault,
  });

  const { data: contactsData } = useQuery({
    queryKey: ["/api/trusted-contacts"],
    queryFn: api.getTrustedContacts,
  });

  const vault = vaultData?.vault;
  const contacts = contactsData?.contacts || [];

  const vaultSections = [
    {
      id: "funeral",
      title: "Funeral Wishes",
      icon: Church,
      color: "green",
      completed: !!vault?.funeralWishes,
      description: "Your preferences for burial, service, and remembrance.",
    },
    {
      id: "insurance",
      title: "Life Insurance",
      icon: Umbrella,
      color: "blue",
      completed: !!vault?.lifeInsurance,
      description: "Policy details and beneficiary information.",
    },
    {
      id: "banking",
      title: "Banking",
      icon: Building,
      color: "yellow",
      completed: !!vault?.banking,
      description: "Bank names and account references.",
    },
    {
      id: "messages",
      title: "Personal Messages",
      icon: MessageCircle,
      color: "purple",
      completed: !!vault?.personalMessages,
      description: "Heartfelt notes for family and friends.",
    },
    {
      id: "requests",
      title: "Special Requests",
      icon: Gift,
      color: "indigo",
      completed: !!vault?.specialRequests,
      description: "Instructions for personal belongings and gifts.",
    },
    {
      id: "contacts",
      title: "Trusted Contacts",
      icon: Users,
      color: "teal",
      completed: contacts.some((c: any) => c.status === "confirmed"),
      description: "People who can access your vault when needed.",
    },
  ];

  const getColorClasses = (color: string, completed: boolean) => {
    const colorMap = {
      green: completed ? "bg-green-50 border-green-200 text-green-600" : "bg-gray-50 border-gray-200 text-gray-400",
      blue: completed ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-gray-50 border-gray-200 text-gray-400",
      yellow: completed ? "bg-yellow-50 border-yellow-200 text-yellow-600" : "bg-gray-50 border-gray-200 text-gray-400",
      purple: completed ? "bg-purple-50 border-purple-200 text-purple-600" : "bg-gray-50 border-gray-200 text-gray-400",
      indigo: completed ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-gray-50 border-gray-200 text-gray-400",
      teal: completed ? "bg-teal-50 border-teal-200 text-teal-600" : "bg-gray-50 border-gray-200 text-gray-400",
    };
    return colorMap[color as keyof typeof colorMap];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.firstName}
                </CardTitle>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  (vault?.completionPercentage || 0) === 100 
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {vault?.completionPercentage || 0}% Complete
                </span>
              </div>
              <p className="text-gray-600 mb-6">
                Complete your vault to ensure your loved ones have everything they need.
              </p>
              
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${vault?.completionPercentage || 0}%` }}
                ></div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vaultSections.map((section) => {
                  const Icon = section.icon;
                  const isCompleted = section.completed;
                  const colorClasses = getColorClasses(section.color, isCompleted);
                  
                  return (
                    <Card key={section.id} className={`border ${colorClasses}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Icon className={`h-6 w-6 mr-3 ${isCompleted ? '' : 'text-gray-400'}`} />
                            <h3 className="font-semibold text-gray-900">{section.title}</h3>
                          </div>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{section.description}</p>
                        <Link href={section.id === "contacts" ? "/trusted-contacts" : `/vault?section=${section.id}`}>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`w-full justify-between ${
                              isCompleted ? 'text-green-600 hover:text-green-700' : 'text-yellow-600 hover:text-yellow-700'
                            }`}
                          >
                            {isCompleted ? "View Details" : "Complete Section"}
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/vault">
                  <Button className="w-full justify-start" variant="outline">
                    <Church className="h-4 w-4 mr-2" />
                    Complete Your Vault
                  </Button>
                </Link>
                <Link href="/trusted-contacts">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Trusted Contacts
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Your data is protected with bank-level encryption.</p>
                  <p>Need help? Contact our support team anytime.</p>
                </div>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
    </div>
  );
}
