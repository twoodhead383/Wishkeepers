import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { AdminProtectedRoute } from "@/components/admin-protected-route";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import VerifyEmail from "@/pages/verify-email";
import AcceptInvite from "@/pages/accept-invite";
import Dashboard from "@/pages/dashboard";
import Vault from "@/pages/vault";
import TrustedContacts from "@/pages/trusted-contacts";
import Admin from "@/pages/admin";
import ThirdParties from "@/pages/admin/third-parties";
import AdminUsers from "@/pages/admin/users";
import InviteUsers from "@/pages/admin/invite-users";
import ComingSoon from "@/pages/coming-soon";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";

function AdminRedirect() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && user?.isAdmin) {
      setLocation("/admin");
    } else if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  return null;
}

function Router() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  // For admin routes, don't show the layout wrapper when not authenticated
  const isAdminRoute = location.startsWith('/admin');
  const shouldShowLayout = !isAdminRoute || (isAuthenticated && user?.isAdmin);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/coming-soon" component={ComingSoon} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-email/:email" component={VerifyEmail} />
      <Route path="/invite/:token" component={AcceptInvite} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/vault" component={Vault} />
      <Route path="/trusted-contacts" component={TrustedContacts} />
      <Route path="/admin">
        <AdminProtectedRoute>
          <Admin />
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/third-parties">
        <AdminProtectedRoute>
          <ThirdParties />
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <AdminProtectedRoute>
          <AdminUsers />
        </AdminProtectedRoute>
      </Route>
      <Route path="/admin/invite-users">
        <AdminProtectedRoute>
          <InviteUsers />
        </AdminProtectedRoute>
      </Route>
      <Route path="/redirect" component={AdminRedirect} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Check if current route is an admin route or auth route
  const isAdminRoute = location.startsWith('/admin');
  const isAuthRoute = location === '/login' || location === '/register' || location.startsWith('/verify-email') || location.startsWith('/invite');
  const isComingSoonRoute = location === '/coming-soon';
  
  // For admin routes, only show layout if user is authenticated and is admin
  // For auth routes and coming-soon, don't show layout
  // For other routes, always show layout
  const shouldShowLayout = !isAdminRoute && !isAuthRoute && !isComingSoonRoute;

  if (shouldShowLayout) {
    return (
      <Layout>
        <Router />
      </Layout>
    );
  }

  // For admin routes when not authenticated/not admin, render without layout
  return <Router />;
}

export default App;
