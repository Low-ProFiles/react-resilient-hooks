declare module 'next-pwa';

interface TranslationKeys {
  header: {
    title: string;
    description: string;
  };
  home: {
    title: string;
    description: string;
    button: string;
  };
  hooks: {
    [key: string]: {
      title: string;
      description: string[];
      example: string[];
      clarificationNote?: string;
    };
  };
  languageSwitcher: {
    ko: string;
    en: string;
  };
}