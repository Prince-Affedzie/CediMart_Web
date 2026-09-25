// src/app/layout.js
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConditionalFooter from '@/components/ConditionalFooter';
import AppDownloadBanner from '@/components/AppDownloadBanner';
import MobileTabBar from '@/components/MobileTabBar';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Script from 'next/script';
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
  keywords: [
    // Marketplace core
    'marketplace Ghana',
    'buy and sell Ghana',
    'online shopping Ghana',
    'CediMart',
    // Social commerce
    'social commerce',
    'shop by video',
    'live shopping',
    'video shopping Ghana',
    // Vendor / creator economy
    'vendor platform Ghana',
    'seller tools Ghana',
    'creator marketplace',
    'audience building',
    // Chat / messaging
    'buyer seller chat',
    'in-app messaging marketplace',
    // Legacy / campus audience (still relevant)
    'campus marketplace',
    'student buy sell',
    'Ghana university',
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
    site: '@cedimart',
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
          src="https://js.paystack.co/v1/inline.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}