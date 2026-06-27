import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { AuthContext } from '../context/AuthContext';

const SignUpSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name is too short')
    .max(50, 'Name is too long')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm Password is required'),
});

const SignUpScreen = ({ navigation }) => {
  const { signUp } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (values) => {
    setLoading(true);
    const success = await signUp(values.name, values.email, values.password);
    setLoading(false);
    if (success) {
      // Navigates automatically due to AuthState changes in context
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>Join Social Connect</Text>
            <Text style={styles.subtitleText}>Create an account to start sharing updates.</Text>
          </View>

          <Formik
            initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
            validationSchema={SignUpSchema}
            onSubmit={handleSignUp}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.name && errors.name && styles.inputError,
                    ]}
                    placeholder="Enter your name"
                    placeholderTextColor="#64748B"
                    autoCapitalize="words"
                    autoCorrect={false}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    value={values.name}
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.email && errors.email && styles.inputError,
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor="#64748B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.password && errors.password && styles.inputError,
                    ]}
                    placeholder="Create a password"
                    placeholderTextColor="#64748B"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                  />
                  {touched.password && errors.password && (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <TextInput
                    style={[
                      styles.input,
                      touched.confirmPassword && errors.confirmPassword && styles.inputError,
                    ]}
                    placeholder="Confirm your password"
                    placeholderTextColor="#64748B"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    value={values.confirmPassword}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#0F172A" />
                  ) : (
                    <Text style={styles.buttonText}>Register</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.loginPromptContainer}>
                  <Text style={styles.loginPromptText}>Already have an account? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginLinkText}>Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  subtitleText: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#1E293B',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#38BDF8',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginPromptContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginPromptText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  loginLinkText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;
