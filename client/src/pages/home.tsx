import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lock, FileText, Users, Gift, Shield, Mail, Phone, MessageCircle } from "lucide-react";
import { ChatWidget } from "@/components/chat-widget";


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
                {/*footer support modal*/}
                 <Dialog>
                  <DialogTrigger asChild>
                    <li><span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Help Center</span></li>
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
                          <p className="text-green-600 font-medium">+44 1623 827900</p>
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
                            <p className="text-sm text-gray-600">Trusted contacts must submit a certified data release request. Upon submitting the certified request, your data is shared with those you have nominated as trusted contacts.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Can I update my information anytime?</h4>
                            <p className="text-sm text-gray-600">Yes! You can log in anytime to update your vault information, add new details, or modify your trusted contacts list.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2">Is there a cost to use Wishkeepers?</h4>
                            <p className="text-sm text-gray-600">The vault is free.</p>
                          </div>
                        </div>
                      </div>

                      {/* Emergency Support */}
                      <div className="bg-red-50 border-l-4 border-red-500 p-6">
                        <h3 className="text-lg font-semibold text-red-900 mb-2">Emergency Situations</h3>
                        <p className="text-red-800 mb-3">
                          If you need immediate assistance with accessing a vault due to a family emergency, please call our support line.
                        </p>
                        <p className="text-red-900 font-semibold">Emergency: +44 1623827900</p>
                        <p className="text-sm text-red-700">Available 24/7</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                {/*footer privacy modal*/}
                <Dialog>
                  <DialogTrigger asChild>
                    <li><span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Privacy Policy</span></li>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-center mb-4">
                        Wishkeepers Privacy Policy
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-8">
                      {/* Privacy Details */}
                      <div className="min-h-screen bg-white">
                        <div className="container mx-auto px-4 py-12">
                          <div className="mx-auto max-w-4xl prose prose-slate">
                            <p><strong>Last updated:</strong> 22nd October 2025</p>

                            <h2>1. Introduction</h2>
                            <p>
                              This Privacy Policy explains how <strong>Wishkeepers Ltd</strong> (“Wishkeepers”, “we”, “our”, or “us”)
                              collects, uses, and protects your information when you use our website and applications (the “Service”).
                            </p>
                            <p>We are committed to protecting your privacy and giving you full control over your personal information.</p>

                            <h2>2. Who We Are</h2>
                            <p>Wishkeepers Ltd is registered in England and Wales and acts as the data controller for personal data you provide.</p>
                            <p>Contact: <a href="mailto:privacy@wishkeepers.com">privacy@wishkeepers.com</a></p>

                            <h2>3. The Information We Collect</h2>
                            <ul>
                              <li>Account Information – name, email, password (encrypted).</li>
                              <li>Vault Content – your stored data, fully encrypted and unreadable by Wishkeepers.</li>
                              <li>Usage Information – anonymised analytics (browser, device type, etc.).</li>
                              <li>Trusted Contact Information – names and email addresses of nominated contacts.</li>
                            </ul>
                            <p>We do not sell, share, or monetise your personal data.</p>

                            <h2>4. Encryption and Data Security</h2>
                            <p>
                              All Vault contents are encrypted before leaving your device using modern cryptographic standards.
                              Wishkeepers cannot decrypt or view your stored content.
                            </p>
                            <p>Data is hosted securely in the United States on trusted infrastructure providers.</p>

                            <h2>5. How We Use Your Information</h2>
                            <ul>
                              <li>Provide and maintain your account.</li>
                              <li>Facilitate communication with Trusted Contacts.</li>
                              <li>Notify you of service changes.</li>
                              <li>Improve performance and stability (anonymous data only).</li>
                              <li>Comply with legal obligations.</li>
                            </ul>

                            <h2>6. Verification and Data Release</h2>
                            <p>
                              When a Trusted Contact declares a death, the declaration is self-certified and recorded. Vault access is then
                              automatically granted to nominated contacts. Wishkeepers does not manually verify declarations.
                            </p>

                            <h2>7. Legal Basis for Processing</h2>
                            <p>
                              We process data under the UK GDPR on the basis of contract performance, legitimate interest, and consent for communications.
                            </p>

                            <h2>8. Data Retention</h2>
                            <p>
                              Data is retained while your account is active. Upon deletion, all encrypted data is permanently destroyed and cannot be recovered.
                            </p>

                            <h2>9. Your Rights</h2>
                            <p>
                              You can access, correct, or delete your data, withdraw consent, or lodge a complaint with the
                              <a href="https://ico.org.uk" target="_blank" rel="noreferrer"> Information Commissioner’s Office</a>.
                            </p>

                            <h2>10. Children’s Privacy</h2>
                            <p>Wishkeepers is not intended for users under 16. Accounts created by minors will be deleted.</p>

                            <h2>11. International Transfers</h2>
                            <p>
                              Data stored in the United States is protected using appropriate safeguards to ensure UK-equivalent levels of protection.
                            </p>

                            <h2>12. Beta Disclaimer</h2>
                            <p>
                              Wishkeepers is currently in beta testing. While every effort is made to maintain privacy and security, occasional downtime or changes may occur.
                            </p>

                            <h2>13. Changes to This Policy</h2>
                            <p>
                              We may update this policy. We’ll notify you by email and post updates in-app. Continued use means acceptance of the revised version.
                            </p>

                            <h2>14. Contact</h2>
                            <p>Questions? <a href="mailto:privacy@wishkeepers.com">privacy@wishkeepers.com</a></p>

                            <h2>15. Governing Law</h2>
                            <p>This Privacy Policy is governed by the laws of England and Wales.</p>
                          </div>
                        </div>
                      </div>
                      </div>
                  </DialogContent>
                </Dialog>
                                
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {/*footer about us modal*/}
                <Dialog>
                  <DialogTrigger asChild>
                    <li><span className="text-gray-300 hover:text-white transition-colors cursor-pointer">About Us</span></li>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-center mb-4">
                        A Bit About Wishkeepers
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-8">
                      {/* Step-by-step Process */}
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-blue-50 rounded-xl">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Create Your Vault</h3>
                          <p className="text-gray-600">Register and start building your secure digital legacy vault with your important information.</p>
                        </div>

                        <div className="text-center p-6 bg-green-50 rounded-xl">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Store Information</h3>
                          <p className="text-gray-600">Add your funeral wishes, insurance details, important information, and personal messages - all encrypted and secure.</p>
                        </div>

                        <div className="text-center p-6 bg-purple-50 rounded-xl">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-purple-600" />
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
                              <Gift className="h-4 w-4 text-purple-500" />
                              Funeral Wishes & Personal Messages
                            </h4>
                            <p className="text-sm text-gray-600">Your preferences for services, personal items to gift, and heartfelt messages for loved ones.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Shield className="h-4 w-4 text-purple-500" />
                              Important Information
                            </h4>
                            <p className="text-sm text-gray-600">Policy numbers, account details (such as Socials), and important information your family will need.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Lock className="h-4 w-4 text-purple-500" />
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
                            <p className="text-gray-700">The request is certified to ensure security and authenticity</p>
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
                {/*footer how it works modal*/}
                <Dialog>
                  <DialogTrigger asChild>
                    <li><span className="text-gray-300 hover:text-white transition-colors cursor-pointer">How it Works</span></li>
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
                            <Lock className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Create Your Vault</h3>
                          <p className="text-gray-600">Register and start building your secure digital legacy vault with your important information.</p>
                        </div>
                        
                        <div className="text-center p-6 bg-green-50 rounded-xl">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText className="h-8 w-8 text-purple-600" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Store Information</h3>
                          <p className="text-gray-600">Add your funeral wishes, insurance details, important information, and personal messages - all encrypted and secure.</p>
                        </div>
                        
                        <div className="text-center p-6 bg-purple-50 rounded-xl">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="h-8 w-8 text-purple-600" />
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
                              <Gift className="h-4 w-4 text-purple-500" />
                              Funeral Wishes & Personal Messages
                            </h4>
                            <p className="text-sm text-gray-600">Your preferences for services, personal items to gift, and heartfelt messages for loved ones.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Shield className="h-4 w-4 text-purple-500" />
                              Important Information
                            </h4>
                            <p className="text-sm text-gray-600">Policy numbers, account details (such as Socials), and important information your family will need.</p>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Lock className="h-4 w-4 text-purple-500" />
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
                            <p className="text-gray-700">The request is certified to ensure security and authenticity</p>
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
                {/*footer terms modal*/}
                <Dialog>
                  <DialogTrigger asChild>
                    <li><span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-center mb-4">
                        Our Terms of Service
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-8">
                      {/* Terms Details */}
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <div className="space-y-3">
                          <div className="prose prose-slate max-w-none">
                            <p className="mt-2 text-sm text-gray-500">Last updated: 22nd October 2025</p>

                            <p className="mt-8 text-gray-700">
                              Welcome to Wishkeepers. These Terms of Service (“Terms”) govern your access to and use of the
                              Wishkeepers platform, website, and applications (the “Service”). The Service is operated by{" "}
                              <strong>Wishkeepers Ltd</strong> (“Wishkeepers”, “we”, “our”, or “us”). By creating an account
                              or using the Service, you agree to these Terms. If you do not agree, you must not use the Service.
                            </p>

                            <section className="mt-10">
                              <h2 className="text-xl font-semibold text-gray-900">1. About Wishkeepers</h2>
                              <p className="mt-3 text-gray-700">
                                Wishkeepers provides a secure, encrypted digital space (“Vault”) for individuals (“Primary Users”)
                                to store personal information, wishes, and other important records. Users can nominate “Trusted Contacts”
                                to access their Vault after their passing or under other specified conditions.
                              </p>
                            </section>

                            <section className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-900">2. Eligibility</h2>
                              <p className="mt-3 text-gray-700">
                                Wishkeepers is available to anyone aged 16 or over. If you are under 18, you must have permission from
                                a parent or guardian to use the Service. By using Wishkeepers, you confirm that you are legally able to
                                enter into these Terms.
                              </p>
                            </section>

                            <section className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-900">3. Accounts and Access</h2>
                              <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
                                <li>Each user must create an individual account.</li>
                                <li>
                                  Primary Users can nominate, edit, or remove Trusted Contacts at any time. Trusted Contacts can see that
                                  they are nominated and manage their own Vault (if they create one), but cannot access a Primary User’s
                                  data while the Primary User is alive.
                                </li>
                                <li>
                                  Trusted Contacts will only gain access to the Primary User’s data once a verified death declaration is
                                  submitted.
                                </li>
                                <li>
                                  Verification is performed by the Trusted Contact via a self-certified declaration; this declaration is
                                  recorded in our database. Wishkeepers does not manually review or intervene in this process.
                                </li>
                                <li>
                                  Wishkeepers Admins may manage user accounts and monitor usage, but they <strong>cannot view or decrypt</strong>{" "}
                                  any stored data.
                                </li>
                              </ul>
                            </section>

                            <section className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-900">4. Data Storage and Encryption</h2>
                              <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
                                <li>All user Vaults are end-to-end encrypted; Wishkeepers staff cannot access or decrypt stored content.</li>
                                <li>Data is securely hosted on servers located in North America (United States).</li>
                                <li>
                                  While we take reasonable measures to protect your data, no online service is 100% secure. You are
                                  responsible for keeping your login credentials secure and confidential.
                                </li>
                              </ul>
                            </section>

                            <section className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-900">5. Beta Release</h2>
                              <p className="mt-3 text-gray-700">
                                Wishkeepers is currently in <strong>beta</strong>. Features may change, data may be moved or removed, and the
                                Service may occasionally be unavailable. By using the beta, you acknowledge these risks and agree that we are
                                not liable for any data loss, downtime, or technical issues during this period.
                              </p>
                            </section>

                            <section className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-900">6. Use of the Service</h2>
                              <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
                                <li>Do not use Wishkeepers for unlawful or harmful purposes.</li>
                                <li>Do not attempt to access other users’ encrypted data.</li>
                                <li>Do not interfere with or disrupt the security or operation of the Service.</li>
                                <li>Do not upload viruses, malicious code, or content designed to harm others.</li>
                              </ul>
                              <p className="mt-3 text-gray-700">
                                Wishkeepers is designed for personal use and private storage only. Commercial or shared use is not permitted
                                without prior written consent.
                              </p>
                            </section>

                            <section className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-900">7. Trusted Contacts and Data Release</h2>
                              <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
                                <li>
                                  Upon a self-certified death declaration by a Trusted Contact, the system automatically releases the Primary
                                  User’s encrypted Vault to their nominated Trusted Contacts.
                                </li>
                                <li>Wishkeepers does not verify the factual accuracy of any declaration.</li>
                                <li>
                                  We are not responsible for misuse, false declarations, or disputes between users arising from this process.
                                </li>
                                <li>Primary Users are advised to communicate nominations and wishes clearly to their Trusted Contacts.</li>
                              </ul>
                            </section>

                            <section className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-900">8. Payments</h2>
                              <p className="mt-3 text-gray-700">
                                Wishkeepers is currently free to use. We may introduce premium or commercial features in the future. If that
                                happens, we’ll update these Terms and notify you by email before any charges are applied.
                              </p>
                            </section>

                            <section className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-900">9. Third-Party Links and Referrals</h2>
                              <p className="mt-3 text-gray-700">
                                Wishkeepers may include links to partners, affiliates, or external services in the future (e.g., insurers,
                                financial planners, or memorial service providers). These links are provided for convenience only. Wishkeepers
                                is not responsible for their content, accuracy, or privacy practices.
                              </p>
                            </section>

                            <section className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-900">10. Intellectual Property</h2>
                              <p className="mt-3 text-gray-700">
                                All intellectual property rights in the Service (excluding your uploaded content) belong to Wishkeepers Ltd.
                                You retain ownership of any data or materials you upload but grant Wishkeepers a limited right to store and
                                process that data for the purpose of providing the Service.
                              </p>
                            </section>

                            <section className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-900">11. Limitation of Liability</h2>
                              <ul className="mt-3 list-disc pl-6 text-gray-700 space-y-2">
                                <li>The Service is provided “as is” and “as available.”</li>
                                <li>We do not guarantee that the Service will be uninterrupted or error-free.</li>
                                <li>
                                  To the maximum extent permitted by law, we are not liable for any loss of data, corruption, delay, or
                                  indirect, incidental, special, consequential, or exemplary damages resulting from your use of the Service or
                                  reliance on information within it.
                                </li>
                                <li>Your sole remedy for dissatisfaction with the Service is to stop using it.</li>
                              </ul>
                            </section>

                            <section className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-900">12. Termination</h2>
                              <p className="mt-3 text-gray-700">
                                You may close your account at any time. Wishkeepers may suspend or terminate your account if you violate these
                                Terms or misuse the Service. Upon deletion, all encrypted data associated with your account will be permanently
                                destroyed and cannot be recovered.
                              </p>
                            </section>

                            <section className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-900">13. Changes to These Terms</h2>
                              <p className="mt-3 text-gray-700">
                                We may update these Terms occasionally. When we do, we’ll notify you by <strong>email</strong> and post the
                                updated version on our website. Your continued use of the Service after updates means you accept the revised
                                Terms.
                              </p>
                            </section>

                            <section className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-900">14. Governing Law</h2>
                              <p className="mt-3 text-gray-700">
                                These Terms and your use of Wishkeepers are governed by the laws of <strong>England and Wales</strong>, and any
                                disputes will be handled exclusively by the courts of England and Wales.
                              </p>
                            </section>

                            <section className="mt-8">
                              <h2 className="text-xl font-semibold text-gray-900">15. Contact</h2>
                              <p className="mt-3 text-gray-700">
                                If you have any questions about these Terms, please contact:{" "}
                                <a href="mailto:legal@wishkeepers.com" className="text-blue-600 underline">
                                  legal@wishkeepers.com
                                </a>
                                .
                              </p>
                            </section>

                            <div className="mt-10 rounded-md border border-amber-300 bg-amber-50 p-4">
                              <p className="text-sm text-amber-900">
                                <strong>Beta Notice:</strong> Wishkeepers is currently in open beta. While we take every precaution to protect
                                your privacy and data, please use the Service with this understanding.
                              </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    </div>  
                  </DialogContent>
                </Dialog>
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
