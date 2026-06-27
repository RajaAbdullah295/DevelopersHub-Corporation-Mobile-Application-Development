import React, { useContext, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  SafeAreaView,
  Keyboard,
  Modal,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { AuthContext } from '../context/AuthContext';
import { subscribe, RealtimeEvents } from '../utils/realtimeBus';
import PostCard from '../components/PostCard';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

const HomeScreen = ({ navigation }) => {
  const { user, posts, addPost, toggleLikePost, addCommentToPost } = useContext(AuthContext);
  const [postContent, setPostContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [liveBanner, setLiveBanner] = useState(null);

  // Comments modal states
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [commentText, setCommentText] = useState('');

  // Real-time updates: listen for likes/comments emitted anywhere in the
  // app (e.g. from UserProfileViewScreen) and surface a brief live banner,
  // the same way a Firebase Realtime Database / Socket.io listener would
  // push an update without the user pulling to refresh.
  useEffect(() => {
    const unsubLike = subscribe(RealtimeEvents.POST_LIKED, () => {
      setLiveBanner('A post just got a new like');
    });
    const unsubComment = subscribe(RealtimeEvents.POST_COMMENTED, () => {
      setLiveBanner('A new comment just came in');
    });

    return () => {
      unsubLike();
      unsubComment();
    };
  }, []);

  useEffect(() => {
    if (!liveBanner) return;
    const timer = setTimeout(() => setLiveBanner(null), 2200);
    return () => clearTimeout(timer);
  }, [liveBanner]);

  const handlePickImage = useCallback(() => {
    const options = {
      mediaType: 'photo',
      maxWidth: 800,
      maxHeight: 800,
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Failed to open image picker');
      } else if (response.assets && response.assets.length > 0) {
        setSelectedImage(response.assets[0].uri);
      }
    });
  }, []);

  const handlePostSubmit = useCallback(() => {
    if (!postContent.trim()) return;
    addPost(postContent.trim(), selectedImage);
    setPostContent('');
    setSelectedImage(null);
    Keyboard.dismiss();
  }, [postContent, selectedImage, addPost]);

  const handleOpenComments = useCallback((post) => {
    setActivePost(post);
    setCommentModalVisible(true);
  }, []);

  const handleToggleLike = useCallback((postId) => {
    toggleLikePost(postId);
  }, [toggleLikePost]);

  const handlePressUser = useCallback((userId) => {
    navigation.navigate('UserProfileView', { userId });
  }, [navigation]);

  const handleSendComment = useCallback(() => {
    if (!commentText.trim() || !activePost) return;
    addCommentToPost(activePost.id, commentText.trim());

    // Update local modal post reference to show comment instantly
    const mockComment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userAvatar: user.profilePicture || DEFAULT_AVATAR,
      text: commentText.trim(),
      timestamp: 'Just now',
    };
    setActivePost((prev) => prev && ({
      ...prev,
      comments: [...prev.comments, mockComment],
    }));

    setCommentText('');
    Keyboard.dismiss();
  }, [commentText, activePost, addCommentToPost, user]);

  const renderPostItem = useCallback(({ item }) => (
    <PostCard
      post={item}
      currentUserId={user?.id}
      onToggleLike={handleToggleLike}
      onOpenComments={handleOpenComments}
      onPressUser={handlePressUser}
    />
  ), [user?.id, handleToggleLike, handleOpenComments, handlePressUser]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <SafeAreaView style={styles.container}>
      {liveBanner && (
        <Animated.View
          entering={FadeInDown.duration(220)}
          exiting={FadeOutUp.duration(220)}
          style={styles.liveBanner}
        >
          <Icon name="lightning-bolt" size={16} color="#0F172A" />
          <Text style={styles.liveBannerText}>{liveBanner}</Text>
        </Animated.View>
      )}
      <FlatList
        data={posts}
        renderItem={renderPostItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.createPostContainer}>
            <View style={styles.createPostHeader}>
              <Image
                source={{
                  uri: user?.profilePicture || DEFAULT_AVATAR,
                }}
                style={styles.createPostAvatar}
              />
              <Text style={styles.welcomeText}>What's on your mind, {user?.name.split(' ')[0]}?</Text>
            </View>
            
            <TextInput
              style={styles.createPostInput}
              placeholder="Share an update, link, or thought..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={3}
              value={postContent}
              onChangeText={setPostContent}
            />

            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => setSelectedImage(null)}>
                  <Icon name="close" size={16} color="#F8FAFC" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.createPostFooter}>
              <TouchableOpacity style={styles.addMediaButton} onPress={handlePickImage}>
                <Icon name="image-plus" size={18} color="#38BDF8" />
                <Text style={styles.addMediaText}>Add Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.postButton,
                  !postContent.trim() && styles.postButtonDisabled,
                ]}
                onPress={handlePostSubmit}
                disabled={!postContent.trim()}
              >
                <Text style={styles.postButtonText}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No posts yet. Start sharing!</Text>
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
              data={activePost ? posts.find(p => p.id === activePost.id)?.comments || activePost.comments : []}
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
  listContent: {
    padding: 16,
  },
  createPostContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    marginBottom: 20,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#334155',
  },
  welcomeText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
  },
  createPostInput: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 12,
    fontSize: 15,
    textAlignVertical: 'top',
    height: 80,
  },
  imagePreviewContainer: {
    marginTop: 12,
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    backgroundColor: '#0F172A',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  removeImageText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: 'bold',
  },
  createPostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  addMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#334155',
    borderWidth: 1,
    borderColor: '#475569',
  },
  addMediaText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  postButton: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  postButtonDisabled: {
    backgroundColor: '#334155',
    opacity: 0.5,
  },
  postButtonText: {
    color: '#0F172A',
    fontWeight: 'bold',
    fontSize: 14,
  },
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#38BDF8',
    paddingVertical: 8,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
  },
  liveBannerText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
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

export default HomeScreen;
