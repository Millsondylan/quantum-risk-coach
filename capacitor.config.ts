import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quantumriskcoach.app',
  appName: 'Quantum Risk Coach',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0a0a',
      showSpinner: true,
      spinnerColor: '#00d9ff',
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'large',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0a0a0a',
      overlaysWebView: false,
      show: true
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
      accessoryBarVisible: false
    },
    App: {
      urlOpen: {
        appId: 'com.quantumriskcoach.app'
      }
    }
  },
  android: {
    backgroundColor: '#0a0a0a',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  },
  ios: {
    backgroundColor: '#0a0a0a',
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true
  }
};

export default config;
