'use client'; // 需要 'use client' 因为我们使用了 usePathname hook

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // 导入 usePathname

const navLinks = [
  { href: "/", label: "首页" },
];
const Navbar = () => {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.getElementById(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const pathname = usePathname();

  return (
    <nav className="bg-white dark:bg-slate-900 shadow-sm sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link 
          href="/" 
          className="text-2xl font-bold text-blue-600 dark:text-blue-400"
        >
          EvoWork
        </Link>

        {/* Centered Navigation Links */}
        <div className="flex-1 flex justify-center items-center space-x-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link py-2 px-4 rounded-full text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-slate-100 text-blue-600 dark:bg-slate-700 dark:text-blue-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Placeholder for potential right-side elements like Dashboard button or Theme Toggle from screenshot */}
        <div className="w-auto"> {/* Adjust width as needed if elements are added here */}
          {/* Example: <button className="bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium">Dashboard</button> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
