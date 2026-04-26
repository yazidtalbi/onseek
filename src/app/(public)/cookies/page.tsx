import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PublicNavbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gray-50 py-20 border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-[#1A1A1A] mb-6" style={{ fontFamily: 'var(--font-expanded)' }}>
              Cookie Policy
            </h1>
            <p className="text-xl text-gray-500 font-medium">
              Last updated: April 26, 2026. How we use cookies to improve your Onseek experience.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>1. What are cookies?</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Cookies are small text files that are stored on your device when you visit a website. They help the website recognize your device and store certain information about your preferences or past actions.
              </p>

              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>2. How we use cookies</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Onseek uses cookies for various purposes, including:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-8 space-y-2">
                <li><strong>Essential Cookies:</strong> These are necessary for the website to function properly, such as keeping you logged in.</li>
                <li><strong>Performance Cookies:</strong> These help us understand how visitors interact with our platform by collecting information anonymously.</li>
                <li><strong>Functionality Cookies:</strong> These allow the website to remember choices you make (like your language preference) to provide a more personalized experience.</li>
              </ul>

              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>3. Third-party cookies</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We may also use third-party service providers, such as Google Analytics, who may place cookies on your device to help us analyze site traffic and usage patterns.
              </p>

              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>4. Managing your cookie preferences</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Most web browsers allow you to control cookies through their settings. You can choose to block or delete cookies, but please note that some parts of Onseek may not function correctly if you do so.
              </p>

              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4" style={{ fontFamily: 'var(--font-expanded)' }}>5. Updates to this policy</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We may update our Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
