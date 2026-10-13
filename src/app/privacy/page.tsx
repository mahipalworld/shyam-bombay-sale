import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy — SBS Store | Shyam Bombay Sale',
  description: 'Privacy Policy for Shyam Bombay Sale (SBS Store). Learn how we protect and handle your personal data.',
  alternates: {
    canonical: 'https://www.sbsstore.in/privacy',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-800">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center group py-0.5" aria-label="SBS Home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/sbs-wordmark.svg"
              alt="SBS Store — Shyam Bombay Sale"
              className="h-6.5 sm:h-7.5 w-auto object-contain group-hover:scale-105 group-active:scale-95 transition-transform"
            />
          </Link>
          <nav className="flex items-center gap-4 text-xs font-bold text-gray-600">
            <Link href="/" className="hover:text-[#F95721] transition-colors">Home</Link>
            <Link href="/about" className="hover:text-[#F95721] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#F95721] transition-colors">Contact</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-xs space-y-6">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              Data Protection
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-2">
              Privacy Policy
            </h1>
            <p className="text-xs text-gray-400 mt-1">Last updated: October 2026</p>
          </div>

          <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">1. Information We Collect</h2>
              <p>
                When you visit or place an order on <strong>sbsstore.in</strong>, we collect personal information necessary to fulfill your purchases and provide customer support:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Contact Details:</strong> Full name, email address, and mobile phone number.</li>
                <li><strong>Delivery Details:</strong> Street address, landmark, city, state, and postal pincode.</li>
                <li><strong>Payment Information:</strong> Transaction identifiers and payment confirmation from our authorized payment gateway partners (Razorpay). <em>We never store credit card numbers, CVVs, or bank passwords on our servers.</em></li>
                <li><strong>Device &amp; Usage Data:</strong> IP address, browser type, and interaction logs to improve website speed and security.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">2. How We Use Your Information</h2>
              <p>Your data is used strictly for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Processing, packing, and dispatching your orders.</li>
                <li>Sending order confirmation, dispatch alerts, and delivery tracking notifications via SMS and WhatsApp.</li>
                <li>Administering the SBS Club Rewards points program.</li>
                <li>Preventing fraudulent orders and securing the website.</li>
                <li>Responding to customer service inquiries and return requests.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">3. Sharing with Third Parties</h2>
              <p>
                We value your privacy. <strong>We do not sell, rent, or trade your personal information.</strong> We only share relevant details with trusted third parties essential for operations:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Payment Gateways (Razorpay):</strong> To securely process UPI, card, and net banking transactions under PCI-DSS compliance.</li>
                <li><strong>Logistics &amp; Courier Partners:</strong> To safely deliver parcels to your shipping address.</li>
                <li><strong>Legal Authorities:</strong> When required by applicable Indian law, regulation, or court order.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">4. Security Measures</h2>
              <p>
                We use 256-bit SSL encryption, restricted administrative access, and secure cloud storage to protect your personal information against unauthorized access, alteration, or disclosure.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">5. Cookies &amp; Local Storage</h2>
              <p>
                We use cookies and browser local storage to remember your shopping cart items, keep you securely signed in, and preserve your delivery preferences for a seamless checkout experience.
              </p>
            </section>

            <section className="space-y-2 pt-4 border-t border-gray-100">
              <h2 className="text-base font-bold text-gray-900">6. Privacy Inquiries &amp; Grievance Officer</h2>
              <p>If you have any questions or requests regarding your data, please contact our support team:</p>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-1 text-xs">
                <p><strong>Entity:</strong> Shyam Bombay Sale (SBS Store)</p>
                <p><strong>Email:</strong> shyambombaysale@gmail.com</p>
                <p><strong>Phone:</strong> +91 92262 94797</p>
                <p><strong>Address:</strong> Subhanpura, Vadodara, Gujarat 390023</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
