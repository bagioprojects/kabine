import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Easing,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { useAuth } from '../context/AuthContext';
import Svg, { Path, G, Defs, LinearGradient as SvgLinearGradient, Stop, Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles } from '../styles/screens/AuthScreen.styles';

// Local assets
const bgVideo1 = require('../assets/videos/bg_video_1.mp4');
const fallbackBg = require('../assets/images/login_bg.webp');
// XML / XSS Prevention checker - defined at module level to avoid per-render recreation
const DANGEROUS_PATTERNS = [
  /\<\?xml/i, /\<!DOCTYPE/i, /\<!ENTITY/i, /\<!ELEMENT/i,
  /SYSTEM\s+['"]/i, /PUBLIC\s+['"]/i, /xmlns/i,
  /\<script/i, /javascript:/i, /\<\/?[a-z][a-z0-9]*[^>]*>/i
];
const containsXmlOrXss = (val: string): boolean =>
  DANGEROUS_PATTERNS.some(pattern => pattern.test(val));

export default function AuthScreen() {
  const { login, register, error, setError } = useAuth();
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width, height), [width, height]);
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [charName, setCharName] = useState<string>('');
  const [charSurname, setCharSurname] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const insets = useSafeAreaInsets();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const errorShakeAnim = useRef(new Animated.Value(0)).current;
  const logoSpinAnim = useRef(new Animated.Value(0)).current;
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Fade in layout
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Start perpetual logo rotation
    Animated.loop(
      Animated.timing(logoSpinAnim, {
        toValue: 1,
        duration: 25000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Configure Google Sign-In with Play Games Services Support
    // GEÇİCİ DURDURMA: Yeni yerel build (APK) alınana kadar "requiring unknown module" hatasını önlemek için pasifize edildi.
    /*
    try {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin');
      GoogleSignin.configure({
        scopes: ['https://www.googleapis.com/auth/games_lite'],
      });
    } catch (e) {
      console.log('GoogleSignin is not available in this client environment:', e);
    }
    */

    // Configure and play background music
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    }).catch(err => console.log('Audio mode config error:', err));

    const soundInstance = new Audio.Sound();
    soundRef.current = soundInstance;

    const playMusic = async () => {
      try {
        await soundInstance.loadAsync(
          require('../assets/audio/background_music.mp3'),
          { shouldPlay: true, isLooping: true, volume: 0.35 }
        );
      } catch (err) {
        console.log('Failed to load background music:', err);
      }
    };

    playMusic();

    return () => {
      soundInstance.stopAsync().catch(() => {});
      soundInstance.unloadAsync().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (error) {
      // Shake animation on error
      Animated.sequence([
        Animated.timing(errorShakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(errorShakeAnim, { toValue: -10, duration: 80, useNativeDriver: true }),
        Animated.timing(errorShakeAnim, { toValue: 10, duration: 80, useNativeDriver: true }),
        Animated.timing(errorShakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  const logoSpin = logoSpinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleSubmit = useCallback(async () => {
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password;

    if (containsXmlOrXss(cleanUsername) || containsXmlOrXss(cleanPassword) || containsXmlOrXss(charName) || containsXmlOrXss(charSurname) || containsXmlOrXss(phoneNumber)) {
      setError('Girdiğiniz bilgiler geçersiz karakterler veya güvenlik dışı kod ögeleri içermektedir.');
      return;
    }

    if (isLogin) {
      if (!cleanUsername || !cleanPassword) {
        setError('Kullanıcı adı ve şifrenizi giriniz.');
        return;
      }
      setLoading(true);
      const success = await login(cleanUsername, cleanPassword);
      setLoading(false);
    } else {
      const cleanCharName = charName.trim();
      const cleanCharSurname = charSurname.trim();

      if (!cleanUsername || !cleanPassword || !phoneNumber || !cleanCharName || !cleanCharSurname) {
        setError('Tüm kimlik alanlarının doldurulması zorunludur.');
        return;
      }

      const usernameRegex = /^[a-z0-9_-]{3,20}$/;
      if (!usernameRegex.test(cleanUsername)) {
        setError('Kullanıcı adı 3-20 karakter uzunluğunda olmalı ve yalnızca küçük harf, rakam, alt çizgi (_) veya tire (-) içermelidir.');
        return;
      }

      const nameRegex = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]{2,30}$/;
      if (!nameRegex.test(cleanCharName) || !nameRegex.test(cleanCharSurname)) {
        setError('Karakter adı ve soyadı yalnızca harflerden oluşmalı ve en az 2 karakter olmalıdır.');
        return;
      }

      if (cleanPassword.length < 6) {
        setError('Şifreniz en az 6 karakter uzunluğunda olmalıdır.');
        return;
      }

      if (phoneNumber.length !== 10) {
        setError('Lütfen geçerli bir telefon numarası giriniz (telefon alanı tam olarak 10 haneli olmalıdır).');
        return;
      }

      setLoading(true);
      const success = await register({
        username: cleanUsername,
        password: cleanPassword,
        phoneNumber: '+90' + phoneNumber,
        characterName: cleanCharName,
        characterSurname: cleanCharSurname,
      });
      setLoading(false);
    }
  }, [username, password, charName, charSurname, phoneNumber, isLogin, login, register, setError]);

  const handleGooglePlayLogin = useCallback(async () => {
    setError(null);
    setError('Google Play Oyunlar ile Giriş özelliği için yeni mobil APK/Build yüklenmelidir.');
    /*
    try {
      let googleSigninModule;
      try {
        googleSigninModule = require('@react-native-google-signin/google-signin');
      } catch (e) {
        setError('Google Play Oyunlar bu istemcide (Expo Go) desteklenmiyor. Lütfen yerel APK kullanın.');
        return;
      }
      const { GoogleSignin } = googleSigninModule;
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      setLoading(true);
      const userInfo = await GoogleSignin.signIn();
      setLoading(false);
      if (userInfo && userInfo.user) {
        setError(`Google Play: Hoş geldin ${userInfo.user.name || 'Oyuncu'}!`);
      }
    } catch (err: any) {
      setLoading(false);
      console.log('Google Play Games Error:', err);
      if (err.code === '12501' || err.code === 'SIGN_IN_CANCELLED') {
        setError('Oturum açma iptal edildi.');
      } else {
        setError('Google Play Oyunlar ile oturum açılamadı.');
      }
    }
    */
  }, [setError]);

  return (
    <View style={styles.container}>
      {/* Background Media Container (Sends all background elements behind and prevents touch interception) */}
      <View style={styles.background as any} pointerEvents="none">
        {/* Background Poster fallback */}
        <Image
          source={fallbackBg}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />

        {/* Background Video (Natively looping, hardware-accelerated, never freezes) */}
        <Video
          source={bgVideo1}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
        />
      </View>

      {/* Spotlight overlay mask */}
      <View style={styles.spotlightOverlay} pointerEvents="none" />

      {/* Tactical Radar Lines Overlay */}
      <View style={styles.radarOverlay} pointerEvents="none">
        <View style={styles.radarLine} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContainer,
            {
              paddingTop: Math.max(insets.top + 20, 40),
              paddingBottom: Math.max(insets.bottom + 20, 40),
            }
          ]} 
          bounces={false}
          overScrollMode="never"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
            
            {/* Spinning tactical radar compass Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoEmblemContainer}>
                {/* Rotating layer */}
                <Animated.View style={[styles.logoLayerAbsolute, { transform: [{ rotate: logoSpin }] }]}>
                  <Svg width={85} height={85} viewBox="0 0 100 100">
                    <Defs>
                      <SvgLinearGradient id="gold-metal-spin" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#fffbeb" />
                        <Stop offset="25%" stopColor="#fbbf24" />
                        <Stop offset="50%" stopColor="#d97706" />
                        <Stop offset="75%" stopColor="#f59e0b" />
                        <Stop offset="100%" stopColor="#b45309" />
                      </SvgLinearGradient>
                    </Defs>
                    <Circle cx="50" cy="50" r="46" fill="none" stroke="url(#gold-metal-spin)" strokeWidth="1.2" strokeDasharray="8 4" />
                    <Circle cx="50" cy="50" r="42" fill="none" stroke="url(#gold-metal-spin)" strokeWidth="1" strokeDasharray="30 8" opacity={0.6} />
                  </Svg>
                </Animated.View>
                {/* Static layer */}
                <View style={styles.logoLayerAbsolute}>
                  <Svg width={85} height={85} viewBox="0 0 100 100">
                    <Defs>
                      <SvgLinearGradient id="gold-metal-static" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#fffbeb" />
                        <Stop offset="25%" stopColor="#fbbf24" />
                        <Stop offset="50%" stopColor="#d97706" />
                        <Stop offset="75%" stopColor="#f59e0b" />
                        <Stop offset="100%" stopColor="#b45309" />
                      </SvgLinearGradient>
                      <SvgLinearGradient id="shield-crimson" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor="#dc2626" />
                        <Stop offset="100%" stopColor="#450a0a" />
                      </SvgLinearGradient>
                    </Defs>
                    <Path d="M50,2 L50,8 M50,92 L50,98 M2,50 L8,50 M92,50 L98,50" stroke="url(#gold-metal-static)" strokeWidth="1.5" />
                    <Path d="M30 32 L50 25 L70 32 L70 56 C70 68 50 78 50 78 C50 78 30 68 30 56 Z" fill="url(#shield-crimson)" stroke="url(#gold-metal-static)" strokeWidth="2.5" strokeLinejoin="round" />
                    <G transform="translate(38, 38) scale(0.24)">
                      <Path d="M 50 0 A 50 50 0 1 0 100 50 A 40 40 0 1 1 50 10 Z" fill="url(#gold-metal-static)" />
                      <Path d="M 110 20 L 115 35 L 130 35 L 118 45 L 122 60 L 110 50 L 98 60 L 102 45 L 90 35 L 105 35 Z" fill="url(#gold-metal-static)" />
                    </G>
                  </Svg>
                </View>
              </View>
              
              <Text style={styles.logoTitle}>KABİNE</Text>
              <View style={styles.logoBorder} />
              <Text style={styles.logoSubtitle}>SİYASET • EKONOMİ • JEOSTRATEJİ</Text>
            </View>

            {/* Tabs (Matching web glass design) */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, isLogin && styles.activeTabButton]}
                onPress={() => { setIsLogin(true); setError(null); }}
              >
                <Text style={[styles.tabText, isLogin && styles.activeTabText]}>GİRİŞ YAP</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, !isLogin && styles.activeTabButton]}
                onPress={() => { setIsLogin(false); setError(null); }}
              >
                <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>KAYIT OL</Text>
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {error && (
              <Animated.View style={[styles.errorContainer, { transform: [{ translateX: errorShakeAnim }] }]}>
                <Text style={styles.errorText}>⚠️ {error}</Text>
              </Animated.View>
            )}

            {/* Username Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>KULLANICI ADI</Text>
              <TextInput
                style={styles.input}
                placeholder="Kullanıcı Adınız"
                placeholderTextColor="rgba(255, 255, 255, 0.45)"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="off"
                importantForAutofill="no"
                textContentType="none"
              />
            </View>

            {/* Registration specific fields */}
            {!isLogin && (
              <>
                {/* Fixed +90 Phone input */}
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>TELEFON NUMARASI</Text>
                  <View style={styles.phoneInputContainer}>
                    <View style={styles.phonePrefix}>
                      <Text style={styles.phonePrefixText}>+90</Text>
                    </View>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="5XX XXX XX XX"
                      placeholderTextColor="rgba(255, 255, 255, 0.45)"
                      keyboardType="numeric"
                      value={phoneNumber}
                      onChangeText={(text) => {
                        const clean = text.replace(/\D/g, '').slice(0, 10);
                        setPhoneNumber(clean);
                      }}
                    />
                  </View>
                </View>

                {/* Character Name & Surname */}
                <View style={styles.rowInputs}>
                  <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>KARAKTER ADI</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Karakter Adınız"
                      placeholderTextColor="rgba(255, 255, 255, 0.45)"
                      value={charName}
                      onChangeText={setCharName}
                    />
                  </View>
                  <View style={[styles.inputWrapper, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>KARAKTER SOYADI</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Karakter Soyadınız"
                      placeholderTextColor="rgba(255, 255, 255, 0.45)"
                      value={charSurname}
                      onChangeText={setCharSurname}
                    />
                  </View>
                </View>
              </>
            )}

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>ŞİFRE</Text>
              <TextInput
                style={styles.input}
                placeholder="Şifreniz"
                placeholderTextColor="rgba(255, 255, 255, 0.45)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoComplete="off"
                importantForAutofill="no"
                textContentType="none"
              />
            </View>

            {/* Submit Button (Matching Crimson style of Web Client) */}
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>{isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}</Text>
              )}
            </TouchableOpacity>

            {/* Social Logins (Google & Apple) */}
            {isLogin && (
              <View style={styles.socialContainer}>
                <View style={styles.socialDividerContainer}>
                  <View style={styles.socialLine} />
                  <Text style={styles.socialDividerText}>HIZLI GİRİŞ SEÇENEKLERİ</Text>
                  <View style={styles.socialLine} />
                </View>
                <View style={styles.socialButtonsRow}>
                  {/* Google Login */}
                  <TouchableOpacity 
                    style={styles.socialButton} 
                    activeOpacity={0.7} 
                    onPress={handleGooglePlayLogin}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24">
                      <Path
                        fill="#fbbf24"
                        d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.887H12.24z"
                      />
                    </Svg>
                  </TouchableOpacity>
                  {/* Apple Login */}
                  <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                    <Svg width={20} height={20} viewBox="0 0 24 24">
                      <Path
                        fill="#fbbf24"
                        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.09.09 2.22-.58 2.94-1.39z"
                      />
                    </Svg>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Copyright/Branding Footer */}
            <Text style={styles.footerText}>© 2026 BAGIO LABS • KABİNE SÜRÜM 1.1</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}


