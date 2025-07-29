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
            <img 
              src="https://images.unsplash.com/photo-1544027993-37dbf35d25cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Peaceful hands holding a small plant, symbolizing growth, care, and legacy" 
              className="rounded-2xl shadow-xl w-full h-auto"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
