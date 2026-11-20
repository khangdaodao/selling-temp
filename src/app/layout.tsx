/**
 * Root Next.js App Router layout for forma/.
 * Loads Google Fonts (`Inter` and `JetBrains Mono`), applies dark minimalism surface defaults,
 * mounts client hydration coordinators, and wraps routes with DemoModeBar, Navbar, and Footer.
 *
 * Related: src/app/globals.css, src/components/layout/*
 */

import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/navbar';
import { DemoModeBar } from '@/components/layout/demo-mode-bar';
import { AppHydration } from '@/components/providers/app-hydration';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'forma/ — UI Components & Website Templates',
  description:
    'Demo-first store for minimalist UI Components and Website Templates built with Next.js App Router, React, TypeScript, and Tailwind CSS.',
};

/**
 * Root server layout rendering shared typography and navigation shell across all routes.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-canvas font-sans text-foreground antialiased">
        <AppHydration />
        <div className="flex min-h-screen flex-col">
          <DemoModeBar />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
