import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#0F172A"
        />
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default App;
