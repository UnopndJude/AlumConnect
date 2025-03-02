import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// 폰트 설정
const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '45 920',
  variable: '--font-pretendard',
})

const nanumsquareneo = localFont({
  src: '../../public/fonts/NanumSquareNeo-Variable.woff2',
  variable: '--font-nanumsquareneo',
})

export const metadata: Metadata = {
  title: '인천과학고등학교 동문수첩',
  description: '인천과학고등학교 동문수첩',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
    ]
  },
  manifest: '/site.webmanifest'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pretendard.variable} ${nanumsquareneo.variable} antialiased`}
        >
        {children}
      </body>
    </html>
  );
}
