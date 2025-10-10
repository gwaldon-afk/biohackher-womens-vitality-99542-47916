import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.dd747a7bdcf44d6f901e6bc2ddbae0c7',
  appName: 'biohackher-womens-vitality',
  webDir: 'dist',
  server: {
    url: 'https://dd747a7b-dcf4-4d6f-901e-6bc2ddbae0c7.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
