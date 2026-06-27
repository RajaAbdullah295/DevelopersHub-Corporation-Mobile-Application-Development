import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

const CHANNEL_ID = 'social-connect-activity';
let channelReady = false;

/**
 * Requests notification permission (required on iOS and Android 13+).
 * Safe to call multiple times; the underlying native call is idempotent.
 */
export async function requestNotificationPermission() {
  try {
    const settings = await notifee.requestPermission();
    return settings;
  } catch (e) {
    console.error('Failed to request notification permission', e);
    return null;
  }
}

async function ensureChannel() {
  if (channelReady || Platform.OS !== 'android') return;
  try {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Post activity',
      importance: AndroidImportance.HIGH,
    });
    channelReady = true;
  } catch (e) {
    console.error('Failed to create notification channel', e);
  }
}

/**
 * Fires a local notification. In a production build with a real backend,
 * this same function would be called from a Firebase Cloud Messaging
 * background handler instead of directly from app code — the call site
 * in AuthContext stays the same either way.
 */
async function displayNotification(title, body, data = {}) {
  try {
    await ensureChannel();
    await notifee.displayNotification({
      title,
      body,
      data,
      android: {
        channelId: CHANNEL_ID,
        pressAction: { id: 'default' },
        smallIcon: 'ic_launcher',
      },
      ios: {
        sound: 'default',
      },
    });
  } catch (e) {
    // Notifications are a nice-to-have; never let a failure here
    // break the like/comment action that triggered it.
    console.error('Failed to display notification', e);
  }
}

export async function notifyPostLiked({ likerName, postOwnerId, currentUserId }) {
  if (postOwnerId === currentUserId) return; // don't notify yourself
  await displayNotification(
    'New like on your post',
    `${likerName} liked your post.`,
    { type: 'like' },
  );
}

export async function notifyPostCommented({ commenterName, postOwnerId, currentUserId, commentText }) {
  if (postOwnerId === currentUserId) return; // don't notify yourself
  await displayNotification(
    'New comment on your post',
    `${commenterName} commented: "${commentText.slice(0, 60)}"`,
    { type: 'comment' },
  );
}

export default {
  requestNotificationPermission,
  notifyPostLiked,
  notifyPostCommented,
};
