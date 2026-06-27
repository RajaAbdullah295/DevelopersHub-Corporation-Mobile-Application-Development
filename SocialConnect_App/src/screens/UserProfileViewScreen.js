import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Keyboard,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import PostCard from '../components/PostCard';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

const UserProfileViewScreen = ({ route, navigation }) => {
  const { userId } = route.params;
  const { posts, getUserById, toggleLikePost, addCommentToPost, user: currentUser } = useContext(AuthContext);
  
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Comments modal states
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const fetchProfileDetails = async () => {
      setLoading(true);
      const details = await getUserById(userId);
      setProfileUser(details);
      setLoading(false);
    };
    fetchProfileDetails();
  }, [userId, getUserById]);

  // Filter posts to show only those written by the user being viewed
  const userPosts = posts.filter(post => post.userId === userId);

  const handleOpenComments = useCallback((post) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  }, []);

  const handleToggleLike = useCallback((postId) => {
    toggleLikePost(postId);
  }, [toggleLikePost]);

  const handleSendComment = useCallback(() => {
    if (!commentText.trim() || !selectedPost) return;
    addCommentToPost(selectedPost.id, commentText.trim());

    // Update local modal post reference to show comment instantly
    const mockComment = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.profilePicture || DEFAULT_AVATAR,
      text: commentText.trim(),
      timestamp: 'Just now',
    };
    setSelectedPost((prev) => prev && ({
      ...prev,
      comments: [...prev.comments, mockComment],
    }));
    setCommentText('');
    Keyboard.dismiss();
  }, [commentText, selectedPost, addCommentToPost, currentUser]);

  const renderPostItem = useCallback(({ item }) => (
    <PostCard
      post={item}
      currentUserId={currentUser?.id}
      onToggleLike={handleToggleLike}
      onOpenComments={handleOpenComments}
    />
  ), [currentUser?.id, handleToggleLike, handleOpenComments]);

  const keyExtractor = useCallback((item) => item.id, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loadingText}>Fetching profile...</Text>
      </View>
    );
  }

  if (!profileUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User profile not found.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={userPosts}
        renderItem={renderPostItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.profileHeaderCard}>
            <Image
              source={{ uri: profileUser.profilePicture || DEFAULT_AVATAR }}
              style={styles.profileAvatar}
            />
            <Text style={styles.profileName}>{profileUser.name}</Text>
            <Text style={styles.profileEmail}>{profileUser.email}</Text>
            <View style={styles.bioContainer}>
              <Text style={styles.bioTitle}>About</Text>
              <Text style={styles.bioText}>{profileUser.bio || 'No bio provided.'}</Text>
            </View>
            <Text style={styles.postsTitle}>Posts ({userPosts.length})</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>This user hasn't posted anything yet.</Text>
          </View>
        }
      />

      {/* Slide-Up Comments Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={commentModalVisible}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)} style={styles.closeButton}>
                <Icon name="close" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={selectedPost ? posts.find(p => p.id === selectedPost.id)?.comments || selectedPost.comments : []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.commentsList}
              renderItem={({ item }) => (
                <View style={styles.commentItem}>
                  <Image source={{ uri: item.userAvatar }} style={styles.commentAvatar} />
                  <View style={styles.commentDetails}>
                    <View style={styles.commentUserRow}>
                      <Text style={styles.commentUserName}>{item.userName}</Text>
                      <Text style={styles.commentTime}>{item.timestamp}</Text>
                    </View>
                    <Text style={styles.commentText}>{item.text}</Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyCommentsContainer}>
                  <Text style={styles.emptyCommentsText}>No comments yet. Write the first one!</Text>
                </View>
              }
            />

            <View style={styles.commentInputContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#64748B"
                value={commentText}
                onChangeText={setCommentText}
              />
              <TouchableOpacity
                onPress={handleSendComment}
                style={[styles.commentSendButton, !commentText.trim() && styles.commentSendButtonDisabled]}
                disabled={!commentText.trim()}
              >
                <Text style={styles.commentSendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  profileHeaderCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#38BDF8',
    marginBottom: 16,
    backgroundColor: '#334155',
  },
  profileName: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: 'bold',
  },
  profileEmail: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 4,
  },
  bioContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 14,
    width: '100%',
    marginTop: 20,
  },
  bioTitle: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  bioText: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
  },
  postsTitle: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginTop: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '75%',
    borderWidth: 1,
    borderColor: '#334155',
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentsList: {
    padding: 16,
    paddingBottom: 40,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: '#334155',
  },
  commentDetails: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  commentUserRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentTime: {
    color: '#64748B',
    fontSize: 11,
  },
  commentText: {
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 18,
  },
  emptyCommentsContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCommentsText: {
    color: '#64748B',
    fontSize: 15,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    marginRight: 12,
  },
  commentSendButton: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  commentSendButtonDisabled: {
    backgroundColor: '#334155',
    opacity: 0.5,
  },
  commentSendText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default UserProfileViewScreen;
