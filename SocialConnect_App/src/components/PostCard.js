import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import LikeButton from './LikeButton';
import { rf } from '../utils/responsive';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

/**
 * Single post card shared by HomeScreen's feed and UserProfileViewScreen.
 * Memoized so that, in a long FlatList, only the card whose own props
 * (likes/comments on THAT post) changed re-renders — liking post #1 in
 * a feed of 50 no longer re-renders the other 49.
 *
 * `onPressUser` is optional: HomeScreen passes it (tap name -> view
 * profile), UserProfileViewScreen omits it since you're already on
 * that user's profile.
 */
function PostCard({ post, currentUserId, onToggleLike, onOpenComments, onPressUser }) {
  const hasLiked = !!currentUserId && post.likes.includes(currentUserId);

  const HeaderWrapper = onPressUser ? TouchableOpacity : View;
  const headerWrapperProps = onPressUser
    ? { style: styles.headerPressable, onPress: () => onPressUser(post.userId) }
    : { style: styles.headerPressable };

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <HeaderWrapper {...headerWrapperProps}>
          <Image source={{ uri: post.userAvatar || DEFAULT_AVATAR }} style={styles.postAvatar} />
          <View style={styles.postUserInfo}>
            <Text style={styles.postUserName}>{post.userName}</Text>
            <Text style={styles.postTimestamp}>{post.timestamp}</Text>
          </View>
        </HeaderWrapper>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
      )}

      <View style={styles.postFooter}>
        <LikeButton
          hasLiked={hasLiked}
          likeCount={post.likes.length}
          onPress={() => onToggleLike(post.id)}
        />

        <TouchableOpacity style={styles.footerAction} onPress={() => onOpenComments(post)}>
          <Icon name="comment-text-outline" size={20} color="#94A3B8" style={styles.actionIcon} />
          <Text style={styles.actionText}>{post.comments.length} Comments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#334155',
  },
  postUserInfo: {
    flex: 1,
  },
  postUserName: {
    color: '#F8FAFC',
    fontSize: rf(2),
    fontWeight: 'bold',
  },
  postTimestamp: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  postContent: {
    color: '#E2E8F0',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#0F172A',
  },
  postFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionIcon: {
    marginRight: 6,
  },
  actionText: {
    color: '#94A3B8',
    fontSize: 14,
  },
});

function arePropsEqual(prevProps, nextProps) {
  const prevPost = prevProps.post;
  const nextPost = nextProps.post;
  return (
    prevPost.id === nextPost.id &&
    prevPost.likes.length === nextPost.likes.length &&
    prevPost.likes.includes(prevProps.currentUserId) === nextPost.likes.includes(nextProps.currentUserId) &&
    prevPost.comments.length === nextPost.comments.length &&
    prevPost.content === nextPost.content &&
    prevPost.userName === nextPost.userName &&
    prevPost.userAvatar === nextPost.userAvatar
  );
}

export default memo(PostCard, arePropsEqual);
