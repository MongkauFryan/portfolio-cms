import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fryan Feris Iferson Mongkau | Portfolio & Dynamic ATS CV",
  description:
    "High-performance Full-Stack & AI Engineer Portfolio with built-in Supabase CMS and dynamic ATS-friendly CV Generator.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${inter.className} bg-slate-950 text-slate-100 antialiased selection:bg-emerald-500 selection:text-slate-950`}
      >
        {children}
      </body>
    </html>
  );
}