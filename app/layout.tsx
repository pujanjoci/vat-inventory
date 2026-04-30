import type { Metadata } from "next";
import { Libre_Baskerville, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/context/AppContext";

const displayFont = Libre_Baskerville({
  weight: ['400', '700'],
  variable: "--font-display",
  subsets: ["latin"],
});

const bodyFont = Instrument_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vat & Inventory | Ganesh Tel Mill",
  description: "Vat & Inventory management portal for Ganesh Tel Mill.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 font-body">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
