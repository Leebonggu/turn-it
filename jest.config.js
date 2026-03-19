module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|react-native|@react-native|@react-native-community|expo|@expo|@expo-google-fonts|react-navigation|@react-navigation|@sentry/react-native|native-base|react-native-svg|@testing-library))',
    'node_modules/.pnpm/(?!(react-native|@react-native|expo|@expo|@testing-library))',
  ],
};
