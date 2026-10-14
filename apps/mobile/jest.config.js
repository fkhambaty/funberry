const path = require("path");

// Pin React and the test renderer to the app's 18.3.1 copies; the web workspace hoists React 19.
const appReact = path.dirname(require.resolve("react/package.json", { paths: [__dirname] }));

module.exports = {
  preset: "jest-expo",
  roots: ["<rootDir>"],
  testMatch: ["<rootDir>/**/__tests__/**/*.test.ts?(x)"],
  testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
  moduleNameMapper: {
    "^react$": appReact,
    "^react/(.*)$": `${appReact}/$1`,
  },
  transformIgnorePatterns: [
    "/node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|react-native-svg|react-native-webview|react-native-safe-area-context|react-native-screens|expo-router|@funberry/.*))",
  ],
  setupFiles: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: ["lib/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
};
