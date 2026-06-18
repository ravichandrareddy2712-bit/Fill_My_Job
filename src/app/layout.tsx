import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { FileProvider } from '@/context/FileContext'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Find My Job.AI — AI-Powered Job Search & Application Tracker',
  description:
    'Upload your resume, extract skills with AI, match jobs, and track applications — all in one premium platform. Start your smarter job search today.',
  keywords: ['AI job search', 'resume upload', 'job matching', 'application tracker', 'career AI'],
  openGraph: {
    title: 'Find My Job.AI',
    description: 'Find the right jobs and apply faster with AI',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="noise antialiased" suppressHydrationWarning>
        <FileProvider>
          {children}
        </FileProvider>
      </body>
    </html>
  )
}
