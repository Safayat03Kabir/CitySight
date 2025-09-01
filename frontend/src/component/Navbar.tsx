import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white shadow-2xl px-8 py-5 flex justify-between items-center backdrop-blur-sm border-b border-white/10 relative overflow-hidden">
      {/* Subtle animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-pulse"></div>
      
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-100 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 transform">
          <span className="font-bold text-base bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">CS</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight drop-shadow-lg hover:scale-105 transition-transform duration-300 cursor-pointer">
          <span className="text-teal-300 hover:text-teal-200 transition-colors duration-300 drop-shadow-lg">City</span>
          <span className="text-sky-300 hover:text-sky-200 transition-colors duration-300 drop-shadow-lg">Sight</span>
        </h1>
      </div>
      
      <ul className="flex gap-8 relative z-10">
        <li>
          <Link href="/" className="relative px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 transform">
            <span className="relative z-10 text-lg font-medium hover:text-green-200 hover:text-xl transition-all duration-300">Home</span>
          </Link>
        </li>
        <li>
          <Link href="/dashboard" className="relative px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 transform">
            <span className="relative z-10 text-lg font-medium hover:text-blue-200 hover:text-xl transition-all duration-300">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link href="/monitoring" className="relative px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 transform">
            <span className="relative z-10 text-lg font-medium hover:text-emerald-200 hover:text-xl transition-all duration-300">Monitoring</span>
          </Link>
        </li>
        <li>
          <Link href="/planning" className="relative px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 transform">
            <span className="relative z-10 text-lg font-medium hover:text-cyan-200 hover:text-xl transition-all duration-300">Planning</span>
          </Link>
        </li>
        <li>
          <Link href="/features" className="relative px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 transform">
            <span className="relative z-10 text-lg font-medium hover:text-blue-200 hover:text-xl transition-all duration-300">Features</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}
