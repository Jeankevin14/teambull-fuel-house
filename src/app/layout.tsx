import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { SITE } from "@/config/site";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import CartDrawer from "@/components/layout/CartDrawer";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const oswald = Oswald({ subsets: ["latin"], variable: "--font-oswald" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Gym Supplements`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
