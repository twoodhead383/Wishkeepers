import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Users, Lock, FileText, Gift, Clock, CheckCircle, Eye, UserCheck, Scroll } from "lucide-react";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-white via-purple-50 to-blue-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div className="mb-12 lg:mb-0">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Protect Your Legacy.<br />
              <span className="text-primary">Peace of Mind</span> for Your Loved Ones.
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Securely store your important information, funeral wishes, and personal messages. 
              Ensure your family has everything they need when the time comes.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
              <Link href="/register">
                <Button className="w-full sm:w-auto bg-primary text-white px-8 py-3 text-lg hover:bg-primary/90">
                  Create Your Vault
                </Button>
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg">
                    Learn More
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center mb-4">
                      Why Choose Wishkeepers for Your Digital Legacy?
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-8">
                    {/* Key Benefits Section */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Key Benefits for You & Your Family
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-blue-900">Saves Critical Time</h4>
                              <p className="text-sm text-blue-700">Your family won't need to search for important documents or guess your wishes during difficult times.</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-green-900">Reduces Family Stress</h4>
                              <p className="text-sm text-green-700">Clear instructions and personal messages provide comfort and guidance when they need it most.</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <FileText className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-purple-900">Organized Information</h4>
                              <p className="text-sm text-purple-700">All important details in one secure place - insurance, banking, passwords, and personal wishes.</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Users className="h-5 w-5 text-orange-600 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-orange-900">Peace of Mind</h4>
                              <p className="text-sm text-orange-700">Know that your loved ones will be taken care of and your wishes will be honored.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Data Protection Section */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-600" />
                        How We Protect Your Most Sensitive Information
                      </h3>
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Lock className="h-6 w-6 text-blue-600" />
                            </div>
                            <h4 className="font-semibold mb-2">Bank-Level Encryption</h4>
                            <p className="text-sm text-gray-600">AES-256 encryption protects your data both in transit and at rest.</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                              <Eye className="h-6 w-6 text-green-600" />
                            </div>
                            <h4 className="font-semibold mb-2">Zero-Knowledge Access</h4>
                            <p className="text-sm text-gray-600">Only you and approved trusted contacts can access your information.</p>
                          </div>
                          <div className="text-center">
                            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                              <UserCheck className="h-6 w-6 text-purple-600" />
                            </div>
                            <h4 className="font-semibold mb-2">Verified Release Process</h4>
                            <p className="text-sm text-gray-600">Admin-verified process ensures your data is only released when appropriate.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Smart Recommendations Section */}
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Gift className="h-5 w-5 text-green-600" />
                        Smart Estate Planning Tips
                      </h3>
                      <div className="space-y-4">
                        <div className="border-l-4 border-green-500 bg-green-50 p-4">
                          <h4 className="font-semibold text-green-900 mb-2">💡 Pro Tip: Use "Wishes" for Thoughtful Gifting</h4>
                          <p className="text-sm text-green-800">
                            Consider using the "Funeral Wishes" section to specify personal items you'd like given to specific people 
                            (jewelry, books, keepsakes). This keeps these gifts outside your formal will, potentially reducing 
                            probate complexity and ensuring meaningful items reach the right people quickly.
                          </p>
                        </div>
                        <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
                          <h4 className="font-semibold text-blue-900 mb-2">📋 Document Everything Important</h4>
                          <p className="text-sm text-blue-800">
                            Include account numbers, passwords, contact information for professionals (lawyer, accountant, financial advisor), 
                            and location of important documents. Your family will thank you for this level of detail.
                          </p>
                        </div>
                        <div className="border-l-4 border-purple-500 bg-purple-50 p-4">
                          <h4 className="font-semibold text-purple-900 mb-2">💝 Personal Messages Matter</h4>
                          <p className="text-sm text-purple-800">
                            Use the personal messages section to share what you couldn't say in person - gratitude, pride, 
                            love, and guidance for the future. These become treasured keepsakes for your loved ones.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Call to Action */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg text-center">
                      <h3 className="text-lg font-semibold mb-2">Ready to Create Your Digital Legacy Vault?</h3>
                      <p className="text-blue-100 mb-4">
                        Join families who have found peace of mind knowing their loved ones are prepared.
                      </p>
                      <Link href="/register">
                        <Button className="bg-white text-blue-600 hover:bg-gray-100">
                          Get Started Today
                        </Button>
                      </Link>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl shadow-xl p-16 flex items-center justify-center h-96">
              <svg
                className="w-48 h-48 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" opacity="0.3"/>
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.11V11c0 4.52-2.98 8.69-7 9.93-4.02-1.24-7-5.41-7-9.93V6.29l7-3.11z"/>
                <circle cx="12" cy="11" r="2"/>
                <path d="M12 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
              </svg>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
