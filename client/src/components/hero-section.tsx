import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-white to-blue-50 py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          <div className="mb-12 lg:mb-0">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Protect Your Legacy.<br />
              <span className="text-blue-600">Peace of Mind</span> for Your Loved Ones.
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Securely store your important information, funeral wishes, and personal messages. 
              Ensure your family has everything they need when the time comes.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex">
              <Link href="/register">
                <Button className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 text-lg hover:bg-blue-700">
                  Create Your Vault
                </Button>
              </Link>
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg">
                Learn More
              </Button>
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
