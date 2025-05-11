import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Amperly AI",
  description: "Automate customer interactions with powerful AI to help businesses grow",
  generator: 'next.js',
  keywords: ['AI', 'customer support', 'automation', 'business growth', 'artificial intelligence'],
  authors: [{ name: 'Amperly AI Team' }],
  creator: 'Amperly AI',
  publisher: 'Amperly AI',
  metadataBase: new URL('https://amperlyai.com'),
  openGraph: {
    title: 'Amperly AI',
    description: 'Automate support with AI that grows your business',
    siteName: 'Amperly AI',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amperly AI',
    description: 'Automate support with AI that grows your business',
    images: ['/twitter-image.jpg'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  }
} 