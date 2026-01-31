import React from "react"
import type { Metadata } from 'next'
import { Archivo_Black, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _archivoBlack = Archivo_Black({ weight: "400", subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'El Bardeador Argentino',
  description: 'Generador de insultos argentinos con Cadena de Markov',
  generator: 'Next.js',
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
        url: '/maradona.jpg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
