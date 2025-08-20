// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Team Chatr Task Tracker',
  description: 'A task tracking application built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        <main className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-sans">
          {children}
        </main>
      </body>
    </html>
  );
}
