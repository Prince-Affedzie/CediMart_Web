// src/app/layout.js
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ConditionalFooter from '@/components/ConditionalFooter';
import MobileTabBar from '@/components/MobileTabBar';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import Script from 'next/script';
import './globals.css';

export const metadata = {
  title: {
    default: 'CediMart - Your Campus Marketplace',
    template: '%s | CediMart',
  },
  description: 'CediMart connects students across Ghana\'s top universities — buy textbooks, sell electronics, discover food vendors, and grow a real business.',
  verification: {
    google: 'iBMCCAhAo_5ViK0WT_9CypifyxUQi2SEzE66ATC11i0',
  },
  keywords: ['campus marketplace', 'student buy sell', 'Ghana university', 'CediMart'],
  authors: [{ name: 'CediMart' }],
  creator: 'CediMart',
  publisher: 'CediMart',
  metadataBase: new URL('https://cedimartgh.com'), // Replace with your actual domain
  openGraph: {
    title: 'CediMart - Your Campus Marketplace',
    description: 'Buy, sell, and connect with verified students across Ghana\'s top universities.',
    url: 'https://cedimartgh.com',
    siteName: 'CediMart',
    images: [
      {
        url: '/og-image.png', // Social share image (1200x630px)
        width: 1200,
        height: 630,
        alt: 'CediMart - Campus Marketplace',
      },
    ],
    locale: 'en_GH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CediMart - Your Campus Marketplace',
    description: 'Buy, sell, and connect with verified students across Ghana\'s top universities.',
    images: ['/og-image.png'],
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="inter_396b12ce-module__rRjk0G__className bg-gray-50" suppressHydrationWarning>
        <AuthProvider>
          <CartProvider>
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