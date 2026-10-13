import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions — SBS Store | Shyam Bombay Sale',
  description: 'Terms and Conditions for browsing and purchasing from Shyam Bombay Sale (SBS Store), Vadodara.',
  alternates: {
    canonical: 'https://www.sbsstore.in/terms',
  },
};

export default function TermsPage() {
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
            <span className="text-[11px] font-black uppercase tracking-wider text-[#F95721] bg-orange-50 px-2.5 py-1 rounded-full">
              Legal Agreement
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-2">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs text-gray-400 mt-1">Last updated: October 2026</p>
          </div>

          <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">1. Introduction &amp; Ownership</h2>
              <p>
                Welcome to <strong>SBS Store (sbsstore.in)</strong>, operated by <strong>Shyam Bombay Sale</strong> (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), located at Shop 1, Vrundvilla, Ambedkar Nagar Housing Society, Laxmipura Road, Near Rami School, Subhanpura, Vadodara, Gujarat 390023. By accessing our website, browsing our product catalog, or placing an order, you agree to be legally bound by these Terms and Conditions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">2. Eligibility &amp; Account Registration</h2>
              <p>
                To place an order, you must provide accurate, current, and complete customer information, including your legal name, mobile number, and valid shipping address. You are responsible for maintaining the confidentiality of your account credentials and any activity conducted under your account.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">3. Products, Pricing &amp; Availability</h2>
              <p>
                All prices displayed on <strong>sbsstore.in</strong> are in Indian Rupees (INR ₹) inclusive of applicable taxes unless specified otherwise. We reserve the right to modify prices, discontinue products, or adjust quantities without prior notice. While we strive to display accurate product details, dimensions, and colors, slight variations may occur due to photography lighting and device displays.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">4. Orders &amp; Payment Processing</h2>
              <p>
                Orders can be placed via our website using verified online payment methods (including UPI, Credit/Debit Cards, Net Banking, and Wallets processed securely via Razorpay) or Cash on Delivery (COD) where available. An order is confirmed once payment authorization is received or COD is verified. We reserve the right to cancel any order in case of stock unavailability, pricing errors, or suspected fraudulent activity.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">5. Shipping &amp; Delivery</h2>
              <p>
                Orders are dispatched within 24–48 hours of confirmation. Delivery times range between 2 to 5 business days depending on your delivery pincode across India. For full details, please refer to our <Link href="/shipping-policy" className="text-[#F95721] font-semibold underline">Shipping &amp; Delivery Policy</Link>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">6. Returns, Replacements &amp; Refunds</h2>
              <p>
                We offer a 7-day return and replacement policy for eligible products received damaged, defective, or incorrect. For full conditions, timelines, and refund credit details, please consult our <Link href="/refund-policy" className="text-[#F95721] font-semibold underline">Refund &amp; Cancellation Policy</Link>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">7. Intellectual Property</h2>
              <p>
                All content, trademarks, logos, photographs, and text on this website are the property of Shyam Bombay Sale. Unauthorized reproduction, modification, or distribution is strictly prohibited.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">8. Governing Law &amp; Jurisdiction</h2>
              <p>
                These Terms and Conditions shall be governed by and interpreted in accordance with the laws of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the courts located in Vadodara, Gujarat.
              </p>
            </section>

            <section className="space-y-2 pt-4 border-t border-gray-100">
              <h2 className="text-base font-bold text-gray-900">9. Contact Information</h2>
              <p>For any questions or clarification regarding these Terms, please contact us at:</p>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-1 text-xs">
                <p><strong>Entity:</strong> Shyam Bombay Sale (SBS Store)</p>
                <p><strong>Email:</strong> shyambombaysale@gmail.com</p>
                <p><strong>Phone:</strong> +91 92262 94797</p>
                <p><strong>Address:</strong> Shop 1, Vrundvilla, Ambedkar Nagar Housing Society, Laxmipura Road, Subhanpura, Vadodara, Gujarat 390023</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
