import { useQuery } from "@tanstack/react-query";
import { VaultForm } from "@/components/vault-form";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export default function Vault() {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [activeSection, setActiveSection] = useState<string>("funeral");

  // Parse URL parameters to get the section
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [location]);

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
        <VaultForm 
          initialData={vaultData?.vault} 
          initialSection={activeSection}
          onSuccess={() => setLocation("/dashboard")}
        />
      </div>
    </div>
  );
}
