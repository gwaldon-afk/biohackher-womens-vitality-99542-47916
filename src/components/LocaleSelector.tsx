import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { updateUserLocale } from '@/services/localeService';

const locales = [
  { code: 'en-GB', country: 'GB', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'en-US', country: 'US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en-AU', country: 'AU', label: 'English (AU)', flag: '🇦🇺' },
  { code: 'en-CA', country: 'CA', label: 'English (CA)', flag: '🇨🇦' },
];

export const LocaleSelector = () => {
  const { i18n } = useTranslation();
  const { user, profile } = useAuth();

  const handleLocaleChange = async (language: string) => {
    const selectedLocale = locales.find(l => l.code === language);
    if (!selectedLocale || !user) return;

    // Change the language immediately
    i18n.changeLanguage(language);

    // Update user profile with new locale
    const localeData = {
      country: selectedLocale.country,
      language: language,
      currency: selectedLocale.country === 'US' ? 'USD' : 
                selectedLocale.country === 'AU' ? 'AUD' :
                selectedLocale.country === 'CA' ? 'CAD' : 'GBP',
      measurementSystem: selectedLocale.country === 'US' ? 'imperial' : 'metric',
      timezone: profile?.timezone || 'Europe/London'
    };

    await updateUserLocale(user.id, localeData);
  };

  return (
    <Select value={i18n.language} onValueChange={handleLocaleChange}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Select locale" />
      </SelectTrigger>
      <SelectContent>
        {locales.map((locale) => (
          <SelectItem key={locale.code} value={locale.code}>
            <div className="flex items-center gap-2">
              <span>{locale.flag}</span>
              <span>{locale.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};