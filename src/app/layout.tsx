import type { Metadata, Viewport } from "next";
import { Bagel_Fat_One, Nunito_Sans } from "next/font/google";
import "./globals.css";

const bagel = Bagel_Fat_One({
  variable: "--font-bagel",
  weight: "400",
  subsets: ["latin"],
});

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CInput",
  description: "30 days of comprehensible input in Spanish",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbeff5" },
    { media: "(prefers-color-scheme: dark)", color: "#14051c" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bagel.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
