import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './axiosClient';

let socket: Socket | null = null;

export const getSocket = async (): Promise<Socket> => {
  if (socket) return socket;

  const token = await AsyncStorage.getItem('politic_token');
  
  socket = io(BASE_URL, {
    autoConnect: false,
    auth: {
      token: token,
    },
    transports: ['websocket'], // force websocket for mobile speed
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
