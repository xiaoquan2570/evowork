'use client'; // Need 'use client' for usePathname

import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Old import
import { GeistSans } from 'geist/font/sans'; // Corrected: Named import GeistSans
import { GeistMono } from 'geist/font/mono'; // Corrected: Named import GeistMono
import "./globals.css";
import Navbar from "@/components/Navbar"; // 导入 Navbar
import Footer from "@/components/Footer"; // 导入 Footer
import { usePathname } from "next/navigation"; 

// Instances are directly the imported objects as per geist documentation
// const geistSans = GeistSans({ 
//   variable: "--font-geist-sans",
// });

// const geistMono = GeistMono({ 
//   variable: "--font-geist-mono",
// });

// export const metadata: Metadata = { // This needs to be handled differently with 'use client'
//   title: "EvoWork - AI驱动的工作新范式",
//   description: "通过AI Agent和智能工作流变革您的工作方式",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith('/dashboard');

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body 
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning={true}
      >
        {!isDashboardRoute && <Navbar />}
        <main 
          className={isDashboardRoute 
            ? "flex flex-1 flex-col overflow-hidden h-full" // Styles for Dashboard main area (full height, flex content)
            : "flex-grow container mx-auto px-4 py-8"    // Styles for regular pages
          }
        >
          {children}
        </main>
        {!isDashboardRoute && <Footer />}
      </body>
    </html>
  );
}
