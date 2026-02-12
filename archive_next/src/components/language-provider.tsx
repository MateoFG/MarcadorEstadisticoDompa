"use client";

import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Client-side language detection and persistence
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const savedLanguage = localStorage.getItem('i18nextLng');
      const browserLanguage = navigator.language?.split('-')[0];

      const preferredLanguage = savedLanguage || browserLanguage || 'en';
      const supportedLanguage = ['en', 'es'].includes(preferredLanguage) ? preferredLanguage : 'en';

      if (i18n.language !== supportedLanguage) {
        i18n.changeLanguage(supportedLanguage);
      }

      // Save preference
      if (typeof localStorage.setItem === 'function') {
        localStorage.setItem('i18nextLng', i18n.language);
      }
    }

    setIsInitialized(true);
  }, []);

  // Don't render children until language is initialized on client
  if (!isInitialized) {
    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
