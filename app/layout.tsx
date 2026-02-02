import React from "react"
import type { Metadata } from 'next'
import { Archivo_Black, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _archivoBlack = Archivo_Black({ weight: "400", subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bardeador-argentino.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'El Bardeador Argentino - Generador de Insultos con IA',
    template: '%s | El Bardeador Argentino'
  },
  description: 'Generador de insultos argentinos potenciado por Inteligencia Artificial y Cadenas de Markov. Creá puteadas únicas, originales y 100% argentas. ¡Dale que va!',
  generator: 'Next.js',
  applicationName: 'El Bardeador Argentino',
  referrer: 'origin-when-cross-origin',
  keywords: [
    'generador de insultos',
    'insultos argentinos',
    'puteadas argentinas',
    'bardeador',
    'inteligencia artificial',
    'IA',
    'cadenas de markov',
    'generador de texto',
    'humor argentino',
    'insultos graciosos',
    'argentina',
    'bardear',
    'puteadas',
    'frases argentinas',
    'lunfardo',
    'jerga argentina',
    'memes argentinos',
    'generador automático',
    'machine learning',
    'NLP'
  ],
  authors: [{ name: 'El Bardeador Argentino' }],
  creator: 'El Bardeador Argentino',
  publisher: 'El Bardeador Argentino',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: siteUrl,
    siteName: 'El Bardeador Argentino',
    title: 'El Bardeador Argentino - Generador de Insultos con IA 🇦🇷',
    description: 'Generador de insultos argentinos potenciado por Inteligencia Artificial. Creá puteadas únicas y 100% argentas. ¡Aguante el bardo!',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'El Bardeador Argentino - Generador de Insultos con IA',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Bardeador Argentino - Generador de Insultos con IA 🇦🇷',
    description: 'Generador de insultos argentinos potenciado por IA. Creá puteadas únicas y 100% argentas. ¡Dale que va!',
    images: ['/og-image.jpg'],
    creator: '@bardeadorarg',
  },
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
  icons: {
    icon: [
      {
        url: '/maradona.jpg',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/maradona.jpg',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/favicon.ico',
        sizes: 'any',
      },
    ],
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
  category: 'entertainment',
  verification: {
    google: 'tu-codigo-de-verificacion-google',
  },
}

// JSON-LD Structured Data para SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'El Bardeador Argentino',
  description: 'Generador de insultos argentinos potenciado por Inteligencia Artificial y Cadenas de Markov. Creá puteadas únicas y 100% argentas.',
  url: 'https://bardeador-argentino.vercel.app',
  applicationCategory: 'Entertainment',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'ARS',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5',
    ratingCount: '100',
  },
  creator: {
    '@type': 'Organization',
    name: 'El Bardeador Argentino',
  },
  inLanguage: 'es-AR',
  keywords: 'generador de insultos, insultos argentinos, IA, inteligencia artificial, puteadas, humor argentino',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
