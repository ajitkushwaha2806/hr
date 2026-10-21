import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.getrepeat.app',
  appName: 'EDGE HR',
  webDir: 'public',
  server: {
    url: 'https://app.getrepeat.in',
    errorPath: 'offline.html',
    cleartext: true,
    allowNavigation: [
      '*.getrepeat.in',
      '*.clerk.accounts.dev',
      'accounts.google.com',
      '*'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "FIT_CENTER",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#059348",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
