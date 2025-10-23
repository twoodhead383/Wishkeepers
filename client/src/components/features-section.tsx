import { Shield, Users, Gift } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: "Secure Storage",
      description: "Your sensitive information is protected with bank-level encryption and stored securely.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Users,
      title: "Trusted Contacts",
      description: "Nominate trusted friends or family members who can access your vault when needed.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Gift,
      title: "Personal Messages",
      description: "Leave heartfelt messages and special instructions for your loved ones.",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How Wishkeepers Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple, secure, and thoughtfully designed to help you prepare for life's most important moments.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-xl">
                <div className={`w-16 h-16 ${feature.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <Icon className={`h-8 w-8 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
