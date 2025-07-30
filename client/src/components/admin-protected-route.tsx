import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Not logged in - redirect to login page
        setLocation("/login");
      } else if (!user?.isAdmin) {
        // Logged in but not admin - redirect to dashboard
        setLocation("/dashboard");
      }
    }
  }, [isAuthenticated, user, isLoading, setLocation]);

  // Show nothing while loading or redirecting
  if (isLoading || !isAuthenticated || !user?.isAdmin) {
    return null;
  }

  // User is authenticated and is admin - render the admin content
  return <>{children}</>;
}