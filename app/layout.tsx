import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Viral AI Video Generator',
  description: 'Generate 15-second viral AI recommendation videos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white">{children}</body>
    </html>
  )
}
