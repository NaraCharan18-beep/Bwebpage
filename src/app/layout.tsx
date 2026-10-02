import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const serifFont = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#800020",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://srilaxminarshimasarees.com"),
  title: "SRI LAXMI NARSHIMA SARES HOUSE | Authentic Pochampally Sarees",
  description: "Exquisite handcrafted Pochampally Double Ikat, Pure Silk, Cotton, and Sico Sarees direct from the master weavers of Bhoodan Pochampally, Telangana. Silk Mark Certified.",
  keywords: [
    "SRI LAXMI NARSHIMA SARES HOUSE",
    "Pochampally Silk Sarees",
    "Pochampally Ikat",
    "Double Ikat Saree",
    "Bhoodan Pochampally",
    "Telangana Handlooms",
    "Silk Mark Sarees",
    "Bridal Silk Sarees",
    "Patola Ikat",
  ],
  openGraph: {
    title: "SRI LAXMI NARSHIMA SARES HOUSE",
    description: "Where Tradition Meets Timeless Elegance • Handcrafted Pochampally Silk Direct From Weavers",
    images: [{ url: "/images/hero_saree.jpg" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${serifFont.variable} ${bodyFont.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-screen bg-[#FAF7F2] text-[#1C1917] selection:bg-[#800020] selection:text-white">
        {children}
      </body>
    </html>
  );
}
