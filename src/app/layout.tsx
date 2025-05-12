import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"; // 保持您项目已有的字体配置
import "./globals.css";
import Navbar from "@/components/Navbar"; // 导入 Navbar
import Footer from "@/components/Footer"; // 导入 Footer

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="zh-CN"> {/* 设置语言为中文 */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
