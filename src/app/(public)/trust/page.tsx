import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Shield, CheckCircle, Users, Lock } from "lucide-react";

export default function TrustPage() {
  const trustPillars = [
    {
      icon: Shield,
      title: "Verified Community",
      description: "We use robust verification processes to ensure that all users on Onseek are authentic and committed to a high-trust marketplace."
    },
    {
      icon: CheckCircle,
      title: "Structured Proposals",
      description: "Every deal on Onseek starts with a structured proposal, ensuring price transparency and clear specifications before any commitment."
    },
    {
      icon: Users,
      title: "Community Ratings",
      description: "Our community-driven rating system holds everyone accountable, rewarding helpful sources and reliable buyers."
    },
    {
      icon: Lock,
      title: "Secure Infrastructure",
      description: "We employ industry-leading security protocols to protect your data and ensure that your interactions remain private and safe."
    }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[#6925DC] py-24 text-white">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6" style={{ fontFamily: 'var(--font-expanded)' }}>
              Trust & Safety
            </h1>
            <p className="text-xl text-white/80 font-medium max-w-2xl leading-relaxed">
              At Onseek, trust is the foundation of our request-first marketplace. We've built safety into every interaction.
            </p>
          </div>
        </section>

        {/* Pillars Section */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {trustPillars.map((pillar, i) => (
                <div key={i} className="flex gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#6925DC]/5 flex items-center justify-center shrink-0">
                    <pillar.icon className="w-7 h-7 text-[#6925DC]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3" style={{ fontFamily: 'var(--font-expanded)' }}>
                      {pillar.title}
                    </h3>
                    <p className="text-lg text-gray-500 leading-relaxed font-medium">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Guidelines Section */}
        <section className="py-24 bg-gray-50 border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-3xl font-bold text-[#1A1A1A] mb-8" style={{ fontFamily: 'var(--font-expanded)' }}>Our Commitment to Safety</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We believe that the best marketplace is one where users feel safe and empowered. To maintain this environment, we enforce strict community guidelines:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-12 space-y-4">
                <li><strong>No Harassment:</strong> We have a zero-tolerance policy for harassment, hate speech, or any form of abusive behavior.</li>
                <li><strong>Fair Trading:</strong> Misleading descriptions, bait-and-switch pricing, and fraudulent activities are strictly prohibited.</li>
                <li><strong>Privacy First:</strong> Users should respect the privacy of others and never share personal contact information outside of structured deal flows.</li>
              </ul>
              
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <h4 className="text-xl font-bold text-[#1A1A1A] mb-4">Reporting an issue?</h4>
                <p className="text-gray-600 mb-6">Our trust and safety team is available 24/7 to review reports and take action against policy violations.</p>
                <a href="mailto:safety@onseek.co" className="inline-flex items-center gap-2 font-bold text-[#6925DC] hover:opacity-80 transition-opacity">
                  Contact Support →
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
