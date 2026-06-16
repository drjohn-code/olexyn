import type { Metadata } from "next";
import { Saira, Hanken_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

/* Display / logo */
const saira = Saira({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-saira",
  display: "swap",
});

/* Body */
const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-hanken",
  display: "swap",
});

/* Micro / data */
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OLEXION — Applied Bio-based Formula",
  description:
    "OLEXION AF-C1 — applied bio-based fuel chemistry. Chemistry in motion: cleaner combustion, lower consumption, fewer emissions. Engineered in Sweden.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${saira.variable} ${hankenGrotesk.variable} ${spaceMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
