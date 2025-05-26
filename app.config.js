module.exports = {
    name: "Cifa Mobile App",
    slug: "cifa-mobile-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "cifaapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
       package: "com.invovibe.cifaapp",
       googleServicesFile: "./google-services.json"
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "@react-native-firebase/app",
      "expo-av",
      [
        "expo-build-properties",
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: "34.0.0"
          },
          ios: {
            deploymentTarget: "13.4"
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      // Firebase configuration
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,

      googleWebClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      router: {
        origin: false
      },
      eas: {
      projectId: "f3f0c936-d5b2-4a7f-8884-3b00ff83d6e1"
      },
      owner: "cifa"
    }
    
  };