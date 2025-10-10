import { Capacitor } from '@capacitor/core';

/**
 * Check if the app is running on a native mobile platform
 */
export const isNativePlatform = () => {
  return Capacitor.isNativePlatform();
};

/**
 * Get the current platform (web, ios, android)
 */
export const getPlatform = () => {
  return Capacitor.getPlatform();
};

/**
 * Check if running on iOS
 */
export const isIOS = () => {
  return Capacitor.getPlatform() === 'ios';
};

/**
 * Check if running on Android
 */
export const isAndroid = () => {
  return Capacitor.getPlatform() === 'android';
};

/**
 * Get the appropriate redirect URL for authentication
 */
export const getAuthRedirectUrl = () => {
  if (isNativePlatform()) {
    return 'capacitor://localhost';
  }
  return window.location.origin;
};
