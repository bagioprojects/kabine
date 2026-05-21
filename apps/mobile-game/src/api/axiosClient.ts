import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

// Geliştirici makinesinin IP'sini dinamik çözmek için Constants.expoConfig?.hostUri kullanalım.
let localIp = '192.168.1.174'; // fallback IP address
const hostUri = Constants.expoConfig?.hostUri;
if (hostUri) {
  const ip = hostUri.split(':')[0];
  if (ip) {
    localIp = ip;
  }
}

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${localIp}:3000`;
export const API_BASE = `${BASE_URL}/api/v1`;

const axiosClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to attach the JWT token
axiosClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('politic_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from AsyncStorage', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;
