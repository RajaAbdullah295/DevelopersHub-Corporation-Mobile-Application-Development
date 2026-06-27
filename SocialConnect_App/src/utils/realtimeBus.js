/**
 * Lightweight real-time event bus.
 *
 * Social Connect's backend is a local mock (AsyncStorage), so there is no
 * live server to open a Firebase Realtime Database / Socket.io connection
 * to. This bus reproduces the same *behavior* those tools provide inside
 * a single running app instance: the moment one screen changes data
 * (a like, a new comment, a new post), every other mounted screen is
 * notified immediately and re-renders with the fresh data — no polling,
 * no manual refresh.
 *
 * Swapping this for a real Socket.io client or Firebase `onValue`
 * listener later only requires changing `emit`/`subscribe` internals —
 * every screen that consumes AuthContext keeps working unchanged.
 */

const listeners = new Map();

export const RealtimeEvents = {
  POST_LIKED: 'POST_LIKED',
  POST_COMMENTED: 'POST_COMMENTED',
  POST_CREATED: 'POST_CREATED',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
};

export function subscribe(eventName, callback) {
  if (!listeners.has(eventName)) {
    listeners.set(eventName, new Set());
  }
  listeners.get(eventName).add(callback);

  return () => {
    const set = listeners.get(eventName);
    if (set) {
      set.delete(callback);
    }
  };
}

export function emit(eventName, payload) {
  const set = listeners.get(eventName);
  if (!set) return;
  set.forEach((callback) => {
    try {
      callback(payload);
    } catch (e) {
      console.error(`Realtime listener for ${eventName} failed`, e);
    }
  });
}

export default { subscribe, emit, RealtimeEvents };
