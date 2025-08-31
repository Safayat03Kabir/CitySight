import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-lg px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center animate-pulse">
          <span className="text-green-600 font-bold text-sm">CS</span>
        </div>
        <h1 className="text-xl font-bold">CitySight</h1>
      </div>
      <ul className="flex gap-6">
        <li>
          <Link href="/" className="hover:text-green-200 transition-colors duration-200 hover:scale-105 transform">
            Home
          </Link>
        </li>
        <li>
          <Link href="/dashboard" className="hover:text-green-200 transition-colors duration-200 hover:scale-105 transform">
            Dashboard
          </Link>
        </li>
        <li>
          <Link href="/monitoring" className="hover:text-green-200 transition-colors duration-200 hover:scale-105 transform">
            Monitoring
          </Link>
        </li>
        <li>
          <Link href="/planning" className="hover:text-green-200 transition-colors duration-200 hover:scale-105 transform">
            Planning
          </Link>
        </li>
        <li>
          <Link href="/features" className="hover:text-green-200 transition-colors duration-200 hover:scale-105 transform">
            Features
          </Link>
        </li>
      </ul>
    </nav>
  );
}
