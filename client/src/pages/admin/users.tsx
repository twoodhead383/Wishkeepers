import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Shield, CheckCircle, Clock, AlertCircle, Trash2, Search } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const response = await fetch("/api/admin/users", {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      return data.users || [];
    },
  });

  const { data: vaults = [] } = useQuery({
    queryKey: ["/api/admin/vaults"],
    queryFn: async () => {
      const response = await fetch("/api/admin/vaults", {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch vaults");
      }
      const data = await response.json();
      return data.vaults || [];
    },
  });

  const { data: releaseRequests = [] } = useQuery({
    queryKey: ["/api/admin/release-requests"],
    queryFn: async () => {
      const response = await fetch("/api/admin/release-requests", {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch release requests");
      }
      const data = await response.json();
      return data.requests || [];
    },
  });

  const { data: trustedContacts = [] } = useQuery({
    queryKey: ["/api/admin/trusted-contacts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/trusted-contacts", {
        credentials: "include"
      });
      if (!response.ok) {
        throw new Error("Failed to fetch trusted contacts");
      }
      const data = await response.json();
      return data.contacts || [];
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vaults"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/release-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/trusted-contacts"] });
      setDeleteUserId(null);
      toast({
        title: "User deleted",
        description: "User and all associated data have been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  // Combine user and vault data for display (without sensitive content)
  const userVaultData = users.map((user: any) => {
    const userVault = vaults.find((vault: any) => vault.userId === user.id);
    const userReleaseRequests = Array.isArray(releaseRequests) ? releaseRequests.filter((req: any) => 
      userVault && req.vaultId === userVault.id
    ) : [];
    const userTrustedContacts = Array.isArray(trustedContacts) ? trustedContacts.filter((contact: any) => 
      contact.vaultOwnerId === user.id
    ) : [];
    
    return {
      ...user,
      vaultExists: !!userVault,
      vaultComplete: userVault?.isComplete || false,
      completionPercentage: userVault?.completionPercentage || 0,
      vaultCreatedAt: userVault?.createdAt,
      vaultUpdatedAt: userVault?.updatedAt,
      pendingReleaseRequests: userReleaseRequests.filter((req: any) => req.status === 'pending').length,
      approvedReleaseRequests: userReleaseRequests.filter((req: any) => req.status === 'approved').length,
      trustedContactsCount: userTrustedContacts.length,
      activeTrustedContacts: userTrustedContacts.filter((contact: any) => contact.status === 'accepted').length,
      pendingTrustedContacts: userTrustedContacts.filter((contact: any) => contact.status === 'pending').length,
    };
  });

  // Filter users based on search query
  const filteredUserVaultData = userVaultData.filter((user: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.firstName?.toLowerCase().includes(query) ||
      user.lastName?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  const totalUsers = users.length;
  const usersWithVaults = userVaultData.filter((u: any) => u.vaultExists).length;
  const completedVaults = userVaultData.filter((u: any) => u.vaultComplete).length;
  const pendingRequests = Array.isArray(releaseRequests) ? releaseRequests.filter((req: any) => req.status === 'pending').length : 0;
  const usersWithTrustedContacts = userVaultData.filter((u: any) => u.trustedContactsCount > 0).length;

  const handleDeleteUser = (userId: string) => {
    setDeleteUserId(userId);
  };

  const confirmDelete = () => {
    if (deleteUserId) {
      deleteUserMutation.mutate(deleteUserId);
    }
  };

  return (
    <AdminLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Users & Vaults Overview</h1>
            <p className="text-gray-600">System overview and user account management</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Vaults</p>
                    <p className="text-2xl font-bold text-gray-900">{usersWithVaults}</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Completed Vaults</p>
                    <p className="text-2xl font-bold text-gray-900">{completedVaults}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Users with Trusted Contacts</p>
                    <p className="text-2xl font-bold text-gray-900">{usersWithTrustedContacts}</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Accounts & Vault Status</CardTitle>
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-users"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredUserVaultData.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Vault Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Completion</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Trusted Contacts</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Release Requests</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Last Updated</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUserVaultData.map((user: any) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {user.email}
                          </td>
                          <td className="py-4 px-4">
                            <Badge variant={user.isAdmin ? "default" : "secondary"}>
                              {user.isAdmin ? "Admin" : "User"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            {user.vaultExists ? (
                              <Badge variant={user.vaultComplete ? "default" : "secondary"}>
                                {user.vaultComplete ? "Complete" : "In Progress"}
                              </Badge>
                            ) : (
                              <Badge variant="outline">No Vault</Badge>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {user.vaultExists ? (
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${user.completionPercentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{user.completionPercentage}%</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              {user.trustedContactsCount > 0 ? (
                                <>
                                  {user.activeTrustedContacts > 0 && (
                                    <Badge variant="default">
                                      {user.activeTrustedContacts} Active
                                    </Badge>
                                  )}
                                  {user.pendingTrustedContacts > 0 && (
                                    <Badge variant="secondary">
                                      {user.pendingTrustedContacts} Pending
                                    </Badge>
                                  )}
                                </>
                              ) : (
                                <span className="text-gray-400">None</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              {user.pendingReleaseRequests > 0 && (
                                <Badge variant="destructive">
                                  {user.pendingReleaseRequests} Pending
                                </Badge>
                              )}
                              {user.approvedReleaseRequests > 0 && (
                                <Badge variant="default">
                                  {user.approvedReleaseRequests} Approved
                                </Badge>
                              )}
                              {user.pendingReleaseRequests === 0 && user.approvedReleaseRequests === 0 && (
                                <span className="text-gray-400">None</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {user.vaultUpdatedAt ? (
                              new Date(user.vaultUpdatedAt).toLocaleDateString()
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deleteUserMutation.isPending}
                              data-testid={`button-delete-user-${user.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={deleteUserId !== null} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent data-testid="dialog-confirm-delete">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action will permanently remove:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>The user account</li>
                <li>Their vault and all encrypted data</li>
                <li>All trusted contacts</li>
                <li>All data release requests</li>
              </ul>
              <p className="mt-4 font-semibold text-red-600">This action cannot be undone.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-confirm-delete"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}