import type { Metadata } from "next";
import { Bodoni_Moda, Jost, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import Preloader from "@/components/layout/Preloader";
import SmoothScroll from "@/components/layout/SmoothScroll";
import SearchOverlay from "@/components/layout/SearchOverlay";
import Toaster from "@/components/layout/Toaster";
import ChatWidget from "@/components/chat/ChatWidget";

const bodoni = Bodoni_Moda({ variable: "--font-bodoni", subsets: ["latin"], weight: "400" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: "400" });
const jost = Jost({ variable: "--font-jost", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Aura — Timeless Fashion",
  description: "Curated collections for every mood, moment and occasion. Discover quality. Experience elegance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bodoni.variable} ${playfair.variable} ${jost.variable} antialiased`}>
      <body className="min-h-screen">
        <Preloader />
        <SmoothScroll />
        <Header />
        <main>{children}</main>
        <Footer />
        <CartDrawer />
        <SearchOverlay />
        <ChatWidget />
        <Toaster />
      </body>
    </html>
  );
}
