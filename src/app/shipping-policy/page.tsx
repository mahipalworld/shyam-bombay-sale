import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Shipping & Delivery Policy — SBS Store | Shyam Bombay Sale',
  description: 'Pan-India fast shipping policy, dispatch timelines, and delivery rates for SBS Store (sbsstore.in).',
  alternates: {
    canonical: 'https://www.sbsstore.in/shipping-policy',
  },
};

export default function ShippingPolicyPage() {
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
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
              Logistics &amp; Delivery
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-2">
              Shipping &amp; Delivery Policy
            </h1>
            <p className="text-xs text-gray-400 mt-1">Last updated: October 2026</p>
          </div>

          <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">1. Coverage &amp; Delivery Locations</h2>
              <p>
                <strong>Shyam Bombay Sale (SBS Store)</strong> delivers across all serviceable pincodes in India through premier courier and logistics partners (including Delhivery, Blue Dart, Xpressbees, and India Post). We also offer expedited local doorstep delivery within Vadodara city.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">2. Order Processing &amp; Dispatch Time</h2>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Orders received before 2:00 PM are processed and packed on the <strong>same business day</strong>.</li>
                <li>All orders are dispatched from our Vadodara warehouse within <strong>24 to 48 hours</strong> of order verification.</li>
                <li>Orders placed on national holidays or Sundays are dispatched on the next business day.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">3. Estimated Delivery Timelines</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-orange-50/60 border border-orange-200/70 rounded-2xl p-3.5 space-y-1">
                  <span className="font-bold text-xs text-gray-900 block">Vadodara &amp; Gujarat State</span>
                  <p className="text-xs text-gray-600 font-medium">1 to 2 Business Days (Express Delivery)</p>
                </div>
                <div className="bg-gray-50 border border-gray-200/70 rounded-2xl p-3.5 space-y-1">
                  <span className="font-bold text-xs text-gray-900 block">Rest of India (Metro &amp; Tier 1/2 Cities)</span>
                  <p className="text-xs text-gray-600 font-medium">3 to 5 Business Days</p>
                </div>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">4. Shipping Charges</h2>
              <p>
                We strive to keep shipping transparent with zero hidden fees:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><strong>Free Delivery:</strong> Available on orders meeting the minimum store threshold or promotional offers.</li>
                <li><strong>Standard Shipping:</strong> For smaller carts, a nominal shipping fee is displayed transparently at checkout before payment.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">5. Shipment Tracking</h2>
              <p>
                Once your order is handed over to our courier partner, you will receive an SMS and WhatsApp message with your unique <strong>Tracking ID</strong>. You can also track your shipment live at any time by visiting <strong>My Orders</strong> on <strong>sbsstore.in</strong>.
              </p>
            </section>

            <section className="space-y-2 pt-4 border-t border-gray-100">
              <h2 className="text-base font-bold text-gray-900">6. Delivery Queries &amp; Assistance</h2>
              <p>If you experience any delay or issue with your parcel delivery, our team is here to assist:</p>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-1 text-xs">
                <p><strong>Entity:</strong> Shyam Bombay Sale (SBS Store)</p>
                <p><strong>Dispatch Hub:</strong> Shop 1, Vrundvilla, Ambedkar Nagar, Laxmipura Road, Subhanpura, Vadodara 390023</p>
                <p><strong>Helpline:</strong> +91 92262 94797</p>
                <p><strong>Email:</strong> shyambombaysale@gmail.com</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
