import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy — SBS Store | Shyam Bombay Sale',
  description: '7-day hassle-free return, replacement, and refund policy for orders placed on SBS Store (sbsstore.in).',
  alternates: {
    canonical: 'https://www.sbsstore.in/refund-policy',
  },
};

export default function RefundPolicyPage() {
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
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
              Customer Assurance
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight mt-2">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="text-xs text-gray-400 mt-1">Last updated: October 2026</p>
          </div>

          <div className="space-y-5 text-sm text-gray-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">1. Order Cancellation Policy</h2>
              <p>
                Customers may cancel an order anytime <strong>before it is dispatched</strong> for shipping.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>To cancel an order before dispatch, navigate to your <strong>Profile &gt; My Orders</strong> on the website or message us on WhatsApp with your Order ID at <strong>+91 92262 94797</strong>.</li>
                <li>If the order was prepaid (via Razorpay UPI, card, or netbanking), a full 100% refund will be initiated immediately upon cancellation.</li>
                <li>Orders that have already been dispatched cannot be cancelled in transit but can be returned or rejected upon delivery.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">2. 7-Day Return &amp; Replacement Window</h2>
              <p>
                At <strong>Shyam Bombay Sale (SBS Store)</strong>, customer satisfaction is our top priority. We offer a <strong>7-Day Return &amp; Replacement Policy</strong> from the date of delivery for items meeting the following criteria:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Item arrived damaged, defective, or malfunctioning.</li>
                <li>Incorrect product, size, or variant delivered compared to what was ordered.</li>
                <li>Missing components, accessories, or parts mentioned in the product description.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">3. Return Conditions</h2>
              <p>
                To qualify for a valid return and refund:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>The item must be in its original, unused condition with all original tags, accessories, instruction manuals, and packaging intact.</li>
                <li>Proof of purchase (Order number or invoice) must accompany the request.</li>
                <li>Personal care, hygiene, or consumable items once unsealed are non-returnable unless arrived defective.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">4. Refund Process &amp; Timelines</h2>
              <p>
                Once your returned item is received at our store or inspection facility and verified by our quality team:
              </p>
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-xs space-y-2 text-emerald-950">
                <p className="font-bold text-sm">⏱️ Refund Credit Timeline:</p>
                <p>• <strong>Prepaid Orders (Razorpay UPI, Debit/Credit Card, Net Banking):</strong> Refunds are processed back to the original payment source within <strong>5 to 7 business days</strong>.</p>
                <p>• <strong>Cash on Delivery (COD) Orders:</strong> Refunds are credited directly to your verified bank account or UPI ID (Google Pay, PhonePe, Paytm) within <strong>3 to 5 business days</strong> of approval.</p>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-gray-900">5. How to Initiate a Return</h2>
              <p>
                Initiating a return is simple:
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-xs">
                <li>Open <strong>My Orders</strong> on <strong>sbsstore.in</strong> and select the order you wish to return.</li>
                <li>Click <strong>Request Return / Replacement</strong> and attach photos or a short video of the issue.</li>
                <li>Alternatively, contact us directly via WhatsApp or Phone at <strong>+91 92262 94797</strong> or email <strong>shyambombaysale@gmail.com</strong> with your Order ID. Our customer support team will assist you with pickup arrangements within 24 hours.</li>
              </ol>
            </section>

            <section className="space-y-2 pt-4 border-t border-gray-100">
              <h2 className="text-base font-bold text-gray-900">6. Customer Help Desk</h2>
              <p>For urgent questions or assistance with returns and refunds:</p>
              <div className="bg-gray-50 rounded-2xl p-4 space-y-1 text-xs">
                <p><strong>Entity:</strong> Shyam Bombay Sale (SBS Store)</p>
                <p><strong>Support Email:</strong> shyambombaysale@gmail.com</p>
                <p><strong>Helpline:</strong> +91 92262 94797</p>
                <p><strong>Operating Hours:</strong> 10:00 AM – 9:30 PM (All 7 Days)</p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
