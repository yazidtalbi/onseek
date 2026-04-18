import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gray-50 py-20 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-[#1A1A1A] mb-6" style={{ fontFamily: 'var(--font-expanded)' }}>
              Terms of Service
            </h1>
            <p className="text-xl text-gray-500 font-medium">
              Effective Date: April 16, 2026. Please read these terms carefully.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>1. Acceptance of Terms</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                By accessing or using Onseek, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>

              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>2. Description of Service</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Onseek is a community platform that allows users to crowdsource purchase links. Users can post "Requests" for items they want to find, and other users can provide "Submissions" with links to where those items can be purchased.
              </p>

              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>3. User Conduct</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                As a user of Onseek, you agree to:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-8 space-y-2">
                <li>Provide accurate and helpful links in your submissions.</li>
                <li>Respect other community members and avoid harassment.</li>
                <li>Not post spam, malicious links, or inappropriate content.</li>
                <li>Only create requests that are legal and comply with our guidelines.</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>4. Content Ownership</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You retain ownership of the content you post on Onseek. However, by posting content, you grant Onseek a worldwide, non-exclusive, royalty-free license to use, copy, and display that content in connection with providing our services.
              </p>

              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>5. Limitation of Liability</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Onseek is a platform for community-generated content. We do not guarantee the accuracy, availability, or pricing of any products linked in submissions. You use the platform and purchase items at your own risk.
              </p>

              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>6. Termination</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We reserve the right to suspend or terminate your account if you violate these terms or engage in behavior that harms the community or the platform.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
