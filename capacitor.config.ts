import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.quantumriskcoach.app',
  appName: 'Quantum Risk Coach',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
    allowNavigation: [
      'https://api.telegram.org',
      'https://api.binance.com',
      'https://api.alpaca.markets',
      'https://api.openai.com',
      'https://api.groq.com'
    ]
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
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#00d9ff",
      sound: "beep.wav"
    },
    Geolocation: {
      permissions: ["ACCESS_COARSE_LOCATION", "ACCESS_FINE_LOCATION"]
    },
    Camera: {
      permissions: ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
    },
    Device: {
      permissions: ["ACCESS_NETWORK_STATE", "ACCESS_WIFI_STATE"]
    }
  },
  android: {
    backgroundColor: '#0a0a0a',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    appendUserAgent: 'QuantumRiskCoach/1.0.0',
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK',
      signingType: 'apksigner'
    }
  },
  ios: {
    backgroundColor: '#0a0a0a',
    contentInset: 'automatic',
    allowsLinkPreview: false,
    scrollEnabled: true,
    appendUserAgent: 'QuantumRiskCoach/1.0.0',
    preferredContentMode: 'mobile'
  },
  cordova: {
    preferences: {
      ScrollEnabled: 'false',
      BackupWebStorage: 'none',
      SplashMaintainAspectRatio: 'true',
      FadeSplashScreenDuration: '300',
      SplashShowOnlyFirstTime: 'false',
      SplashScreen: 'screen',
      SplashScreenDelay: '3000',
      AutoHideSplashScreen: 'false',
      orientation: 'portrait',
      loadUrlTimeoutValue: '60000',
      WKWebViewOnly: 'true',
      CordovaWebViewEngine: 'CDVWKWebViewEngine',
      webviewbounce: 'false',
      UIWebViewBounce: 'false',
      DisallowOverscroll: 'true',
      EnableViewportScale: 'false',
      MediaPlaybackRequiresUserAction: 'false',
      AllowInlineMediaPlayback: 'true',
      BackgroundColorByHexString: '#0a0a0a',
      TopActivityIndicator: 'gray',
      GapBetweenPages: '0',
      PageLength: '0',
      PaginationBreakingMode: '0',
      PaginationMode: '0',
      SupportsTabBar: 'true',
      Fullscreen: 'false'
    }
  }
};

export default config;
