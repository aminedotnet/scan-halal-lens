import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.halal',
  appName: 'حلال',
  webDir: 'dist',
  server: {
    url: 'https://8831eabe-9b07-4a25-a06a-8c65b83500d6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      presentationStyle: 'fullscreen'
    },
    AdMob: {
      // معرفات الاختبار - استبدلها بمعرفاتك الحقيقية عند النشر
      testingDevices: ['YOUR_DEVICE_ID'],
      initializeForTesting: true
    }
  }
};

export default config;
