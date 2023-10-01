import type { Metadata } from 'next';
import ThemeRegistry from '../components/ThemeRegistry/ThemeRegistry';

export const metadata: Metadata = {
  title: 'SensevenSpa',
  description: 'Best Spa Since 2023',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
