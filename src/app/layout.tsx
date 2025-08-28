/**
 * Layout principal de la aplicación Kiki
 * @file /Users/higinieduardmoredomingo/Meta Agent - Kick Off Starter/kiki/src/app/layout.tsx
 */

import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter'
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono'
})

export const metadata: Metadata = {
  title: 'Kiki - Kickoff de Proyectos con Vibe Coding',
  description: 'Plataforma educativa para iniciar proyectos sin conocimientos técnicos',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${spaceMono.variable}`}>
      <body className={`${inter.className} bg-background text-foreground`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: 'font-mono',
            style: {
              background: '#FFD93D',
              color: '#2D3436',
              border: '2px solid #2D3436',
              boxShadow: '4px 4px 0px 0px #2D3436',
            },
          }}
        />
      </body>
    </html>
  )
}