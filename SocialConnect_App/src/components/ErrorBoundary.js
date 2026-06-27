import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Catches render-time errors anywhere below it in the tree and shows a
 * friendly recovery screen instead of a blank/crashed app. Wrapped
 * around RootNavigator in App.tsx so a bug in any single screen can't
 * take down the whole app.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error caught by ErrorBoundary:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            An unexpected error occurred. You can try again, or restart the app.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#38BDF8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default ErrorBoundary;
