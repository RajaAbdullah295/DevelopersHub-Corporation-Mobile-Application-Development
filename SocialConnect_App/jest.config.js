module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      '@react-native|' +
      'react-native|' +
      '@react-navigation|' +
      '@react-native-async-storage/async-storage|' +
      'react-native-image-picker|' +
      'react-native-vector-icons|' +
      'react-native-reanimated|' +
      'react-native-worklets|' +
      'react-native-responsive-dimensions|' +
      '@notifee/react-native' +
    ')/)',
  ],
  setupFiles: ['./jest.setup.js'],
};
