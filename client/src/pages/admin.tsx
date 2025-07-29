import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Users, Vault, CheckCircle, Clock, UserPlus, TrendingUp, BarChart3 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Admin() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: statsData } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: requestsData } = useQuery({
    queryKey: ["/api/admin/release-requests"],
    queryFn: async () => {
      const response = await fetch("/api/admin/release-requests", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch requests");
      return response.json();
    },
    enabled: isAuthenticated && user?.isAdmin,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["/api/admin/analytics"],
    queryFn: async () => {
      const response = await fetch("/api/admin/analytics", {
        credentials: "include"
      });
      if (!response.ok) throw new Error("Failed to fetch analytics");
      return response.json();
    },
    enabled: isAuthenticated && user?.isAdmin,
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/admin/release-requests/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update request");
      return response.json();
    },
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
  const analytics = analyticsData?.analytics;

  const handleApprove = (requestId: string) => {
    updateRequestMutation.mutate({ id: requestId, status: "approved" });
  };

  const handleDeny = (requestId: string) => {
    updateRequestMutation.mutate({ id: requestId, status: "denied" });
  };

  // Prepare completion time distribution data
  const completionTimeRanges = analytics?.vaultCompletionTimes ? [
    { range: "1-7 days", count: analytics.vaultCompletionTimes.filter(v => v.days <= 7).length },
    { range: "8-14 days", count: analytics.vaultCompletionTimes.filter(v => v.days > 7 && v.days <= 14).length },
    { range: "15-30 days", count: analytics.vaultCompletionTimes.filter(v => v.days > 14 && v.days <= 30).length },
    { range: "30+ days", count: analytics.vaultCompletionTimes.filter(v => v.days > 30).length },
  ] : [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

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

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Registrations Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  User Registrations Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.userRegistrations || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Release Requests Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Data Release Requests Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.releaseRequests || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vault Completion Time Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Vault Completion Time Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={completionTimeRanges}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ range, count }) => count > 0 ? `${range}: ${count}` : ''}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {completionTimeRanges.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>System Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Completion Time</span>
                    <span className="font-semibold">
                      {analytics?.vaultCompletionTimes?.length > 0 
                        ? Math.round(analytics.vaultCompletionTimes.reduce((sum, v) => sum + v.days, 0) / analytics.vaultCompletionTimes.length)
                        : 0} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Fastest Completion</span>
                    <span className="font-semibold">
                      {analytics?.vaultCompletionTimes?.[0]?.days || 0} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Release Requests</span>
                    <span className="font-semibold">{requests.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Approval Rate</span>
                    <span className="font-semibold">
                      {requests.length > 0 
                        ? Math.round((requests.filter(r => r.status === 'approved').length / requests.length) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
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
