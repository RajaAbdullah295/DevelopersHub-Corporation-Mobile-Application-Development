import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';

const SettingsScreen = () => {
  const { user, logout } = useContext(AuthContext);
  
  // Setting states (simulated toggles)
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const darkMode = true; // Always on in this premium theme!

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Account Info banner */}
        <View style={styles.profileHeader}>
          <Text style={styles.welcomeText}>Logged in as</Text>
          <Text style={styles.nameText}>{user?.name}</Text>
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>

        {/* Settings Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              trackColor={{ false: '#334155', true: '#0ea5e9' }}
              thumbColor={pushNotifications ? '#38bdf8' : '#94a3b8'}
              ios_backgroundColor="#334155"
              onValueChange={setPushNotifications}
              value={pushNotifications}
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Weekly Email Digest</Text>
            <Switch
              trackColor={{ false: '#334155', true: '#0ea5e9' }}
              thumbColor={emailDigest ? '#38bdf8' : '#94a3b8'}
              ios_backgroundColor="#334155"
              onValueChange={setEmailDigest}
              value={emailDigest}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Premium Dark Theme</Text>
            <Switch
              trackColor={{ false: '#334155', true: '#0ea5e9' }}
              thumbColor={darkMode ? '#38bdf8' : '#94a3b8'}
              ios_backgroundColor="#334155"
              disabled={true} // Locked to dark mode for aesthetics
              value={darkMode}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About App</Text>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>1.0.0 (Week 1 Build)</Text>
          </View>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Developer Hub Corp</Text>
            <Text style={styles.aboutValue}>Social Connect Team</Text>
          </View>
        </View>

        {/* Log out action */}
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
  },
  profileHeader: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  welcomeText: {
    color: '#64748B',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nameText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 6,
  },
  emailText: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  settingLabel: {
    color: '#E2E8F0',
    fontSize: 15,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  aboutLabel: {
    color: '#94A3B8',
    fontSize: 15,
  },
  aboutValue: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  logoutButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
