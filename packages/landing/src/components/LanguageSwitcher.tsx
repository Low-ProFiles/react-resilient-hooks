'use client';

import { useI18n } from '../contexts/I18nProvider';

export const LanguageSwitcher = () => {
  const { locale, setLocale, t } = useI18n();

  const handleLanguageChange = (lang: 'en' | 'ko') => {
    setLocale(lang);
  };

  return (
    <div className="flex justify-end mb-4">
      <button
        onClick={() => handleLanguageChange('ko')}
        className={`px-3 py-1 rounded-md text-sm ${
          locale === 'ko' ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}
      >
        {t.languageSwitcher.ko}
      </button>
      <button
        onClick={() => handleLanguageChange('en')}
        className={`ml-2 px-3 py-1 rounded-md text-sm ${
          locale === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}
      >
        {t.languageSwitcher.en}
      </button>
    </div>
  );
};
