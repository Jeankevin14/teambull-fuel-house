import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import "./globals.css";
import { SITE } from "@/config/site";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";
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
  keywords: ["gym supplements", "whey protein", "creatine", "pre-workout", "mass gainer", "Puducherry", "Teambull Fuel House"],
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    type: "website",
    locale: "en_IN",
  },
  robots: { index: true, follow: true },
  verification: { google: "6vsu48LdxzFDgFxM53-zQB8WDhrZUjf26xXrn03aD-w" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
  email: SITE.email,
  sameAs: [SITE.instagram],
  address: { "@type": "PostalAddress", streetAddress: "No: 4-5, 1st Floor, East Coast Rd, Kottupalayam", addressLocality: "Puducherry", addressRegion: "Puducherry", postalCode: "605008", addressCountry: "IN" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable}`}>
      <body className="flex min-h-screen flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <UserProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <WhatsAppButton />
            <CartDrawer />
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  );
}
