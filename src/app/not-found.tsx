import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-[#F8F9FA]">
      <div className="w-16 h-16 rounded-3xl bg-orange-100 text-[#F95721] flex items-center justify-center font-black text-2xl mb-4">
        404
      </div>
      <h2 className="text-xl font-black text-gray-900 mb-1">Page Not Found</h2>
      <p className="text-xs text-gray-500 mb-6 max-w-xs">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-[#F95721] hover:bg-[#E44813] text-white text-xs font-bold rounded-2xl shadow-sm transition-all"
      >
        Return to SBS Store
      </Link>
    </div>
  );
}
