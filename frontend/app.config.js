export default {
  expo: {
    name: "StudySidekick",
    slug: "study-sidekick",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#7C3AED"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.studysidekick.app",
      buildNumber: "1.0.0"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#7C3AED"
      },
      package: "com.studysidekick.app",
      versionCode: 1
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    extra: {
      apiUrl: process.env.VITE_API_URL || "http://localhost:5000/api"
    }
  }
};

