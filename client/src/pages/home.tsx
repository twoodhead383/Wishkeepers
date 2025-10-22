import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <>
      <HeroSection />
      <FeaturesSection />
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <span className="text-xl font-semibold">Wishkeepers</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Helping families prepare for life's most important moments with dignity, security, and peace of mind.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Help Center</span></li>
                <li><span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Contact Us</span></li>
                <li><span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Security</span></li>
                <li><span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><span className="text-gray-300 hover:text-white transition-colors cursor-pointer">About Us</span></li>
                <li><span className="text-gray-300 hover:text-white transition-colors cursor-pointer">How it Works</span></li>
                <li><span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 Wishkeepers. All rights reserved. Built with care for families everywhere.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
