import { supabase } from '@/integrations/supabase/client';

export interface LocaleInfo {
  country: string;
  language: string;
  currency: string;
  measurementSystem: string;
  timezone: string;
}

const LOCALE_MAPPINGS: Record<string, LocaleInfo> = {
  'GB': {
    country: 'GB',
    language: 'en-GB', 
    currency: 'GBP',
    measurementSystem: 'metric',
    timezone: 'Europe/London'
  },
  'US': {
    country: 'US',
    language: 'en-US',
    currency: 'USD', 
    measurementSystem: 'imperial',
    timezone: 'America/New_York'
  },
  'AU': {
    country: 'AU',
    language: 'en-AU',
    currency: 'AUD',
    measurementSystem: 'metric',
    timezone: 'Australia/Sydney'
  },
  'CA': {
    country: 'CA',
    language: 'en-CA',
    currency: 'CAD',
    measurementSystem: 'metric', 
    timezone: 'America/Toronto'
  }
};

export const detectUserLocale = async (): Promise<LocaleInfo> => {
  try {
    // Try to get location from IP geolocation API
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    const countryCode = data.country_code;
    const detectedTimezone = data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Use mapping or fall back to UK
    const localeInfo = LOCALE_MAPPINGS[countryCode] || LOCALE_MAPPINGS['GB'];
    
    // Override timezone with detected one if available
    return {
      ...localeInfo,
      timezone: detectedTimezone
    };
  } catch (error) {
    console.log('Could not detect location, using UK defaults:', error);
    // Fallback to browser detection
    const browserLang = navigator.language || 'en-GB';
    const countryCode = browserLang.includes('en-US') ? 'US' :
                       browserLang.includes('en-AU') ? 'AU' :
                       browserLang.includes('en-CA') ? 'CA' : 'GB';
                       
    return LOCALE_MAPPINGS[countryCode];
  }
};

export const updateUserLocale = async (userId: string, localeInfo: Partial<LocaleInfo>) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        country: localeInfo.country,
        language: localeInfo.language,
        currency: localeInfo.currency,
        measurement_system: localeInfo.measurementSystem,
        timezone: localeInfo.timezone
      })
      .eq('user_id', userId);
      
    if (error) throw error;
  } catch (error) {
    console.error('Error updating user locale:', error);
  }
};

export const getUserLocale = async (userId: string): Promise<LocaleInfo | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('country, language, currency, measurement_system, timezone')
      .eq('user_id', userId)
      .single();
      
    if (error) throw error;
    
    return data ? {
      country: data.country,
      language: data.language,
      currency: data.currency,
      measurementSystem: data.measurement_system,
      timezone: data.timezone
    } : null;
  } catch (error) {
    console.error('Error getting user locale:', error);
    return null;
  }
};