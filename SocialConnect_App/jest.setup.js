/* eslint-disable no-undef */
// Mock native modules that have no JS-only implementation available
// inside the Jest test environment (they require a real device/emulator).

jest.mock('@notifee/react-native', () => ({
  __esModule: true,
  default: {
    requestPermission: jest.fn(() => Promise.resolve({ authorizationStatus: 1 })),
    createChannel: jest.fn(() => Promise.resolve('default')),
    displayNotification: jest.fn(() => Promise.resolve()),
    onForegroundEvent: jest.fn(() => () => {}),
  },
  EventType: { PRESS: 1, DISMISSED: 2, DELIVERED: 3 },
  AndroidImportance: { HIGH: 4, DEFAULT: 3 },
}));

jest.mock('react-native-reanimated', () => {
  const RN = require('react-native');
  const React = require('react');

  // Hand-rolled mock: the official `react-native-reanimated/mock` pulls in
  // react-native-worklets' native module path, which throws outside a real
  // RN runtime (a known sharp edge with Reanimated 4's worklets split).
  // This mock only needs to cover the specific APIs Social Connect uses
  // (useSharedValue, useAnimatedStyle, withSequence/withSpring, entering/
  // exiting animation components) so tests can render without crashing.
  const useSharedValue = (initial) => ({ value: initial });
  const useAnimatedStyle = (factory) => factory();
  const withSpring = (toValue) => toValue;
  const withSequence = (...values) => values[values.length - 1];

  const identityComponent = (Component) =>
    React.forwardRef((props, ref) => React.createElement(Component, { ...props, ref }));

  return {
    __esModule: true,
    default: {
      View: identityComponent(RN.View),
      Text: identityComponent(RN.Text),
      Image: identityComponent(RN.Image),
      ScrollView: identityComponent(RN.ScrollView),
      createAnimatedComponent: (Component) => identityComponent(Component),
    },
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withSequence,
    FadeInDown: { duration: () => ({}) },
    FadeOutUp: { duration: () => ({}) },
  };
});
