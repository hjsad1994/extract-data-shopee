import './globals.css'

export const metadata = {
  title: 'Shopee Comment Extractor',
  description: 'Extract and manage Shopee comments with ease',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
