import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quantumriskcoach.app',
  appName: 'Quantum Risk Coach',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#0a0a0a',
      showSpinner: true,
      spinnerColor: '#00d9ff',
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'large',
      splashFullScreen: true,
      splashImmersive: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0a0a0a',
      overlaysWebView: false
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    }
  },
  android: {
    backgroundColor: '#0a0a0a'
  },
  ios: {
    backgroundColor: '#0a0a0a'
  }
};

export default config;
