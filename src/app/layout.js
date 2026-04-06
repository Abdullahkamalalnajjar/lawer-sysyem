import './globals.css'
import ClientWrapper from './components/ClientWrapper'

export const metadata = {
  title: 'نظام إدارة المحاماة',
  description: 'نظام متكامل لإدارة الموكلين والقضايا والجلسات والشؤون المالية',
  keywords: 'محاماة, قضايا, موكلين, جلسات, نظام قانوني',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  )
}
