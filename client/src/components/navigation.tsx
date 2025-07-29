import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Menu, X, Shield, HelpCircle, CheckCircle, Lock, Eye, UserCheck, Phone, Mail, MessageCircle, FileText, Users, Clock, Gift } from "lucide-react";
import { useState } from "react";
import { ChatWidget } from "@/components/chat-widget";

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
                {!user?.isAdmin && (
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
                  </>
                )}
                {user?.isAdmin && (
                  <Link href="/admin">
                    <span className={`text-gray-600 hover:text-blue-600 transition-colors ${location.startsWith('/admin') ? 'text-blue-600 font-medium' : ''}`}>
                      Admin Dashboard
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
                {/* How it Works Modal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <span className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">How it Works</span>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-center mb-4">
                        How Wishkeepers Works
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-8">
                      {/* Step-by-step Process */}
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-blue-50 rounded-xl">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Create Your Vault</h3>
                          <p className="text-gray-600">Register and start building your secure digital legacy vault with your important information.</p>
                        </div>
                        
                        <div className="text-center p-6 bg-green-50 rounded-xl">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Store Information</h3>
                          <p className="text-gray-600">Add your funeral wishes, insurance details, banking information, and personal messages - all encrypted and secure.</p>
                        </div>
                        
                        <div className="text-center p-6 bg-purple-50 rounded-xl">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Nominate Trusted Contacts</h3>
                          <p className="text-gray-600">Invite family members or friends who can request access to your vault when needed.</p>
                        </div>
                      </div>

                      {/* Detailed Features */}
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-center">What You Can Store</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Heart className="h-4 w-4 text-red-500" />
                              Funeral Wishes & Personal Messages
                            </h4>
                            <p className="text-sm text-gray-600">Your preferences for services, personal items to gift, and heartfelt messages for loved ones.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-500" />
                              Insurance & Financial Information
                            </h4>
                            <p className="text-sm text-gray-600">Policy numbers, account details, and important financial documents your family will need.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Lock className="h-4 w-4 text-green-500" />
                              Digital Assets & Passwords
                            </h4>
                            <p className="text-sm text-gray-600">Account access information and digital asset details, securely encrypted.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-purple-500" />
                              Important Documents
                            </h4>
                            <p className="text-sm text-gray-600">Location of wills, deeds, certificates, and other critical documents.</p>
                          </div>
                        </div>
                      </div>

                      {/* Access Process */}
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 text-center">How Your Family Accesses Information</h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                            <p className="text-gray-700">Trusted contact submits a data release request with required documentation</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                            <p className="text-gray-700">Our admin team verifies the request to ensure security and authenticity</p>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                            <p className="text-gray-700">Upon approval, your information is made available to your designated contacts</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Security Modal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <span className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">Security</span>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-center mb-4">
                        Your Security is Our Priority
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-8">
                      {/* Security Features */}
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-4">
                          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Lock className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className="font-semibold mb-2">AES-256 Encryption</h3>
                          <p className="text-sm text-gray-600">Military-grade encryption protects your data both in transit and at rest.</p>
                        </div>
                        <div className="text-center p-4">
                          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Eye className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="font-semibold mb-2">Zero-Knowledge Access</h3>
                          <p className="text-sm text-gray-600">Only you control who can access your information. We can't see your encrypted data.</p>
                        </div>
                        <div className="text-center p-4">
                          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <UserCheck className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="font-semibold mb-2">Verified Access</h3>
                          <p className="text-sm text-gray-600">Multi-step verification process ensures only authorized access to your vault.</p>
                        </div>
                      </div>

                      {/* Security Details */}
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold mb-4">How We Protect Your Data</h3>
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold">End-to-End Encryption</h4>
                                <p className="text-sm text-gray-600">Your sensitive information is encrypted before it leaves your device and remains encrypted in our database.</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold">Secure Authentication</h4>
                                <p className="text-sm text-gray-600">Strong password requirements and secure session management protect your account.</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold">Admin Verification</h4>
                                <p className="text-sm text-gray-600">All data release requests are manually reviewed by our security team before approval.</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                              <div>
                                <h4 className="font-semibold">Regular Security Audits</h4>
                                <p className="text-sm text-gray-600">We continuously monitor and improve our security measures to protect your legacy.</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-lg">
                          <h3 className="text-lg font-semibold mb-3">Your Privacy Rights</h3>
                          <p className="text-gray-700 mb-3">
                            You maintain complete control over your data. You can update, export, or delete your information at any time.
                          </p>
                          <p className="text-gray-700">
                            We never sell your data, use it for advertising, or share it with third parties without your explicit consent.
                          </p>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Support Modal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <span className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">Support</span>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-center mb-4">
                        We're Here to Help
                      </DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-8">
                      {/* Contact Options */}
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-blue-50 rounded-xl">
                          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="h-8 w-8 text-blue-600" />
                          </div>
                          <h3 className="font-semibold mb-2">Email Support</h3>
                          <p className="text-sm text-gray-600 mb-3">Get detailed help with your account and questions.</p>
                          <p className="text-blue-600 font-medium">support@wishkeepers.com</p>
                        </div>
                        
                        <div className="text-center p-6 bg-green-50 rounded-xl">
                          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Phone className="h-8 w-8 text-green-600" />
                          </div>
                          <h3 className="font-semibold mb-2">Phone Support</h3>
                          <p className="text-sm text-gray-600 mb-3">Speak directly with our support team.</p>
                          <p className="text-green-600 font-medium">1-800-WISHKEEP</p>
                          <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</p>
                        </div>
                        
                        <div className="text-center p-6 bg-purple-50 rounded-xl">
                          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="font-semibold mb-2">Live Chat</h3>
                          <p className="text-sm text-gray-600 mb-3">Quick answers to common questions.</p>
                          <ChatWidget />
                        </div>
                      </div>

                      {/* FAQ Section */}
                      <div>
                        <h3 className="text-xl font-semibold mb-6 text-center">Frequently Asked Questions</h3>
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">How secure is my information?</h4>
                            <p className="text-sm text-gray-600">Your data is protected with bank-level AES-256 encryption and stored securely. Only you and your designated trusted contacts can access it through our verified release process.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">What happens if I forget my password?</h4>
                            <p className="text-sm text-gray-600">You can reset your password using the "Forgot Password" link on the login page. We'll send a secure reset link to your registered email address.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">How do trusted contacts access my vault?</h4>
                            <p className="text-sm text-gray-600">Trusted contacts must submit a data release request with proper documentation. Our admin team verifies each request before granting access to ensure security.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Can I update my information anytime?</h4>
                            <p className="text-sm text-gray-600">Yes! You can log in anytime to update your vault information, add new details, or modify your trusted contacts list.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Is there a cost to use Wishkeepers?</h4>
                            <p className="text-sm text-gray-600">We offer both free and premium plans. The basic vault is free forever, with premium features available for advanced needs.</p>
                          </div>
                        </div>
                      </div>

                      {/* Emergency Support */}
                      <div className="bg-red-50 border-l-4 border-red-500 p-6">
                        <h3 className="text-lg font-semibold text-red-900 mb-2">Emergency Situations</h3>
                        <p className="text-red-800 mb-3">
                          If you need immediate assistance with accessing a vault due to a family emergency, please call our emergency support line.
                        </p>
                        <p className="text-red-900 font-semibold">Emergency: 1-800-WISHKEEP ext. 911</p>
                        <p className="text-sm text-red-700">Available 24/7 for verified emergencies</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
                  {!user?.isAdmin && (
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
                    </>
                  )}
                  {user?.isAdmin && (
                    <Link href="/admin">
                      <div className="block px-3 py-2 text-gray-600 hover:text-blue-600" onClick={() => setMobileMenuOpen(false)}>
                        Admin Dashboard
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