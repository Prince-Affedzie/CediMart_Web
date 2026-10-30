// src/app/layout.js
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConditionalFooter from '@/components/ConditionalFooter';
import AppDownloadBanner from '@/components/AppDownloadBanner';
import MobileTabBar from '@/components/MobileTabBar';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/next"
import './globals.css';

export const metadata = {
  title: {
    default: 'CediMart — Buy, Sell & Grow Anywhere in Ghana',
    template: '%s | CediMart',
  },
  description:
    'CediMart is Ghana\'s social commerce marketplace. Discover trusted vendors, shop through video shorts, chat with sellers, and build a real audience for your brand nationwide.',
  verification: {
    google: 'iBMCCAhAo_5ViK0WT_9CypifyxUQi2SEzE66ATC11i0',
  },
  keywords : [
  // Brand keywords
  'CediMart',
  'CediMart Ghana',

  // General shopping and marketplace
  'online shopping platforms in ghana',
  'online shopping Ghana',
  'online marketplace Ghana',
  'shop online Ghana',
  'buy products online Ghana',
  'Ghana online shopping sites',
  'buy and sell online Ghana',
  'marketplace Ghana',

  // Fashion
  'fashion', 'sneakers',
  'women dresses',
  'fashion online Ghana',
  'buy clothes online Ghana',
  'women dresses Ghana',
  'sneakers online Ghana',

  // Electronics
  'phones for sale',
  'laptops for sale',
  'electronics online Ghana',
  'phones for sale Ghana',
  'laptops for sale Ghana',
  'buy smartphones online Ghana',
  'iphones for sale',
  'Where to buy iphone online in Ghana',


  // Beauty
  'beauty products',
  'skincare products',
  'makeup products',
  'beauty products Ghana',
  'skincare products Ghana',
  'makeup products Ghana',

  // Home and lifestyle
  'home appliances',
  'home appliances Ghana',
  'furniture online Ghana',
  'home essentials Ghana',

  // Social commerce (supporting keywords)
  'social commerce Ghana',
  'video shopping Ghana',
  'social shopping Ghana',

  // Seller and business-related keywords
  'sell products online Ghana',
  'online selling platform Ghana',
  'sell online Ghana',
],
  authors: [{ name: 'CediMart' }],
  creator: 'CediMart',
  publisher: 'CediMart',
  metadataBase: new URL('https://cedimartgh.com'),
  applicationName: 'CediMart',
  category: 'shopping',
  alternates: {
    canonical: 'https://cedimartgh.com',
  },
  openGraph: {
    title: 'CediMart — Buy, Sell & Grow Anywhere in Ghana',
    description:
      'A social commerce platform for Ghana. Shop through video shorts, chat with sellers, discover trusted vendors, and build your audience.',
    url: 'https://cedimartgh.com',
    siteName: 'CediMart',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CediMart — Ghana\'s social commerce marketplace',
      },
    ],
    locale: 'en_GH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CediMart — Buy, Sell & Grow Anywhere in Ghana',
    description:
      'A social commerce platform for Ghana. Shop through video shorts, chat with sellers, and build your audience.',
    images: ['/og-image.png'],
    site: '@cedimartghana',
    creator: '@cedimart',
  },
  icons: {
    icon: '/icon.jpg',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
    other: {
      rel: 'apple-touch-icon',
      url: '/apple-icon.png',
    },
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

//  Safari address-bar theming. Kept separate from `metadata` because Next
//  expects it in a dedicated `viewport` export.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0D9488' },
    { media: '(prefers-color-scheme: dark)', color: '#0F766E' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className="inter_396b12ce-module__rRjk0G__className bg-gray-50"
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <AppDownloadBanner />
            <Header />
            <main>{children}</main>
            <MobileTabBar />
            <ConditionalFooter />
          </CartProvider>
        </AuthProvider>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "CediMart",
              "url": "https://cedimartgh.com",
              "logo": "https://cedimartgh.com/icon.jpg",
              "sameAs": [
                "https://instagram.com/cedimartghana",
                "https://tiktok.com/@cedimartghana",
                "https://twitter.com/cedimartghana",
                "https://facebook.com/cedimartghana"
              ]
            })
          }}
        />
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
       <Analytics />
      </body>
    </html>
  );
}