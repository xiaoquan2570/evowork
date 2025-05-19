'use client'; // 需要 'use client' 因为我们使用了 usePathname hook

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // 导入 usePathname
import { useState, useEffect, useCallback } from 'react'; // Added useState, useEffect, useCallback
import { motion, LayoutGroup } from 'framer-motion'; // Import LayoutGroup

// Updated navLinks for homepage sections
const navLinks = [
  { href: "#hero-section", label: "首页", id: "hero-section" }, // Assuming a hero section ID, or adjust as needed
  { href: "#use-cases-section", label: "用例", id: "use-cases-section" },
  { href: "#pricing-section", label: "报价", id: "pricing-section" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Ensure document is available
  }, []);

  const handleScroll = useCallback(() => {
    if (!isMounted) return;

    let currentSection = '';
    const offset = 100; // Offset to trigger activation a bit earlier

    for (const link of navLinks) {
      if (link.href.startsWith("#")) { // Only process hash links for scroll-spy
        const element = document.getElementById(link.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          // Check if the top of the section is within a range from the top of the viewport
          // and the bottom of the section is also below the top of the viewport (or close to it)
          if (rect.top <= offset && rect.bottom >= offset) {
            currentSection = link.id;
            break; 
          }
        }
      }
    }
    
    // Fallback to hero if no specific section is active and at the top
    if (!currentSection && window.scrollY < 200 && navLinks[0]?.id === 'hero-section') {
        currentSection = 'hero-section';
    }

    setActiveSection(currentSection);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted || pathname !== '/') { // Only apply scroll-spy on the homepage
      setActiveSection(pathname === '/' && navLinks[0] ? navLinks[0].id : ''); // Default to first link if on homepage, otherwise none
      return;
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMounted, pathname, handleScroll]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    if (pathname === '/') { // Only scroll if on homepage
      const element = document.getElementById(sectionId);
    if (element) {
        const yOffset = -70; // Adjusted offset for potentially slimmer navbar
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        setActiveSection(sectionId); // Manually set active section on click
      } else if (sectionId === 'hero-section') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveSection(sectionId);
    }
    } else {
      // If not on homepage, navigate to homepage and then try to scroll (might need more robust solution)
      window.location.href = `/${sectionId === 'hero-section' ? '' : '#' + sectionId}`;
    }
  };

  // Determine if the current page is the homepage to apply section-specific logic
  const isHomepage = pathname === '/';

  return (
    <nav className="bg-white dark:bg-slate-900 sticky top-0 z-50 shadow-xs dark:shadow-none">
      <div className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center relative">
        {/* Updated Logo Style */}
        <Link 
          href="/" 
          className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center group"
          onClick={() => setActiveSection(navLinks[0]?.id || '')}
        >
          {/* Placeholder for a potential SVG icon if desired later */}
          {/* <svg className="w-7 h-7 mr-2 text-blue-600 group-hover:text-blue-500 transition-colors" ... /> */}
          <span className="font-bold text-blue-600 dark:text-blue-400">Evo</span><span className="text-slate-700 dark:text-slate-300">Work</span>
        </Link>

        {/* Centered Navigation Links - Adjusted for absolute centering */}
        <div className="hidden md:flex items-center space-x-1 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <LayoutGroup>
          {navLinks.map((link) => {
              const isActive = isHomepage ? activeSection === link.id : pathname === link.href && !link.href.includes('#');
              
              const linkTextClasses = `relative z-10 py-1.5 px-3.5 text-sm font-medium transition-colors duration-150 ease-in-out 
                ${isActive 
                  ? 'text-blue-600 dark:text-blue-300' 
                  : 'text-slate-700 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'}`;

              // Define key separately
              const keyForLink = isHomepage ? link.id : link.href;
              // Remove key from commonLinkProps
              const commonLinkProps = {
                href: link.href,
                className: `nav-link-item flex items-center justify-center cursor-pointer focus:outline-none rounded-md ${linkTextClasses}`,
              };

            return (
                // Pass key directly to the <a> tag
                <a key={keyForLink} {...commonLinkProps} onClick={isHomepage ? (e) => handleNavClick(e, link.id) : undefined}>
                {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavBackground"
                      // Adjusted active background to be lighter and match image style
                      className="absolute inset-0 bg-slate-100 dark:bg-slate-800 rounded-md -z-10 shadow-xs"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 28 }}
                    />
                  )}
                </a>
            );
          })}
          </LayoutGroup>
        </div>

        {/* Right-side Buttons Area - Adjusted for alignment */}
        <div className="hidden md:flex items-center justify-end space-x-3 min-w-[120px]">
          <Link 
            href="/dashboard"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-colors"
            onClick={() => setActiveSection('')} // Clear active section when navigating away from homepage sections
          >
            Dashboard
          </Link>
          <button 
            type="button"
            aria-label="Toggle theme" 
            className="p-2 rounded-full text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors"
          >
            {/* Sun icon for theme toggle (example) */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
