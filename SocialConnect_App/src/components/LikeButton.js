import React, { memo, useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

/**
 * Animated heart + like-count control.
 * Pops with a spring animation whenever `hasLiked` flips to true,
 * giving the same satisfying "snap" feedback users expect from
 * Instagram/Twitter-style like buttons.
 */
function LikeButton({ hasLiked, likeCount, onPress }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (hasLiked) {
      scale.value = withSequence(
        withSpring(1.4, { damping: 4, stiffness: 300 }),
        withSpring(1, { damping: 8, stiffness: 200 }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasLiked]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity style={styles.footerAction} onPress={onPress} accessibilityRole="button">
      <Animated.View style={animatedIconStyle}>
        <Icon
          name={hasLiked ? 'heart' : 'heart-outline'}
          size={20}
          color={hasLiked ? '#EF4444' : '#94A3B8'}
          style={styles.actionIcon}
        />
      </Animated.View>
      <Text style={[styles.actionText, hasLiked && styles.likedText]}>
        {likeCount} Likes
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  likedText: {
    color: '#38BDF8',
    fontWeight: '600',
  },
});

// Memoized: in a feed of many posts, only the post whose like state
// actually changed should re-render its like button.
export default memo(LikeButton);
