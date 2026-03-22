import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { EmployeesProvider } from '@/lib/employees-context'
import { AuthProvider } from '@/lib/auth-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Ytech RH - Gestion des Employés',
  description: 'Application interne de gestion des ressources humaines pour Ytech Solutions',
  generator: 'v0.app',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
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
    <html lang="fr-MA" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AuthProvider>
          <EmployeesProvider>
            {children}
          </EmployeesProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
