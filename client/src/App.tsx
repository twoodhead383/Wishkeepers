import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Vault from "@/pages/vault";
import TrustedContacts from "@/pages/trusted-contacts";
import Admin from "@/pages/admin";
import ThirdParties from "@/pages/admin/third-parties";
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
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/vault" component={Vault} />
      <Route path="/trusted-contacts" component={TrustedContacts} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/third-parties" component={ThirdParties} />
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
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
