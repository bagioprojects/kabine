import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';

interface User {
  id: string;
  username: string;
  phoneNumber: string;
  characterName: string;
  characterSurname: string;
  cash: number;
  bankCheckingBalance: number;
  bankSavingsBalance: number;
  politicalInfluence: number;
  politicalReputation: number;
  politicalRole: string;
  isCharacterCreated: boolean;
  health: number;
  hunger: number;
  thirst: number;
  energy: number;
  happiness: number;
  currentProvinceId: number | null;
  currentDistrictId: number | null;
  citizenId?: string | null;
  characterCreationStep?: number;
  gender?: 'male' | 'female' | null;
  characterAge?: number | null;
  politicalIdeologyId?: number | null;
  citizenshipProvinceId?: number | null;
  citizenshipDistrictId?: number | null;
  backstoryId?: string | null;
  isometricModelId?: string | null;
  birthDate?: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (payload: {
    username: string;
    password: string;
    phoneNumber: string;
    characterName: string;
    characterSurname: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setError: (msg: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check login status on mount
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('politic_token');
      if (token) {
        await fetchUserProfile();
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error reading token', err);
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axiosClient.get('/users/me');
      if (response.data && response.data.success) {
        setUser(response.data.data);
        setIsAuthenticated(true);
      } else {
        await logout();
      }
    } catch (err: any) {
      console.warn('Profile fetch failed, logging out.', err.message);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await axiosClient.get('/users/me');
      if (response.data && response.data.success) {
        setUser(response.data.data);
      }
    } catch (err) {
      console.error('Failed to refresh user profile', err);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const response = await axiosClient.post('/users/login', { username, password });
      if (response.data && response.data.success) {
        const { token, user: loggedUser } = response.data.data;
        await AsyncStorage.setItem('politic_token', token);
        setUser(loggedUser);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Giriş yapılamadı. Kullanıcı adı veya şifre hatalı.';
      setError(msg);
      return false;
    }
  };

  const register = async (payload: {
    username: string;
    password: string;
    phoneNumber: string;
    characterName: string;
    characterSurname: string;
  }): Promise<boolean> => {
    setError(null);
    try {
      const response = await axiosClient.post('/users/register', payload);
      if (response.data && response.data.success) {
        const { token, user: registeredUser } = response.data.data;
        await AsyncStorage.setItem('politic_token', token);
        setUser(registeredUser);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Kayıt başarısız oldu.';
      setError(msg);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('politic_token');
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Error logging out', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
