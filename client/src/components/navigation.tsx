import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Heart className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-semibold text-gray-900">Wishkeepers</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <span className={`text-gray-600 hover:text-blue-600 transition-colors ${isActive('/dashboard') ? 'text-blue-600 font-medium' : ''}`}>
                    Dashboard
                  </span>
                </Link>
                <Link href="/vault">
                  <span className={`text-gray-600 hover:text-blue-600 transition-colors ${isActive('/vault') ? 'text-blue-600 font-medium' : ''}`}>
                    My Vault
                  </span>
                </Link>
                <Link href="/trusted-contacts">
                  <span className={`text-gray-600 hover:text-blue-600 transition-colors ${isActive('/trusted-contacts') ? 'text-blue-600 font-medium' : ''}`}>
                    Trusted Contacts
                  </span>
                </Link>
                {user?.isAdmin && (
                  <Link href="/admin">
                    <span className={`text-gray-600 hover:text-blue-600 transition-colors ${isActive('/admin') ? 'text-blue-600 font-medium' : ''}`}>
                      Admin
                    </span>
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    Hello, {user?.firstName}
                  </span>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/">
                  <span className="text-gray-600 hover:text-blue-600 transition-colors">How it Works</span>
                </Link>
                <span className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">Security</span>
                <span className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">Support</span>
                <Link href="/register">
                  <Button variant="outline" className="mr-2">
                    Register
                  </Button>
                </Link>
                <Link href="/login">
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-100">
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <div className="block px-3 py-2 text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                      Dashboard
                    </div>
                  </Link>
                  <Link href="/vault">
                    <div className="block px-3 py-2 text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                      My Vault
                    </div>
                  </Link>
                  <Link href="/trusted-contacts">
                    <div className="block px-3 py-2 text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                      Trusted Contacts
                    </div>
                  </Link>
                  {user?.isAdmin && (
                    <Link href="/admin">
                      <div className="block px-3 py-2 text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                        Admin
                      </div>
                    </Link>
                  )}
                  <div className="px-3 py-2">
                    <Button onClick={handleLogout} variant="outline" size="sm" className="w-full">
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <div className="block px-3 py-2 text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                      Sign In
                    </div>
                  </Link>
                  <Link href="/register">
                    <div className="block px-3 py-2 text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                      Register
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}