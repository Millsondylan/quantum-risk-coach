import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.quantumriskcoach.app',
  appName: 'Quantum Risk Coach',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0B0F1A',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#2DF4FF',
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: 'launch_screen',
      useDialog: true
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0B0F1A'
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true
    },
    App: {
      urlOpenWindow: '_blank'
    }
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0B0F1A'
  },
  android: {
    backgroundColor: '#0B0F1A',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
}

export default config
