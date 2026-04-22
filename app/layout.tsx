import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Momento — הזמנות מהירות',
  description: 'מערכת הזמנות מהירות פנימית',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
