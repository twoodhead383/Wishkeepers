import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, Users, Lock, FileText, Gift, Clock, CheckCircle, Eye, UserCheck, Scroll, ChevronDown } from "lucide-react";
import familyImage from "@assets/family-happy-kids-hug-with-funny-quality-time-with-smile-elderly-people-portrait-senior-grandparents-parents-children-laughing-with-happiness-love-care-together-smiling_1755002269825.jpg";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 py-20 lg:py-32 overflow-hidden">
      {/* Wave overlay effect */}
      <div className="absolute inset-0 opacity-10">
        <svg
          className="absolute top-0 left-0 w-full h-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,133.3C672,139,768,181,864,181.3C960,181,1056,139,1152,128C1248,117,1344,139,1392,149.3L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            fill="currentColor"
            className="text-white"
          />
          <path
            d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            fill="currentColor"
            className="text-white opacity-50"
          />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div className="mb-12 lg:mb-0 text-white">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Welcome to<br />
              WishKeepers
            </h1>
            <p className="text-xl lg:text-2xl text-orange-300 mb-8 leading-relaxed">
              Helping you and your loved ones<br />
              with your end of life wishes.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
              <Link href="/register">
                <Button className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 text-lg rounded-full">
                  Let's Begin
                </Button>
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full sm:w-auto px-8 py-3 text-lg text-white hover:bg-white/10 flex items-center gap-2">
                    Learn more
                    <ChevronDown className="h-4 w-4" />
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
          
          {/* Family Image with Overlay Effect */}
          <div className="relative lg:flex lg:justify-end">
            <div className="relative max-w-sm mx-auto lg:mx-0">
              {/* Main family image */}
              <div className="relative overflow-hidden rounded-3xl bg-white/20 backdrop-blur-sm p-1">
                <img 
                  src={familyImage} 
                  alt="Happy family with multiple generations" 
                  className="w-full h-80 object-cover rounded-2xl"
                />
                
                {/* Overlay grid lines effect */}
                <div className="absolute inset-1 rounded-2xl pointer-events-none">
                  {/* Vertical line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30 transform -translate-x-px"></div>
                  {/* Horizontal line */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/30 transform -translate-y-px"></div>
                </div>
                
                {/* Corner accent overlays */}
                <div className="absolute top-1 left-1 w-16 h-16 bg-white/10 rounded-br-3xl"></div>
                <div className="absolute top-1 right-1 w-16 h-16 bg-white/10 rounded-bl-3xl"></div>
                <div className="absolute bottom-1 left-1 w-16 h-16 bg-white/10 rounded-tr-3xl"></div>
                <div className="absolute bottom-1 right-1 w-16 h-16 bg-white/10 rounded-tl-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
