import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { AuthContext } from '../context/AuthContext';

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Please enter a valid email')
    .required('Email is required'),
});

const ForgotPasswordScreen = ({ navigation }) => {
  const { forgotPassword } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleReset = async (values) => {
    setLoading(true);
    const success = await forgotPassword(values.email);
    setLoading(false);
    if (success) {
      navigation.navigate('Login');
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
            <Text style={styles.titleText}>Recover Password</Text>
            <Text style={styles.subtitleText}>
              Enter your email address and we'll send you instructions to reset your password.
            </Text>
            <Text style={styles.mockNoteText}>
              Note: This is a simulated password recovery flow. Check task instructions for video guidelines.
            </Text>
          </View>

          <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={handleReset}
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

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#0F172A" />
                  ) : (
                    <Text style={styles.buttonText}>Send Instructions</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.backBtnText}>Back to Sign In</Text>
                </TouchableOpacity>
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
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#38BDF8',
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 15,
    color: '#94A3B8',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
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
    marginBottom: 24,
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
  backBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  mockNoteText: {
    fontSize: 12,
    color: '#94A3B8',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen;
