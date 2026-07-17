// src/app/layout.js
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata = {
  title: {
    default: 'CediMart - Your Campus Marketplace',
    template: '%s | CediMart',
  },
  description: 'CediMart connects students across Ghana\'s top universities — buy textbooks, sell electronics, discover food vendors, and grow a real business.',
  keywords: ['campus marketplace', 'student buy sell', 'Ghana university', 'CediMart'],
  authors: [{ name: 'CediMart' }],
  creator: 'CediMart',
  publisher: 'CediMart',
  metadataBase: new URL('https://cedimart.com'), // Replace with your actual domain
  openGraph: {
    title: 'CediMart - Your Campus Marketplace',
    description: 'Buy, sell, and connect with verified students across Ghana\'s top universities.',
    url: 'https://cedimart.com',
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
    <html lang="en">
      <body className="inter_396b12ce-module__rRjk0G__className bg-gray-50">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}