import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Vault, CheckCircle, Clock, UserPlus } from "lucide-react";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: statsData } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: api.getAdminStats,
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: requestsData } = useQuery({
    queryKey: ["/api/admin/release-requests"],
    queryFn: api.getReleaseRequests,
    enabled: isAuthenticated && user?.isAdmin,
  });

  const updateRequestMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.updateReleaseRequest(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/release-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Request updated",
        description: "The data release request has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated || !user?.isAdmin) {
    return (
      <AdminLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
              <p className="text-gray-600">You don't have permission to access this page.</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const stats = statsData?.stats;
  const requests = requestsData?.requests || [];
  const pendingRequests = requests.filter(r => r.status === "pending");

  const handleApprove = (requestId: string) => {
    updateRequestMutation.mutate({ id: requestId, status: "approved" });
  };

  const handleDeny = (requestId: string) => {
    updateRequestMutation.mutate({ id: requestId, status: "denied" });
  };

  return (
    <AdminLayout>
      <div className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Monitor user activity, vault completions, and manage data release requests.</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Active Vaults</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.activeVaults || 0}</p>
                  </div>
                  <Vault className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.pendingRequests || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Completed Vaults</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.completedVaults || 0}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserPlus className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">New user registered</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Vault className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">Vault completed</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">Data release request</p>
                    <p className="text-xs text-gray-500">6 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Data Release Requests */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Data Release Requests</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending requests</p>
                ) : (
                  pendingRequests.map((request) => (
                    <div key={request.id} className="bg-gray-50 rounded-lg p-4 border border-yellow-200">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">{request.deceasedName}</h4>
                          <p className="text-sm text-gray-600">
                            Requested by: {request.requesterId}
                          </p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          Pending Review
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Submitted: {new Date(request.requestDate).toLocaleDateString()}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleApprove(request.id)}
                          className="flex-1 bg-green-600 text-white hover:bg-green-700"
                          size="sm"
                          disabled={updateRequestMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleDeny(request.id)}
                          variant="destructive"
                          className="flex-1"
                          size="sm"
                          disabled={updateRequestMutation.isPending}
                        >
                          Deny
                        </Button>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
