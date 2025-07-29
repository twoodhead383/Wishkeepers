import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout";
import { VaultForm } from "@/components/vault-form";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { useLocation } from "wouter";

export default function Vault() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const { data: vaultData, isLoading } = useQuery({
    queryKey: ["/api/vault"],
    queryFn: api.getVault,
  });

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your vault...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <VaultForm 
            initialData={vaultData?.vault} 
            onSuccess={() => setLocation("/dashboard")}
          />
        </div>
      </div>
    </Layout>
  );
}
