import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { ViewModeProvider } from '@/components/view-mode-provider';
import { LanguageProvider } from '@/components/language-provider';

export const metadata: Metadata = {
  title: 'Marcador Estadístico',
  description: 'Track volleyball match stats and generate AI-powered insights.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased bg-secondary text-foreground')}>
        <LanguageProvider>
          <ThemeProvider storageKey="voleyball-theme">
            <ViewModeProvider>
              {children}
              <Toaster />
            </ViewModeProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
