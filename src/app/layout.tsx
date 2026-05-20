/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'PPIC Operations System',
  description: 'Calendar-first planning, production, inventory, and control dashboard.',
};

const tailwindConfigScript = `
  window.tailwind = window.tailwind || {};
  window.tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['Manrope', 'Segoe UI', 'sans-serif'],
          display: ['Space Grotesk', 'Manrope', 'sans-serif'],
        },
        colors: {
          ink: '#0f172a',
          mist: '#f4f7fb',
          line: '#d6deea',
          brand: {
            50: '#eff8ff',
            100: '#dbeafe',
            500: '#0f766e',
            600: '#0b5f59',
            700: '#0a4d48',
          },
          accent: '#c2410c',
          pine: '#166534',
          gold: '#b45309',
          rose: '#b91c1c',
        },
        boxShadow: {
          panel: '0 20px 60px rgba(15, 23, 42, 0.12)',
        },
      },
    },
  };
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script id="tailwind-config" strategy="beforeInteractive">
          {tailwindConfigScript}
        </Script>
        <Script
          src="https://cdn.tailwindcss.com"
          strategy="beforeInteractive"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-mist text-ink antialiased">{children}</body>
    </html>
  );
}
