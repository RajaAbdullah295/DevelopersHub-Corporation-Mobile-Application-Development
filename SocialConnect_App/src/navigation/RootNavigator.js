import React, { useContext } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { AuthContext } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import UserProfileViewScreen from '../screens/UserProfileViewScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#0F172A', // Slate 900
      },
      headerTintColor: '#F8FAFC', // Slate 50
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      contentStyle: {
        backgroundColor: '#0F172A',
      },
      animation: 'slide_from_right',
      freezeOnBlur: true,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
    <Stack.Screen name="SignUp" component={SignUpScreen} options={{ title: 'Create Account' }} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Reset Password' }} />
  </Stack.Navigator>
);

const HomeStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#0F172A',
      },
      headerTintColor: '#F8FAFC',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      contentStyle: {
        backgroundColor: '#0F172A',
      },
      animation: 'slide_from_right',
      freezeOnBlur: true,
    }}
  >
    <Stack.Screen name="HomeFeed" component={HomeScreen} options={{ title: 'Social Connect' }} />
    <Stack.Screen name="UserProfileView" component={UserProfileViewScreen} options={{ title: 'User Profile' }} />
  </Stack.Navigator>
);

const AppTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      // eslint-disable-next-line react/no-unstable-nested-components
      tabBarIcon: ({ color, size }) => {
        let iconName = '';
        if (route.name === 'Home') {
          iconName = 'home';
        } else if (route.name === 'Profile') {
          iconName = 'account';
        } else if (route.name === 'Settings') {
          iconName = 'cog';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#38BDF8', // Sky 400
      tabBarInactiveTintColor: '#94A3B8', // Slate 400
      tabBarStyle: {
        backgroundColor: '#1E293B', // Slate 800
        borderTopColor: '#334155', // Slate 700
        paddingBottom: 6,
        paddingTop: 6,
        height: 60,
      },
      headerStyle: {
        backgroundColor: '#0F172A',
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
      },
      headerTintColor: '#F8FAFC',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
    <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
  </Tab.Navigator>
);

const RootNavigator = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loadingText}>Loading Social Connect...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#94A3B8',
    fontSize: 16,
  },
});

export default RootNavigator;
