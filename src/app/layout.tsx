import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'E-commerce admin dashboard built with Next.js',
  keywords: ['admin', 'dashboard', 'e-commerce', 'nextjs'],
  authors: [{ name: 'Admin Dashboard' }],
  creator: 'Admin Dashboard',
  publisher: 'Admin Dashboard',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://admin-dashboard.com',
    title: 'Admin Dashboard',
    description: 'E-commerce admin dashboard built with Next.js',
    siteName: 'Admin Dashboard',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Admin Dashboard',
    description: 'E-commerce admin dashboard built with Next.js',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="root" className="min-h-screen">
          {children}
        </div>
        <div id="modal-root" />
      </body>
    </html>
  );
}