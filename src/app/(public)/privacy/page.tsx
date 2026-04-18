import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gray-50 py-20 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-[#1A1A1A] mb-6" style={{ fontFamily: 'var(--font-expanded)' }}>
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-500 font-medium">
              Last updated: April 16, 2026. Your privacy is our priority.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>1. Information We Collect</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                When you use Onseek, we collect information that helps us provide a better experience. This includes:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-8 space-y-2">
                <li><strong>Account Information:</strong> Your name, email address, and profile picture when you sign up.</li>
                <li><strong>User-Generated Content:</strong> The requests you post and the links/submissions you share.</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our platform, including search queries and pages viewed.</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>2. How We Use Your Information</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We use the information we collect to operate, maintain, and improve our services, including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-8 space-y-2">
                <li>To facilitate requests and discovery within the community.</li>
                <li>To personalize your experience and provide relevant content.</li>
                <li>To communicate with you about updates, security, and support.</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>3. Information Sharing</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Onseek does not sell your personal information to third parties. We may share information with service providers who help us operate our platform or when required by law.
              </p>

              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>4. Data Security</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>

              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>5. Your Choices</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                You can access, update, or delete your account information at any time through your profile settings. If you wish to delete your account permanently, please contact our support team.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
