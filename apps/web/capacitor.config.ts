import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitasist.app',
  appName: 'FitAsist',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    FirebaseAuthentication: {
      // true: JS Firebase SDK auth state ni to'liq boshqaradi.
      // Bu holda onAuthStateChanged ishonchli ishlaydi va
      // native/JS SDK o'rtasida konflikt bo'lmaydi.
      skipNativeAuth: true,
      providers: ['google.com']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#0F172A",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
