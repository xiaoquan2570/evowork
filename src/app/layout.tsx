import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google"; // Old import
import { GeistSans } from 'geist/font/sans'; // Corrected: Named import GeistSans
import { GeistMono } from 'geist/font/mono'; // Corrected: Named import GeistMono
import "./globals.css";
import Navbar from "@/components/Navbar"; // 导入 Navbar
import Footer from "@/components/Footer"; // 导入 Footer

// Instances are directly the imported objects as per geist documentation
// const geistSans = GeistSans({ 
//   variable: "--font-geist-sans",
// });

// const geistMono = GeistMono({ 
//   variable: "--font-geist-mono",
// });

export const metadata: Metadata = {
  title: "EvoWork - AI驱动的工作新范式", // 更新标题
  description: "通过AI Agent和智能工作流变革您的工作方式", // 更新描述
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning><body // <--- 确保 <html> 和 <body> 标签紧密相连，没有换行或空格
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning={true}
      >
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body></html> // <--- 确保 </body> 和 </html> 标签紧密相连
  );
}
