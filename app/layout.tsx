
import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Nexus Scalper Pro - CoinEx Edition',
  description: 'Professional high-frequency trading terminal.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <style>{`
          body { font-family: 'Inter', sans-serif; background-color: #0b0e11; color: #eaeaeb; }
          .mono { font-family: 'JetBrains Mono', monospace; }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #1e2329; }
          ::-webkit-scrollbar-thumb { background: #474d57; border-radius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: #5e6673; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
