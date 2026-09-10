import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact SBS — Shyam Bombay Sale | Get in Touch & Store Location',
  description:
    'Contact SBS — Shyam Bombay Sale (Shyam Business Store). Reach us by phone, WhatsApp, or visit our offline store in Subhanpura, Vadodara, Gujarat.',
  alternates: {
    canonical: 'https://www.sbsstore.in/contact',
  },
  openGraph: {
    title: 'Contact SBS — Shyam Bombay Sale | Store Location & Support',
    description:
      'Get in touch with Shyam Bombay Sale (SBS Store). Visit our store in Vadodara or reach our phone, WhatsApp, and email support available Mon–Sun, 10 AM to 9:30 PM.',
    url: 'https://www.sbsstore.in/contact',
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

const contactJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': 'https://www.sbsstore.in/contact#webpage',
  'url': 'https://www.sbsstore.in/contact',
  'name': 'Contact SBS — Shyam Bombay Sale',
  'description': 'Contact page and store location for Shyam Bombay Sale (SBS Store).',
  'isPartOf': { '@id': 'https://www.sbsstore.in/#website' },
  'about': { '@id': 'https://www.sbsstore.in/#organization' },
};

// Contact constants
const STORE_NAME = 'Shyam Bombay Sale (SBS)';
const STORE_PHONE = '+91 92262 94797';
const WHATSAPP_LINK = 'https://wa.me/919226294797?text=Hi%20Shyam%20Bombay%20Sale%2C%20I%20need%20assistance.';
const STORE_EMAIL = 'shyambombaysale@gmail.com';
const STORE_HOURS = 'Monday – Sunday, 10:00 AM – 9:30 PM';
const STORE_ADDRESS = 'Shop 1, Vrundvilla, Ambedkar Nagar Housing Society, Laxmipura Road, Near Rami School, Subhanpura, Vadodara, Gujarat 390023';
const GOOGLE_MAPS_LINK = 'https://share.google/Pa5CkR6pMiRD0MMZm';

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
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
              <Link href="/about" className="hover:text-[#F95721] transition-colors">About</Link>
            </nav>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex items-center gap-2 text-xs text-gray-500">
              <li><Link href="/" className="hover:text-[#F95721] transition-colors">Home</Link></li>
              <li aria-hidden="true">›</li>
              <li className="text-gray-900 font-semibold">Contact</li>
            </ol>
          </nav>

          <div className="mb-10">
            <span className="inline-block text-xs font-bold text-[#F95721] uppercase tracking-widest mb-3">
              Contact Us & Store Location
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
              Get in Touch with Shyam Bombay Sale (SBS)
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
              Visit our offline retail store in Vadodara or reach our customer care team online. We are here to help!
            </p>
          </div>

          {/* Offline Store Card (Google Maps) */}
          <div className="mb-8 p-6 md:p-8 bg-gradient-to-br from-blue-50/70 via-white to-orange-50/50 rounded-3xl border border-blue-100/80 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 text-xs font-bold">
                  <svg className="w-3.5 h-3.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>Offline Store</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900">
                  Shyam Bombay Sale
                </h2>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                  {STORE_ADDRESS}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                  <span>🕒 Open Daily: 10:00 AM – 9:30 PM</span>
                  <span>📍 Subhanpura / Laxmipura Road, Vadodara</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
                <a
                  href={GOOGLE_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span>View on Google Maps</span>
                  <span>↗</span>
                </a>
                <a
                  href={`tel:${STORE_PHONE.replace(/\s+/g, '')}`}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:border-gray-300 text-gray-800 text-xs font-bold rounded-xl transition-all"
                >
                  <span>Call Store</span>
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* WhatsApp */}
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md shadow-emerald-100">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.114 1.532 5.836L.057 23.143a.75.75 0 00.928.895l5.487-1.444A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.73 9.73 0 01-4.952-1.35l-.354-.21-3.677.967.984-3.596-.232-.37A9.716 9.716 0 012.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                </svg>
              </div>
              <h2 className="text-base font-black text-gray-900 mb-1">WhatsApp Support</h2>
              <p className="text-sm text-gray-600 mb-3">Fastest way to reach us. Send a message and we will respond promptly.</p>
              <p className="text-sm font-mono font-bold text-emerald-700">{STORE_PHONE}</p>
              <span className="mt-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full self-start">
                Chat Now →
              </span>
            </a>

            {/* Phone */}
            <a
              href={`tel:${STORE_PHONE.replace(/\s+/g, '')}`}
              className="flex flex-col p-6 bg-white rounded-3xl border border-orange-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F95721] text-white flex items-center justify-center mb-4 group-hover:scale-105 transition-transform shadow-md shadow-orange-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <h2 className="text-base font-black text-gray-900 mb-1">Call Us Directly</h2>
              <p className="text-sm text-gray-600 mb-3">Speak directly with our store team during business hours.</p>
              <p className="text-sm font-mono font-bold text-[#F95721]">{STORE_PHONE}</p>
              <span className="mt-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full self-start">
                {STORE_HOURS}
              </span>
            </a>
          </div>

          {/* Store info */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-black text-gray-900">Store & Support Details</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-[#F95721] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <div>
                  <span className="font-bold text-gray-900 block">Store Address</span>
                  <span>{STORE_ADDRESS}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-[#F95721] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <span className="font-bold text-gray-900 block">Store Timings</span>
                  <span>{STORE_HOURS}</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <svg className="w-4 h-4 text-[#F95721] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
                <div>
                  <span className="font-bold text-gray-900 block">Official Email</span>
                  <a href={`mailto:${STORE_EMAIL}`} className="text-[#F95721] hover:underline">{STORE_EMAIL}</a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            Looking for more information?{' '}
            <Link href="/about" className="text-[#F95721] font-semibold hover:underline">Read about Shyam Bombay Sale (SBS)</Link>{' '}
            or return to the{' '}
            <Link href="/" className="text-[#F95721] font-semibold hover:underline">SBS Store homepage</Link>.
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
