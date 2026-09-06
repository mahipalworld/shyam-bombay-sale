import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About SBS — Shyam Business Store | Who We Are',
  description:
    'Learn about SBS — Shyam Business Store, your destination for smart everyday essentials. Home, kitchen, cleaning, personal care products with genuine quality and fair prices.',
  alternates: {
    canonical: 'https://www.sbsstore.in/about',
  },
  openGraph: {
    title: 'About SBS — Shyam Business Store',
    description:
      'Learn about SBS — Shyam Business Store, your destination for smart everyday essentials delivered across India.',
    url: 'https://www.sbsstore.in/about',
    siteName: 'SBS — Shyam Business Store',
    type: 'website',
    images: [
      {
        url: 'https://www.sbsstore.in/logo.png',
        width: 800,
        height: 600,
        alt: 'SBS — Shyam Business Store Logo',
      },
    ],
  },
};

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  '@id': 'https://www.sbsstore.in/about#webpage',
  'url': 'https://www.sbsstore.in/about',
  'name': 'About SBS — Shyam Business Store',
  'description': 'About page for SBS — Shyam Business Store.',
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
                alt="SBS — Shyam Business Store"
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
              SBS — Shyam Business Store
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
              Your destination for smart everyday essentials — quality products for your home, kitchen, and daily life, delivered across India.
            </p>
          </div>

          <div className="space-y-10 text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">Who We Are</h2>
              <p>
                SBS stands for <strong>Shyam Business Store</strong> — an online store dedicated to bringing you practical, well-made everyday essentials at fair prices. We focus on products that genuinely improve your daily routine: home organisation, kitchen tools, personal care, and cleaning solutions.
              </p>
              <p className="mt-3">
                Our physical store is based in <strong>Vadodara, Gujarat, India</strong>, and we serve customers across the country through our online platform at{' '}
                <Link href="/" className="text-[#F95721] font-semibold hover:underline">sbsstore.in</Link>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">What We Offer</h2>
              <p>At SBS — Shyam Business Store, we curate products across everyday categories including:</p>
              <ul className="mt-3 space-y-1.5 list-disc list-inside text-gray-600">
                <li>Home essentials and organisation</li>
                <li>Kitchen tools and gadgets</li>
                <li>Cleaning and laundry solutions</li>
                <li>Personal care products</li>
                <li>Storage and travel accessories</li>
              </ul>
              <p className="mt-3">
                Every product is selected to be useful, affordable, and of genuine quality — not just visually appealing.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">Our Commitment</h2>
              <p>
                We believe everyday shopping should be simple and trustworthy. At SBS, we stand behind every product we sell. If something is not right, our support team is here to help — by phone, WhatsApp, or email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-black text-gray-900 mb-3">Get in Touch</h2>
              <p>
                Have a question or need assistance? Visit our{' '}
                <Link href="/contact" className="text-[#F95721] font-semibold hover:underline">Contact page</Link>{' '}
                for all the ways to reach us, or head back to the{' '}
                <Link href="/" className="text-[#F95721] font-semibold hover:underline">SBS Store homepage</Link>.
              </p>
            </section>
          </div>

          <div className="mt-12 p-6 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-black text-gray-900">Ready to explore SBS?</p>
              <p className="text-xs text-gray-500 mt-0.5">Discover smart everyday essentials on our store.</p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white text-sm font-bold rounded-xl shadow-sm transition-all whitespace-nowrap"
            >
              Visit SBS Store →
            </Link>
          </div>
        </main>

        <footer className="border-t border-gray-200 mt-16 py-8 text-center text-xs text-gray-400">
          <p>
            © {new Date().getFullYear()}{' '}
            <Link href="/" className="hover:text-[#F95721] transition-colors font-semibold">
              SBS — Shyam Business Store
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
