import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

import { AuthContext } from '../context/AuthContext';
import { rw } from '../utils/responsive';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

const ProfileScreen = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [tempAvatar, setTempAvatar] = useState(user?.profilePicture || null);

  // Scales with screen width so the avatar looks proportionate on both
  // small phones and large tablets, instead of a fixed 120px everywhere.
  const avatarSize = Math.min(rw(32), 140);

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        setTempAvatar(uri);
      }
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    const success = await updateProfile(name, bio, tempAvatar);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setName(user?.name || '');
    setBio(user?.bio || '');
    setTempAvatar(user?.profilePicture || null);
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileCard}>
            <View style={styles.avatarSection}>
              <Image
                source={{ uri: tempAvatar || DEFAULT_AVATAR }}
                style={[
                  styles.avatar,
                  { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
                ]}
              />
              {isEditing && (
                <TouchableOpacity style={styles.avatarUploadBadge} onPress={selectImage}>
                  <Text style={styles.uploadBadgeText}>📸</Text>
                </TouchableOpacity>
              )}
            </View>

            {!isEditing ? (
              <View style={styles.infoSection}>
                <Text style={styles.nameText}>{user?.name}</Text>
                <Text style={styles.emailText}>{user?.email}</Text>
                
                <View style={styles.bioContainer}>
                  <Text style={styles.bioTitle}>About Me</Text>
                  <Text style={styles.bioText}>{user?.bio || 'No bio added yet.'}</Text>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.editSection}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor="#64748B"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Bio</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell us about yourself"
                    placeholderTextColor="#64748B"
                    multiline
                    numberOfLines={4}
                  />
                </View>

                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={handleCancel}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
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
    padding: 24,
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 24,
  },
  avatar: {
    borderWidth: 3,
    borderColor: '#38BDF8',
    backgroundColor: '#334155',
  },
  avatarUploadBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#38BDF8',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1E293B',
  },
  uploadBadgeText: {
    fontSize: 16,
  },
  infoSection: {
    width: '100%',
    alignItems: 'center',
  },
  nameText: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: 'bold',
  },
  emailText: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 4,
  },
  bioContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    width: '100%',
    marginTop: 24,
    marginBottom: 24,
  },
  bioTitle: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  bioText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
  },
  editButton: {
    backgroundColor: '#38BDF8',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editSection: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#F8FAFC',
    fontSize: 14,
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#334155',
    marginRight: 12,
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#38BDF8',
  },
  saveButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
