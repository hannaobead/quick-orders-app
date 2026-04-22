import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Momento — הזמנות מהירות',
  description: 'מערכת הזמנות מהירות פנימית',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
