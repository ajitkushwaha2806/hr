import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.truehr.hrms',
  appName: 'trueHr',
  webDir: 'public',
  server: {
    url: 'https://truehr.magicscale.in',
    errorPath: 'offline.html',
    cleartext: true,
    allowNavigation: [
      'truehr.magicscale.in',
      '*.magicscale.in',
      '*.vercel.app',
      '*.truehr.app',
      '*.clerk.accounts.dev',
      'accounts.google.com',
      '*'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#FBF9F3",
      androidSplashResourceName: "splash",
      androidScaleType: "FIT_CENTER",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#f65340",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
