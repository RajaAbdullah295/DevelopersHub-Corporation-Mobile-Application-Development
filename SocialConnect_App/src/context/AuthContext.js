import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

import { emit, RealtimeEvents } from '../utils/realtimeBus';
import {
  requestNotificationPermission,
  notifyPostLiked,
  notifyPostCommented,
} from '../utils/notificationService';

export const AuthContext = createContext();

const USERS_KEY = '@social_connect_users';
const CURRENT_USER_KEY = '@social_connect_current_user';

// Simple mock hash function (djb2 hash algorithm) for secure password storage in AsyncStorage
/* eslint-disable no-bitwise */
const hashPassword = (password) => {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash << 5) + hash) + password.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    loadSessionAndData();
    requestNotificationPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSessionAndData = useCallback(async () => {
    try {
      // 1. Load users database and populate mock accounts if empty
      const storedUsers = await AsyncStorage.getItem(USERS_KEY);
      let users = storedUsers ? JSON.parse(storedUsers) : [];
      
      if (users.length === 0) {
        const mockUsers = [
          {
            id: 'user_alex',
            name: 'Alex Johnson',
            email: 'alex@connect.com',
            password: hashPassword('password123'),
            bio: 'Tech Lead at Connect. Android & React Native enthusiast. Building the future of mobile.',
            profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          },
          {
            id: 'user_sarah',
            name: 'Sarah Miller',
            email: 'sarah@connect.com',
            password: hashPassword('password123'),
            bio: 'Product Designer. Coffee lover, traveler, and UI/UX expert.',
            profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
          },
          {
            id: 'user_emily',
            name: 'Emily Davis',
            email: 'emily@connect.com',
            password: hashPassword('password123'),
            bio: 'Freelance writer. Creative strategist, nature hiker, and sunrise catcher.',
            profilePicture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
          }
        ];
        users = mockUsers;
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(mockUsers));
      }

      // 2. Load session
      const storedUser = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      // 3. Load posts and populate mock posts if empty
      const storedPosts = await AsyncStorage.getItem('@social_connect_posts');
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      } else {
        const mockPosts = [
          {
            id: 'post_1',
            userId: 'user_alex',
            userName: 'Alex Johnson',
            userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
            content: 'Hello everyone! Excited to join this new Social Connect platform. 🚀 Let\'s build a fantastic community together.',
            image: null,
            timestamp: '2 hours ago',
            likes: ['user_sarah'],
            comments: [
              {
                id: 'comment_1',
                userId: 'user_sarah',
                userName: 'Sarah Miller',
                userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
                text: 'Welcome Alex! Excited to see this app grow.',
                timestamp: '1 hour ago'
              }
            ],
          },
          {
            id: 'post_2',
            userId: 'user_sarah',
            userName: 'Sarah Miller',
            userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
            content: 'Just had a wonderful coffee! Highly recommend the new café downtown. ☕✨ The UI/UX of this roastery is top notch too!',
            image: 'https://images.unsplash.com/photo-1507133750040-4a8f57021571?auto=format&fit=crop&w=600&q=80',
            timestamp: '5 hours ago',
            likes: ['user_alex', 'user_emily'],
            comments: [],
          },
          {
            id: 'post_3',
            userId: 'user_emily',
            userName: 'Emily Davis',
            userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
            content: 'Hiking in the morning light. Nature is the best reset button. 🌲🚶‍♀️',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
            timestamp: '1 day ago',
            likes: [],
            comments: [],
          }
        ];
        setPosts(mockPosts);
        await AsyncStorage.setItem('@social_connect_posts', JSON.stringify(mockPosts));
      }
    } catch (e) {
      console.error('Failed to load session/posts', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const usersStr = await AsyncStorage.getItem(USERS_KEY);
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!foundUser) {
        Alert.alert('Error', 'No user found with this email.');
        return false;
      }
      
      if (foundUser.password !== hashPassword(password)) {
        Alert.alert('Error', 'Incorrect password.');
        return false;
      }
      
      setUser(foundUser);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(foundUser));
      return true;
    } catch (e) {
      Alert.alert('Error', 'Login failed');
      return false;
    }
  }, []);

  const signUp = useCallback(async (name, email, password) => {
    try {
      const usersStr = await AsyncStorage.getItem(USERS_KEY);
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (emailExists) {
        Alert.alert('Error', 'A user with this email already exists.');
        return false;
      }
      
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password: hashPassword(password),
        bio: 'No bio added yet.',
        profilePicture: null,
      };
      
      users.push(newUser);
      await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      // Auto login after sign up
      setUser(newUser);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
      return true;
    } catch (e) {
      Alert.alert('Error', 'Registration failed');
      return false;
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      const usersStr = await AsyncStorage.getItem(USERS_KEY);
      const users = usersStr ? JSON.parse(usersStr) : [];
      const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (emailExists) {
        Alert.alert('Reset Success', `A simulated password reset email has been sent to ${email}`);
        return true;
      } else {
        Alert.alert('Error', 'This email is not registered.');
        return false;
      }
    } catch (e) {
      Alert.alert('Error', 'Forgot password simulation failed');
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
      console.error('Failed to logout', e);
    }
  }, []);

  const updateProfile = useCallback(async (name, bio, profilePicture) => {
    try {
      if (!user) return false;
      
      const updatedUser = {
        ...user,
        name: name || user.name,
        bio: bio || user.bio,
        profilePicture: profilePicture || user.profilePicture,
      };
      
      // Update session
      setUser(updatedUser);
      await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      
      // Update mock database (users list)
      const usersStr = await AsyncStorage.getItem(USERS_KEY);
      if (usersStr) {
        const users = JSON.parse(usersStr);
        const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
        await AsyncStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      }
      
      // Sync user profile changes inside feed posts
      const storedPosts = await AsyncStorage.getItem('@social_connect_posts');
      if (storedPosts) {
        const currentPosts = JSON.parse(storedPosts);
        const updatedPosts = currentPosts.map(p => {
          if (p.userId === user.id) {
            return {
              ...p,
              userName: updatedUser.name,
              userAvatar: updatedUser.profilePicture || p.userAvatar,
            };
          }
          return p;
        });
        setPosts(updatedPosts);
        await AsyncStorage.setItem('@social_connect_posts', JSON.stringify(updatedPosts));
      }

      Alert.alert('Success', 'Profile updated successfully!');
      return true;
    } catch (e) {
      Alert.alert('Error', 'Failed to update profile');
      return false;
    }
  }, [user]);

  const addPost = useCallback(async (content, imageUri = null) => {
    try {
      if (!user) return;
      const newPost = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userAvatar: user.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        content,
        image: imageUri,
        timestamp: 'Just now',
        likes: [],
        comments: [],
      };
      
      const updatedPosts = [newPost, ...posts];
      setPosts(updatedPosts);
      await AsyncStorage.setItem('@social_connect_posts', JSON.stringify(updatedPosts));
      emit(RealtimeEvents.POST_CREATED, { post: newPost });
    } catch (e) {
      console.error('Failed to add post', e);
    }
  }, [user, posts]);

  const toggleLikePost = useCallback(async (postId) => {
    try {
      if (!user) return;
      let didLike = false;
      let likedPostOwnerId = null;

      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          const hasLiked = post.likes.includes(user.id);
          didLike = !hasLiked;
          likedPostOwnerId = post.userId;
          const newLikes = hasLiked
            ? post.likes.filter(id => id !== user.id)
            : [...post.likes, user.id];
          return { ...post, likes: newLikes };
        }
        return post;
      });
      setPosts(updatedPosts);
      await AsyncStorage.setItem('@social_connect_posts', JSON.stringify(updatedPosts));

      emit(RealtimeEvents.POST_LIKED, { postId, likes: updatedPosts.find(p => p.id === postId)?.likes });

      // Only fire a notification when the user just liked (not un-liked)
      // someone else's post — mirrors real social apps.
      if (didLike && likedPostOwnerId) {
        notifyPostLiked({
          likerName: user.name,
          postOwnerId: likedPostOwnerId,
          currentUserId: user.id,
        });
      }
    } catch (e) {
      console.error('Failed to toggle like', e);
    }
  }, [user, posts]);

  const addCommentToPost = useCallback(async (postId, text) => {
    try {
      if (!user) return;
      const newComment = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.name,
        userAvatar: user.profilePicture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        text,
        timestamp: 'Just now',
      };

      let commentedPostOwnerId = null;
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          commentedPostOwnerId = post.userId;
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      });
      setPosts(updatedPosts);
      await AsyncStorage.setItem('@social_connect_posts', JSON.stringify(updatedPosts));

      emit(RealtimeEvents.POST_COMMENTED, { postId, comment: newComment });

      if (commentedPostOwnerId) {
        notifyPostCommented({
          commenterName: user.name,
          postOwnerId: commentedPostOwnerId,
          currentUserId: user.id,
          commentText: text,
        });
      }
    } catch (e) {
      console.error('Failed to add comment', e);
    }
  }, [user, posts]);

  const getUserById = useCallback(async (userId) => {
    try {
      const usersStr = await AsyncStorage.getItem(USERS_KEY);
      const users = usersStr ? JSON.parse(usersStr) : [];
      const foundUser = users.find(u => u.id === userId);
      
      if (foundUser) {
        return foundUser;
      }
      
      if (user && user.id === userId) {
        return user;
      }
      return null;
    } catch (e) {
      console.error('Failed to get user by id', e);
      return null;
    }
  }, [user]);

  const contextValue = useMemo(() => ({
    user,
    loading,
    posts,
    login,
    signUp,
    forgotPassword,
    logout,
    updateProfile,
    addPost,
    toggleLikePost,
    addCommentToPost,
    getUserById,
  }), [
    user,
    loading,
    posts,
    login,
    signUp,
    forgotPassword,
    logout,
    updateProfile,
    addPost,
    toggleLikePost,
    addCommentToPost,
    getUserById,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
