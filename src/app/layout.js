import './globals.css'
import ClientWrapper from './components/ClientWrapper'

export const metadata = {
  title: 'نظام مؤسسة اليقين | الأستاذ محمود البلوي',
  description: 'نظام متكامل لإدارة الموكلين والقضايا والجلسات والشؤون المالية — مؤسسة اليقين',
  keywords: 'مؤسسة اليقين, محمود البلوي, محاماة, قضايا, موكلين, جلسات, نظام قانوني',
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
