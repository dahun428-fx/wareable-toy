import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from './api';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
});

export async function signInWithGoogle() {
  if (Platform.OS === 'android') {
    await GoogleSignin.hasPlayServices();
  }
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken;

  if (!idToken) throw new Error('No ID token received');

  const { data } = await apiClient.post('/api/auth/google', { idToken });
  const { user, tokens } = data.data;

  await SecureStore.setItemAsync('accessToken', tokens.accessToken);
  await SecureStore.setItemAsync('refreshToken', tokens.refreshToken);

  return { user, tokens };
}

export async function signOut() {
  try {
    await apiClient.post('/api/auth/logout', {});
    await GoogleSignin.signOut();
  } catch {}
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
}
