import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Building2, LogOut } from "lucide-react";
import logoImage from "@assets/wishkeepers-logo-1024x300_1755001701704.png";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const queryClient = useQueryClient();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: BarChart3,
      current: location === '/admin'
    },
    {
      name: 'Users & Vaults',
      href: '/admin/users',
      icon: Users,
      current: location === '/admin/users'
    },
    {
      name: 'Third Parties',
      href: '/admin/third-parties',
      icon: Building2,
      current: location === '/admin/third-parties'
    }
  ];

  const handleLogout = async () => {
    try {
      // Clear the query cache first
      queryClient.clear();
      
      await fetch("/api/logout", { 
        method: "POST",
        credentials: "include"
      });
      
      // Force a full page redirect to home
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      // Even if logout fails, clear cache and redirect
      queryClient.clear();
      window.location.href = "/";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4">
            <img 
              src={logoImage} 
              alt="Wishkeepers" 
              className="h-10 w-auto"
            />
          </div>
          
          {/* Admin Badge */}
          <div className="mt-4 px-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">A</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-blue-600">System Administrator</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <div className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? 'bg-blue-100 text-blue-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    <Icon className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      item.current ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <Button 
              onClick={handleLogout}
              variant="outline" 
              className="w-full flex items-center"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}