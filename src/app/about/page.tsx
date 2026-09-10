import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About SBS — Shyam Bombay Sale | Who We Are & Store Story',
  description:
    'Learn about Shyam Bombay Sale (SBS Store), your trusted destination for smart everyday essentials, household cleaning products, and kitchenware in Vadodara and online across India.',
  alternates: {
    canonical: 'https://www.sbsstore.in/about',
  },
  openGraph: {
    title: 'About SBS — Shyam Bombay Sale',
    description:
      'Learn about Shyam Bombay Sale (SBS Store), offering quality everyday essentials, home & kitchen goods in Subhanpura, Vadodara and delivered across India.',
    url: 'https://www.sbsstore.in/about',
    siteName: 'SBS — Shyam Bombay Sale',
    type: 'website',
    images: [
      {
        url: 'https://www.sbsstore.in/logo.png',
        width: 800,
        height: 600,
        alt: 'SBS — Shyam Bombay Sale Logo',
      },
    ],
  },
};

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://www.sbsstore.in/about#webpage',
  'url': 'https://www.sbsstore.in/about',
  'name': 'About SBS — Shyam Bombay Sale',
  'description': 'About page for Shyam Bombay Sale (SBS Store).',
  'isPartOf': { '@id': 'https://www.sbsstore.in/#website' },
  'about': { '@id': 'https://www.sbsstore.in/#organization' },
};

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      <div className="min-h-screen bg-[#F8F9FA]">
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png?v=3"
                alt="SBS — Shyam Bombay Sale"
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <span className="text-base font-black text-gray-900 group-hover:text-[#F95721] transition-colors">
                STORE
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-xs font-bold text-gray-600">
              <Link href="/" className="hover:text-[#F95721] transition-colors">Home</Link>
              <Link href="/contact" className="hover:text-[#F95721] transition-colors">Contact</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs text-gray-500">
              <li><Link href="/" className="hover:text-[#F95721] transition-colors">Home</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-gray-900 font-semibold">About</li>
            </ol>
          </nav>

          <div className="mb-12">
            <span className="inline-block text-xs font-bold text-[#F95721] uppercase tracking-widest mb-3">
              About Us
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              Shyam Bombay Sale (SBS)
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
              Your destination for smart everyday essentials — quality products for your home, kitchen, and daily life, both in our offline store and delivered across India.
            </p>
          </div>

          <div className="space-y-10 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">Who We Are</h2>
              <p>
                <strong>Shyam Bombay Sale</strong> (also operating digitally as <strong>SBS — Shyam Business Store</strong>) is a trusted retail establishment based in <strong>Vadodara, Gujarat</strong>. We specialise in practical, well-made everyday essentials at fair prices, focusing on products that make daily life easier: household cleaning solutions, kitchen tools, personal care, and home organisation.
              </p>
              <p className="mt-3">
                Whether you visit us at our local offline store in Subhanpura or order online through{' '}
                <Link href="/" className="text-[#F95721] font-semibold hover:underline">sbsstore.in</Link>, you get the same dedication to genuine quality and fair, transparent pricing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">Our Offline Retail Store</h2>
              <div className="p-6 bg-white rounded-2xl border border-gray-200/80 shadow-sm space-y-3">
                <p className="font-bold text-gray-900">
                  📍 Shop 1, Vrundvilla, Ambedkar Nagar Housing Society, Laxmipura Road, near Rami School, Subhanpura, Vadodara, Gujarat 390023
                </p>
                <p className="text-sm text-gray-600">
                  Open 7 days a week: <strong>10:00 AM to 9:30 PM</strong>.
                </p>
                <div>
                  <a
                    href="https://share.google/Pa5CkR6pMiRD0MMZm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 underline underline-offset-4"
                  >
                    <span>Find Shyam Bombay Sale on Google Maps</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">What We Offer</h2>
              <p>At Shyam Bombay Sale (SBS), we curate products across everyday categories including:</p>
              <ul className="mt-3 space-y-1.5 list-disc list-inside text-gray-600">
                <li>Household cleaning supplies & housekeeping products</li>
                <li>Kitchen essentials, tools, and organizers</li>
                <li>Home decor & utility items</li>
                <li>Personal care & grooming essentials</li>
                <li>Smart storage & daily convenience accessories</li>
              </ul>
              <p className="mt-3">
                Every product is selected to be useful, durable, and affordable — offering honest value for every rupee spent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">Our Commitment</h2>
              <p>
                We believe everyday shopping should be simple, reliable, and trustworthy. We stand behind every product we sell. If you ever have a question, need product recommendations, or need help with an order, our team is accessible by phone, WhatsApp, or in person at our store.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">Get in Touch</h2>
              <p>
                Have a question or need assistance? Visit our{' '}
                <Link href="/contact" className="text-[#F95721] font-semibold hover:underline">Contact & Store Location page</Link>{' '}
                for direct WhatsApp support and map directions, or head back to the{' '}
                <Link href="/" className="text-[#F95721] font-semibold hover:underline">SBS Store homepage</Link>.
              </p>
            </section>
          </div>

          <div className="mt-12 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-black text-gray-900">Ready to explore SBS Store?</p>
              <p className="text-xs text-gray-500 mt-0.5">Discover smart everyday essentials on our online store.</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white text-sm font-bold rounded-xl shadow-sm transition-all whitespace-nowrap"
            >
              Explore Online Store →
            </Link>
          </div>
        </main>

        <footer className="border-t border-gray-200 mt-16 py-8 text-center text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()}{' '}
            <Link href="/" className="hover:text-[#F95721] transition-colors font-semibold">
              Shyam Bombay Sale (SBS Store)
            </Link>. All rights reserved.
          </p>
          <nav className="mt-2 flex items-center justify-center gap-4">
            <Link href="/" className="hover:text-[#F95721] transition-colors">Home</Link>
            <Link href="/about" className="hover:text-[#F95721] transition-colors">About</Link>
            <Link href="/contact" className="hover:text-[#F95721] transition-colors">Contact</Link>
          </nav>
        </footer>
      </div>
    </>
  );
}
