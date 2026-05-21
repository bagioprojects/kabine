import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  useWindowDimensions,
  StyleSheet,
  Modal,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { DISTRICTS } from '../data/locationData';
import Svg, { Path, Circle, Ellipse, Rect, Line, Polygon } from 'react-native-svg';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyles } from '../styles/screens/CharacterCreationScreen.styles';

// Local assets
const bgVideo1 = require('../assets/videos/bg_video_1.mp4');
const fallbackBg = require('../assets/images/simulation_bg.webp');
const maleAvatar3D = require('../assets/images/male_avatar_3d.png');
const femaleAvatar3D = require('../assets/images/female_avatar_3d.png');

const STARTING_PROVINCES = [
  { id: 34, name: 'İstanbul Cumhuriyeti', description: 'Finans ve Küreselleşmiş Ticaret Devleti' },
  { id: 6, name: 'Ankara Cumhuriyeti', description: 'Başkent ve Siyasi Bürokrasi Devleti' },
  { id: 16, name: 'Bursa Cumhuriyeti', description: 'Ağır Sanayi ve Otomotiv Havzası Devleti' },
  { id: 10, name: 'Balıkesir Cumhuriyeti', description: 'Maden Kaynakları ve Stratejik Bor Devleti' },
  { id: 35, name: 'İzmir Cumhuriyeti', description: 'Serbest Liman ve Ege Deniz Ticareti Devleti' },
  { id: 7, name: 'Antalya Cumhuriyeti', description: 'Küresel Turizm ve Akdeniz Tarım Devleti' },
  { id: 31, name: 'Hatay Cumhuriyeti', description: 'Tarihi Lojistik ve Güney Kapısı Devleti' },
  { id: 61, name: 'Trabzon Cumhuriyeti', description: 'Deniz Ticareti ve Karadeniz Tersane Devleti' },
  { id: 42, name: 'Konya Cumhuriyeti', description: 'Tarım Havzası ve Hafif Alüminyum Metal Devleti' },
  { id: 1, name: 'Adana Cumhuriyeti', description: 'Bereketli Çukurova ve Sanayi Devleti' },
  { id: 41, name: 'Kocaeli Cumhuriyeti', description: 'Liman Ağları ve Kimya Sanayi Devleti' }
];

const ISOMETRIC_MODELS = [
  {
    id: 'char_diplomat_male',
    name: 'Diplomat / Politikacı (Erkek)',
    gender: 'male',
    description: 'Zarif bir takım elbise, rozet ve karizma. Siyasi entrikalarda ve ikna yeteneğinde üstündür.',
    color: '#06b6d4',
    svg: (color: string) => (
      <Svg viewBox="0 0 100 120" style={{ width: 100, height: 120 }}>
        {/* Ground shadow */}
        <Ellipse cx={50} cy={109} rx={26} ry={7} fill="rgba(0,0,0,0.35)" />
        {/* Left oxford shoe */}
        <Path d="M 32 101 L 47 101 L 48 106 L 31 106 Z" fill="#0f0f14" />
        <Rect x={43} y={98} width={4} height={5} rx={1} fill="#1a1a24" />
        {/* Right oxford shoe */}
        <Path d="M 53 101 L 68 101 L 69 106 L 52 106 Z" fill="#0f0f14" />
        <Rect x={53} y={98} width={4} height={5} rx={1} fill="#1a1a24" />
        {/* Left trouser leg */}
        <Rect x={40} y={80} width={9} height={20} rx={2} fill="#1b1c22" />
        {/* Right trouser leg */}
        <Rect x={51} y={80} width={9} height={20} rx={2} fill="#1b1c22" />
        
        {/* Suit jacket body with sloping shoulders (base layer) */}
        <Path d="M 35 48 L 45 44 L 55 44 L 65 48 L 60 80 L 40 80 Z" fill="#2d303b" />
        
        {/* LEFT ARM - rounded seamless shoulder pad connection drawn on top of body */}
        <Path d="M 35 48 C 32 48 28 49 27 52 L 22 74 L 31 74 Z" fill="#2d303b" />
        {/* Left white cuff */}
        <Rect x={22} y={73} width={11} height={4} rx={1} fill="#f8fafc" />
        {/* Left hand */}
        <Ellipse cx={27} cy={80} rx={5} ry={3} fill="#e2b49a" />
        
        {/* RIGHT SLEEVE - rounded seamless shoulder pad connection drawn on top of body */}
        <Path d="M 65 48 C 68 48 72 49 73 52 L 78 74 L 69 74 Z" fill="#2d303b" />
        {/* Right white cuff */}
        <Rect x={67} y={73} width={11} height={4} rx={1} fill="#f8fafc" />
        {/* Right hand */}
        <Ellipse cx={73} cy={80} rx={5} ry={3} fill="#e2b49a" />
        
        {/* White shirt */}
        <Path d="M 45 44 L 50 58 L 55 44 Z" fill="#f8fafc" />
        {/* Red tie */}
        <Path d="M 49 47 L 51 47 L 52 70 L 50 75 L 48 70 Z" fill="#991b1b" />
        {/* Left lapel */}
        <Path d="M 35 48 L 45 44 L 48 65 Z" fill="#1e293b" />
        {/* Right lapel */}
        <Path d="M 65 48 L 55 44 L 52 65 Z" fill="#1e293b" />
        {/* Gold badge/pin */}
        <Polygon points="58,54 61,54 62,57 59,59 57,56" fill="#fbbf24" />
        {/* Neck */}
        <Rect x={47} y={38} width={6} height={8} fill="#e2b49a" />
        {/* Head */}
        <Circle cx={50} cy={30} r={12} fill="#e2b49a" />
        {/* Hair */}
        <Path d="M 38 27 Q 45 15 62 27 C 62 27 50 18 38 27 Z" fill="#171717" />
        <Path d="M 42 22 Q 50 14 58 22 Z" fill="#404040" />

        {/* Glasses - fixed gray */}
        <Rect x={42} y={27} width={7} height={4} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
        <Rect x={51} y={27} width={7} height={4} fill="none" stroke="#94a3b8" strokeWidth={1.5} />
        <Line x1={49} y1={29} x2={51} y2={29} stroke="#94a3b8" strokeWidth={1.5} />
        
        {/* MALE FACIAL DETAILS - EYES, NOSE, MOUTH */}
        <Ellipse cx={45} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        <Ellipse cx={55} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        {/* Eyebrows */}
        <Path d="M 42 25 Q 45 24 48 26" fill="none" stroke="#171717" strokeWidth={1} />
        <Path d="M 58 25 Q 55 24 52 26" fill="none" stroke="#171717" strokeWidth={1} />
        {/* Shaded nose */}
        <Path d="M 50 29 L 51.5 32 L 49.5 32" fill="none" stroke="#b8866d" strokeWidth={1.2} strokeLinecap="round" />
        {/* Friendly smile */}
        <Path d="M 47 35 Q 50 37 53 35" fill="none" stroke="#9e664c" strokeWidth={1.3} strokeLinecap="round" />
      </Svg>
    )
  },
  {
    id: 'char_diplomat_female',
    name: 'Diplomat / Politikacı (Kadın)',
    gender: 'female',
    description: 'Zarif bir takım elbise, rozet ve asalet. Hitabeti ve diploması becerileriyle öne çıkar.',
    color: '#06b6d4',
    svg: (color: string) => (
      <Svg viewBox="0 0 100 120" style={{ width: 100, height: 120 }}>
        {/* Ground shadow - shifted up */}
        <Ellipse cx={50} cy={102} rx={26} ry={7} fill="rgba(0,0,0,0.35)" />

        {/* Left high-heel shoe - shifted up */}
        <Rect x={38} y={94} width={2.5} height={6} rx={0.5} fill="#111111" />
        <Path d="M 34 93 L 43 93 L 45 99 L 33 99 Z" fill="#1a1a1a" />
        {/* Right high-heel shoe - shifted up */}
        <Rect x={60} y={94} width={2.5} height={6} rx={0.5} fill="#111111" />
        <Path d="M 57 93 L 66 93 L 68 99 L 56 99 Z" fill="#1a1a1a" />

        {/* Elegant Feminine Tapered Trousers */}
        {/* Left leg */}
        <Path d="M 42 64 C 38 72 38 88 39 94 L 44 94 C 45 88 46 72 49 64 Z" fill="#1b1c22" />
        {/* Right leg */}
        <Path d="M 51 64 C 54 72 55 88 56 94 L 61 94 C 62 88 62 72 58 64 Z" fill="#1b1c22" />
        {/* Shadow gap between thighs */}
        <Path d="M 48 64 L 52 64 L 50 78 Z" fill="rgba(0,0,0,0.35)" />
        {/* Crotch seam shadow */}
        <Path d="M 47 64 C 49 68 51 68 53 64" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={1.5} />

        {/* UNIFIED SUIT BLAZER & SLEEVES - Navy Diplomat Suit */}
        <Path d="M 25 72 L 30 52 C 31 49 35 47 39 47 L 47 43 L 53 43 L 61 47 C 65 47 69 49 70 52 L 75 72 L 68 72 L 65 62 L 58 64 L 42 64 L 35 62 L 25 72 Z" fill="#1e3a8a" />

        {/* Armpit and sleeve definition shadows */}
        <Path d="M 39 47 C 36 50 34 56 35 62" fill="none" stroke="#172554" strokeWidth={1.5} />
        <Path d="M 61 47 C 64 50 66 56 65 62" fill="none" stroke="#172554" strokeWidth={1.5} />

        {/* Left white cuff */}
        <Rect x={24} y={71} width={9} height={3} rx={1} fill="#f8fafc" />
        {/* Left hand */}
        <Ellipse cx={28} cy={76} rx={4} ry={2.5} fill="#fbcfe8" />

        {/* Right white cuff */}
        <Rect x={67} y={71} width={9} height={3} rx={1} fill="#f8fafc" />
        {/* Right hand */}
        <Ellipse cx={72} cy={76} rx={4} ry={2.5} fill="#fbcfe8" />
        {/* Left and Right bust curves */}
        <Circle cx={46} cy={54} r={5} fill="#1e3a8a" />
        <Circle cx={54} cy={54} r={5} fill="#1e3a8a" />
        {/* Underbust shadow lines */}
        <Path d="M 41 55 C 44 59 47 59 49 55 C 51 59 54 59 57 55" fill="none" stroke="#172554" strokeWidth={1.8} />
        {/* Chest highlight curves */}
        <Path d="M 43 51 C 45 53 47 53 48 50" fill="none" stroke="#3b82f6" strokeWidth={1.2} />
        <Path d="M 57 51 C 55 53 53 53 52 50" fill="none" stroke="#3b82f6" strokeWidth={1.2} />

        {/* White shirt collar inside V neckline */}
        <Path d="M 46 44 L 50 51 L 54 44 Z" fill="#f8fafc" />
        {/* Red/gold tie/necklace */}
        <Path d="M 49 47 L 51 47 L 52 51 L 50 53 L 48 51 Z" fill="#991b1b" />
        
        {/* Gold badge/pin */}
        <Polygon points="57,51 59,51 60,53 58,54 57,53" fill="#fbbf24" />

        {/* Neck */}
        <Rect x={47} y={37} width={6} height={8} fill="#fbcfe8" />
        {/* Head */}
        <Circle cx={50} cy={29} r={11} fill="#fbcfe8" />

        {/* BEAUTIFUL GOLDEN YELLOW HAIR */}
        {/* Bun detail */}
        <Circle cx={50} cy={11} r={4.5} fill="#d97706" />
        <Circle cx={50} cy={11} r={2.5} fill="#fbbf24" />
        {/* Hair base and wrap */}
        <Path d="M 35 29 C 35 15 65 15 65 29 C 65 37 63 43 61 43 C 58 40 60 33 60 29 C 60 24 40 24 40 29 C 40 33 42 40 39 43 C 37 43 35 37 35 29 Z" fill="#d97706" />
        {/* Hair front volume and bangs contour */}
        <Path d="M 36 24 C 36 12 64 12 64 24 C 60 24 56 22 50 22 C 44 22 40 24 36 24 Z" fill="#fbbf24" />
        {/* Side locks */}
        <Path d="M 36 24 L 38 24 L 39 34 L 36 34 Z" fill="#fbbf24" />
        <Path d="M 64 24 L 62 24 L 61 34 L 64 34 Z" fill="#fbbf24" />
        {/* Top shine highlight */}
        <Path d="M 42 19 Q 50 14 58 19 Q 50 17 42 19 Z" fill="#fef08a" />

        {/* GLASSES - custom color */}
        <Rect x={40} y={26} width={8} height={5} rx={2} fill="none" stroke={color} strokeWidth={1.5} />
        <Rect x={52} y={26} width={8} height={5} rx={2} fill="none" stroke={color} strokeWidth={1.5} />
        <Line x1={48} y1={28.5} x2={52} y2={28.5} stroke={color} strokeWidth={1.5} />
        
        {/* FEMALE FACIAL DETAILS - EYES, NOSE, MOUTH */}
        <Ellipse cx={44} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        <Ellipse cx={56} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        {/* Eyebrows */}
        <Path d="M 41 25 Q 44 24 47 26" fill="none" stroke="#582007" strokeWidth={0.8} />
        <Path d="M 59 25 Q 56 24 53 26" fill="none" stroke="#582007" strokeWidth={0.8} />
        {/* Shaded nose */}
        <Path d="M 50 29 L 51.5 32 L 49.5 32" fill="none" stroke="#b8866d" strokeWidth={1.2} strokeLinecap="round" />
        {/* Red lips smile */}
        <Path d="M 47 35 C 48 37 52 37 53 35" fill="none" stroke="#be123c" strokeWidth={1.3} strokeLinecap="round" />
      </Svg>
    )
  },
  {
    id: 'char_soldier_male',
    name: 'Asker / Garnizon Subayı (Erkek)',
    gender: 'male',
    description: 'Resmi garnizon üniforması, askeri madalyalar ve çelik gibi duruş. Güvenlik ve savunmada etkilidir.',
    color: '#ef4444',
    svg: () => (
      <Svg viewBox="0 0 100 120" style={{ width: 100, height: 120 }}>
        <Ellipse cx={50} cy={105} rx={30} ry={10} fill="rgba(0,0,0,0.3)" />
        <Path d="M 39 80 L 37 100 L 44 100 L 47 84 L 53 84 L 56 100 L 63 100 L 61 80 Z" fill="#1b241d" />
        <Path d="M 35 100 L 44 100 L 43 104 L 34 104 Z" fill="#090d0a" />
        <Path d="M 56 100 L 65 100 L 66 104 L 57 104 Z" fill="#090d0a" />
        <Path d="M 34 45 L 66 45 L 61 80 L 39 80 Z" fill="#2d3a2e" />
        <Rect x={30} y={42} width={10} height={4} rx={1} fill="#d97706" />
        <Rect x={60} y={42} width={10} height={4} rx={1} fill="#d97706" />
        <Rect x={38} y={72} width={24} height={6} fill="#451a03" />
        <Rect x={49} y={71} width={6} height={8} fill="#fbbf24" stroke="#451a03" strokeWidth={1} />
        <Rect x={47} y={38} width={6} height={8} fill="#e2b49a" />
        <Circle cx={50} cy={30} r={12} fill="#e2b49a" />
        <Path d="M 37 22 Q 50 14 63 22 L 61 25 L 39 25 Z" fill="#1b241d" />
        <Path d="M 37 22 L 63 22" stroke="#d97706" strokeWidth={2} />
        <Path d="M 43 25 Q 50 30 57 25" fill="#090d0a" />
        <Polygon points="46,42 48,42 47,46" fill="#991b1b" />
        <Polygon points="54,42 52,42 53,46" fill="#991b1b" />
        
        {/* MALE FACIAL DETAILS - EYES, NOSE, MOUTH */}
        <Ellipse cx={45} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        <Ellipse cx={55} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        {/* Eyebrows */}
        <Path d="M 42 25 Q 45 24 48 26" fill="none" stroke="#171717" strokeWidth={1} />
        <Path d="M 58 25 Q 55 24 52 26" fill="none" stroke="#171717" strokeWidth={1} />
        {/* Shaded nose */}
        <Path d="M 50 29 L 51.5 32 L 49.5 32" fill="none" stroke="#b8866d" strokeWidth={1.2} strokeLinecap="round" />
        {/* Friendly smile */}
        <Path d="M 47 35 Q 50 37 53 35" fill="none" stroke="#9e664c" strokeWidth={1.3} strokeLinecap="round" />
      </Svg>
    )
  },
  {
    id: 'char_soldier_female',
    name: 'Asker / Garnizon Subayı (Kadın)',
    gender: 'female',
    description: 'Zarif askeri üniforma, disiplinli duruş ve toplu saçlar. Taktik zeka ve operasyonel başarıda liderdir.',
    color: '#ef4444',
    svg: () => (
      <Svg viewBox="0 0 100 120" style={{ width: 100, height: 120 }}>
        {/* Ground shadow - shifted up */}
        <Ellipse cx={50} cy={102} rx={26} ry={7} fill="rgba(0,0,0,0.35)" />

        {/* Left high-heel shoe - shifted up */}
        <Rect x={38} y={94} width={2.5} height={6} rx={0.5} fill="#111111" />
        <Path d="M 34 93 L 43 93 L 45 99 L 33 99 Z" fill="#090d0a" />
        {/* Right high-heel shoe - shifted up */}
        <Rect x={60} y={94} width={2.5} height={6} rx={0.5} fill="#111111" />
        <Path d="M 57 93 L 66 93 L 68 99 L 56 99 Z" fill="#090d0a" />

        {/* Elegant Feminine Tapered Trousers - Military Olive Green */}
        {/* Left leg */}
        <Path d="M 42 64 C 38 72 38 88 39 94 L 44 94 C 45 88 46 72 49 64 Z" fill="#1b241d" />
        {/* Right leg */}
        <Path d="M 51 64 C 54 72 55 88 56 94 L 61 94 C 62 88 62 72 58 64 Z" fill="#1b241d" />
        {/* Shadow gap between thighs */}
        <Path d="M 48 64 L 52 64 L 50 78 Z" fill="rgba(0,0,0,0.35)" />

        {/* UNIFIED MILITARY BLAZER - Dark Green */}
        <Path d="M 25 72 L 30 52 C 31 49 35 47 39 47 L 47 43 L 53 43 L 61 47 C 65 47 69 49 70 52 L 75 72 L 68 72 L 65 62 L 58 64 L 42 64 L 35 62 L 25 72 Z" fill="#14532d" />

        {/* Epaulets (Gold) */}
        <Rect x={28} y={45} width={9} height={3} rx={1} fill="#d97706" />
        <Rect x={63} y={45} width={9} height={3} rx={1} fill="#d97706" />

        {/* Armpit and sleeve definition shadows */}
        <Path d="M 39 47 C 36 50 34 56 35 62" fill="none" stroke="#052e16" strokeWidth={1.5} />
        <Path d="M 61 47 C 64 50 66 56 65 62" fill="none" stroke="#052e16" strokeWidth={1.5} />

        {/* Left white cuff */}
        <Rect x={24} y={71} width={9} height={3} rx={1} fill="#f8fafc" />
        {/* Left hand */}
        <Ellipse cx={28} cy={76} rx={4} ry={2.5} fill="#fbcfe8" />

        {/* Right white cuff */}
        <Rect x={67} y={71} width={9} height={3} rx={1} fill="#f8fafc" />
        {/* Right hand */}
        <Ellipse cx={72} cy={76} rx={4} ry={2.5} fill="#fbcfe8" />
        {/* Left and Right bust curves */}
        <Circle cx={46} cy={54} r={5} fill="#14532d" />
        <Circle cx={54} cy={54} r={5} fill="#14532d" />
        {/* Underbust shadow lines */}
        <Path d="M 41 55 C 44 59 47 59 49 55 C 51 59 54 59 57 55" fill="none" stroke="#052e16" strokeWidth={1.8} />

        {/* Collar and tie details */}
        <Path d="M 46 44 L 50 51 L 54 44 Z" fill="#1b241d" />
        {/* Gold medal ribbon */}
        <Polygon points="44,51 47,51 48,55 45,55" fill="#991b1b" />
        <Polygon points="53,51 56,51 55,55 52,55" fill="#d97706" />

        {/* Neck */}
        <Rect x={47} y={37} width={6} height={8} fill="#fbcfe8" />
        {/* Head */}
        <Circle cx={50} cy={29} r={11} fill="#fbcfe8" />

        {/* BEAUTIFUL GOLDEN YELLOW HAIR WITH MILITARY SUB-CAP OR BUN */}
        {/* Bun detail */}
        <Circle cx={50} cy={11} r={4.5} fill="#d97706" />
        <Circle cx={50} cy={11} r={2.5} fill="#fbbf24" />
        {/* Hair wrap */}
        <Path d="M 35 29 C 35 15 65 15 65 29 C 65 37 63 43 61 43 C 58 40 60 33 60 29 C 60 24 40 24 40 29 C 40 33 42 40 39 43 C 37 43 35 37 35 29 Z" fill="#d97706" />
        {/* Military Officer Hat */}
        <Path d="M 38 21 Q 50 13 62 21 L 60 25 L 40 25 Z" fill="#1b241d" />
        <Path d="M 38 21 L 62 21" stroke="#d97706" strokeWidth={1.5} />
        {/* Hair bangs appearing beneath the cap visor */}
        <Path d="M 40 25 Q 50 30 60 25" fill="#fbbf24" />
        {/* Side locks */}
        <Path d="M 36 24 L 38 24 L 39 31 L 36 31 Z" fill="#fbbf24" />
        <Path d="M 64 24 L 62 24 L 61 31 L 64 31 Z" fill="#fbbf24" />

        {/* FEMALE FACIAL DETAILS - EYES, NOSE, MOUTH */}
        <Ellipse cx={44} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        <Ellipse cx={56} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        {/* Eyebrows */}
        <Path d="M 41 25 Q 44 24 47 26" fill="none" stroke="#582007" strokeWidth={0.8} />
        <Path d="M 59 25 Q 56 24 53 26" fill="none" stroke="#582007" strokeWidth={0.8} />
        {/* Shaded nose */}
        <Path d="M 50 29 L 51.5 32 L 49.5 32" fill="none" stroke="#b8866d" strokeWidth={1.2} strokeLinecap="round" />
        {/* Red lips smile */}
        <Path d="M 47 35 C 48 37 52 37 53 35" fill="none" stroke="#be123c" strokeWidth={1.3} strokeLinecap="round" />
      </Svg>
    )
  },
  {
    id: 'char_industrialist_male',
    name: 'Sanayici / Baron (Erkek)',
    gender: 'male',
    description: 'Zengin kürk yaka ceket, ağır maden kösteği ve altın saat zinciri. Ağır sanayi ve lojistikte liderdir.',
    color: '#f59e0b',
    svg: () => (
      <Svg viewBox="0 0 100 120" style={{ width: 100, height: 120 }}>
        <Ellipse cx={50} cy={105} rx={30} ry={10} fill="rgba(0,0,0,0.3)" />
        <Path d="M 40 80 L 40 100 L 46 100 L 48 85 L 52 85 L 54 100 L 60 100 L 60 80 Z" fill="#2d1500" />
        <Path d="M 32 45 L 68 45 L 61 80 L 39 80 Z" fill="#1c0f05" />
        <Path d="M 32 45 C 32 45 42 35 50 48 C 58 35 68 45 68 45 C 68 45 55 58 50 52 C 45 58 32 45 32 45 Z" fill="#7c2d12" />
        <Path d="M 43 65 Q 48 72 52 65" stroke="#fbbf24" strokeWidth={2} fill="none" />
        <Rect x={47} y={38} width={6} height={8} fill="#dfab8f" />
        <Circle cx={50} cy={30} r={12} fill="#dfab8f" />
        <Path d="M 38 22 C 38 10 62 10 62 22 Z" fill="#1c0f05" />
        <Ellipse cx={50} cy={22} rx={16} ry={3} fill="#1c0f05" />
        <Path d="M 40 32 Q 50 42 60 32 L 56 36 Q 50 43 44 36 Z" fill="#3f1a05" />

        {/* MALE FACIAL DETAILS - EYES, NOSE, MOUTH */}
        <Ellipse cx={45} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        <Ellipse cx={55} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        {/* Eyebrows */}
        <Path d="M 42 25 Q 45 24 48 26" fill="none" stroke="#171717" strokeWidth={1} />
        <Path d="M 58 25 Q 55 24 52 26" fill="none" stroke="#171717" strokeWidth={1} />
        {/* Shaded nose */}
        <Path d="M 50 29 L 51.5 32 L 49.5 32" fill="none" stroke="#b8866d" strokeWidth={1.2} strokeLinecap="round" />
        {/* Friendly smile */}
        <Path d="M 47 35 Q 50 37 53 35" fill="none" stroke="#9e664c" strokeWidth={1.3} strokeLinecap="round" />
      </Svg>
    )
  },
  {
    id: 'char_industrialist_female',
    name: 'Sanayici / Baron (Kadın)',
    gender: 'female',
    description: 'Zarif kadife ceket, altın küpeler ve lüks görünümlü kürk etol. Finans ve sanayi yatırımlarında uzmandır.',
    color: '#f59e0b',
    svg: () => (
      <Svg viewBox="0 0 100 120" style={{ width: 100, height: 120 }}>
        {/* Ground shadow - shifted up */}
        <Ellipse cx={50} cy={102} rx={26} ry={7} fill="rgba(0,0,0,0.35)" />

        {/* Left high-heel shoe - shifted up */}
        <Rect x={38} y={94} width={2.5} height={6} rx={0.5} fill="#111111" />
        <Path d="M 34 93 L 43 93 L 45 99 L 33 99 Z" fill="#1a1a1a" />
        {/* Right high-heel shoe - shifted up */}
        <Rect x={60} y={94} width={2.5} height={6} rx={0.5} fill="#111111" />
        <Path d="M 57 93 L 66 93 L 68 99 L 56 99 Z" fill="#1a1a1a" />

        {/* Elegant Feminine Tapered Trousers - Deep Brown/Charcoal */}
        {/* Left leg */}
        <Path d="M 42 64 C 38 72 38 88 39 94 L 44 94 C 45 88 46 72 49 64 Z" fill="#2d1500" />
        {/* Right leg */}
        <Path d="M 51 64 C 54 72 55 88 56 94 L 61 94 C 62 88 62 72 58 64 Z" fill="#2d1500" />
        {/* Shadow gap between thighs */}
        <Path d="M 48 64 L 52 64 L 50 78 Z" fill="rgba(0,0,0,0.35)" />

        {/* UNIFIED LUXURY JACKET - Gold with Velvet details */}
        <Path d="M 25 72 L 30 52 C 31 49 35 47 39 47 L 47 43 L 53 43 L 61 47 C 65 47 69 49 70 52 L 75 72 L 68 72 L 65 62 L 58 64 L 42 64 L 35 62 L 25 72 Z" fill="#b45309" />

        {/* Armpit and sleeve definition shadows */}
        <Path d="M 39 47 C 36 50 34 56 35 62" fill="none" stroke="#78350f" strokeWidth={1.5} />
        <Path d="M 61 47 C 64 50 66 56 65 62" fill="none" stroke="#78350f" strokeWidth={1.5} />

        {/* Left gold cuff */}
        <Rect x={24} y={71} width={9} height={3} rx={1} fill="#fbbf24" />
        {/* Left hand */}
        <Ellipse cx={28} cy={76} rx={4} ry={2.5} fill="#dfab8f" />

        {/* Right gold cuff */}
        <Rect x={67} y={71} width={9} height={3} rx={1} fill="#fbbf24" />
        {/* Right hand */}
        <Ellipse cx={72} cy={76} rx={4} ry={2.5} fill="#dfab8f" />
        
        {/* Luxury Fur Shawl (Etol) */}
        <Path d="M 30 47 C 30 47 42 35 50 48 C 58 35 70 47 70 47 C 70 47 57 56 50 51 C 43 56 30 47 30 47 Z" fill="#d97706" />

        {/* Left and Right bust curves */}
        <Circle cx={46} cy={54} r={5} fill="#b45309" />
        <Circle cx={54} cy={54} r={5} fill="#b45309" />
        {/* Underbust shadow lines */}
        <Path d="M 41 55 C 44 59 47 59 49 55 C 51 59 54 59 57 55" fill="none" stroke="#78350f" strokeWidth={1.8} />

        {/* Neck */}
        <Rect x={47} y={37} width={6} height={8} fill="#dfab8f" />
        {/* Head */}
        <Circle cx={50} cy={29} r={11} fill="#dfab8f" />

        {/* BEAUTIFUL GOLDEN YELLOW HAIR WITH LUXURIOUS TIARA */}
        {/* Bun detail */}
        <Circle cx={50} cy={11} r={4.5} fill="#d97706" />
        <Circle cx={50} cy={11} r={2.5} fill="#fbbf24" />
        {/* Hair wrap */}
        <Path d="M 35 29 C 35 15 65 15 65 29 C 65 37 63 43 61 43 C 58 40 60 33 60 29 C 60 24 40 24 40 29 C 40 33 42 40 39 43 C 37 43 35 37 35 29 Z" fill="#d97706" />
        {/* Tiara/Hat */}
        <Path d="M 40 22 C 40 18 60 18 60 22 Z" fill="#fbbf24" stroke="#d97706" strokeWidth={1} />
        <Path d="M 38 26 Q 50 16 62 26" stroke="#b45309" strokeWidth={3} fill="none" />
        
        {/* Earrings */}
        <Circle cx={37} cy={34} r={2.5} fill="#fbbf24" />
        <Circle cx={63} cy={34} r={2.5} fill="#fbbf24" />

        {/* FEMALE FACIAL DETAILS - EYES, NOSE, MOUTH */}
        <Ellipse cx={44} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        <Ellipse cx={56} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        {/* Eyebrows */}
        <Path d="M 41 25 Q 44 24 47 26" fill="none" stroke="#582007" strokeWidth={0.8} />
        <Path d="M 59 25 Q 56 24 53 26" fill="none" stroke="#582007" strokeWidth={0.8} />
        {/* Shaded nose */}
        <Path d="M 50 29 L 51.5 32 L 49.5 32" fill="none" stroke="#b8866d" strokeWidth={1.2} strokeLinecap="round" />
        {/* Red lips smile */}
        <Path d="M 47 35 C 48 37 52 37 53 35" fill="none" stroke="#be123c" strokeWidth={1.3} strokeLinecap="round" />
      </Svg>
    )
  },
  {
    id: 'char_researcher_male',
    name: 'Teknokrat / Araştırmacı (Erkek)',
    gender: 'male',
    description: 'Holografik veri tableti, teknolojik gözlükler ve lab yeleği. Bilim ve veri üretiminde öncüdür.',
    color: '#8b5cf6',
    svg: () => (
      <Svg viewBox="0 0 100 120" style={{ width: 100, height: 120 }}>
        <Ellipse cx={50} cy={105} rx={30} ry={10} fill="rgba(0,0,0,0.3)" />
        <Path d="M 40 80 L 40 100 L 46 100 L 48 85 L 52 85 L 54 100 L 60 100 L 60 80 Z" fill="#1e1b4b" />
        <Path d="M 34 45 L 66 45 L 61 80 L 39 80 Z" fill="#312e81" />
        <Line x1={39} y1={50} x2={39} y2={75} stroke="#818cf8" strokeWidth={2.5} />
        <Line x1={61} y1={50} x2={61} y2={75} stroke="#818cf8" strokeWidth={2.5} />
        <Rect x={47} y={38} width={6} height={8} fill="#fbcfe8" />
        <Circle cx={50} cy={30} r={12} fill="#fbcfe8" />
        <Path d="M 38 25 Q 50 12 62 25 L 62 21 Q 50 10 38 21 Z" fill="#4338ca" />
        <Rect x={52} y={58} width={16} height={12} rx={1} fill="rgba(129, 140, 248, 0.4)" stroke="#818cf8" strokeWidth={1.5} />
        <Line x1={55} y1={62} x2={65} y2={62} stroke="#818cf8" strokeWidth={1} />
        <Line x1={55} y1={66} x2={61} y2={66} stroke="#818cf8" strokeWidth={1} />

        {/* MALE FACIAL DETAILS - EYES, NOSE, MOUTH */}
        <Ellipse cx={45} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        <Ellipse cx={55} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        {/* Eyebrows */}
        <Path d="M 42 25 Q 45 24 48 26" fill="none" stroke="#171717" strokeWidth={1} />
        <Path d="M 58 25 Q 55 24 52 26" fill="none" stroke="#171717" strokeWidth={1} />
        {/* Shaded nose */}
        <Path d="M 50 29 L 51.5 32 L 49.5 32" fill="none" stroke="#b8866d" strokeWidth={1.2} strokeLinecap="round" />
        {/* Friendly smile */}
        <Path d="M 47 35 Q 50 37 53 35" fill="none" stroke="#9e664c" strokeWidth={1.3} strokeLinecap="round" />
      </Svg>
    )
  },
  {
    id: 'char_researcher_female',
    name: 'Teknokrat / Araştırmacı (Kadın)',
    gender: 'female',
    description: 'Mor çerçeveli teknoloji gözlüğü, beyaz laboratuvar önlüğü ve akıllı araştırmacı duruşu.',
    color: '#8b5cf6',
    svg: () => (
      <Svg viewBox="0 0 100 120" style={{ width: 100, height: 120 }}>
        {/* Ground shadow - shifted up */}
        <Ellipse cx={50} cy={102} rx={26} ry={7} fill="rgba(0,0,0,0.35)" />

        {/* Left high-heel shoe - shifted up */}
        <Rect x={38} y={94} width={2.5} height={6} rx={0.5} fill="#111111" />
        <Path d="M 34 93 L 43 93 L 45 99 L 33 99 Z" fill="#1a1a1a" />
        {/* Right high-heel shoe - shifted up */}
        <Rect x={60} y={94} width={2.5} height={6} rx={0.5} fill="#111111" />
        <Path d="M 57 93 L 66 93 L 68 99 L 56 99 Z" fill="#1a1a1a" />

        {/* Elegant Feminine Tapered Trousers (Shortened, slim-fit & fit curves) */}
        {/* Left leg */}
        <Path d="M 42 64 C 38 72 38 88 39 94 L 44 94 C 45 88 46 72 49 64 Z" fill="#1b1c22" />
        {/* Right leg */}
        <Path d="M 51 64 C 54 72 55 88 56 94 L 61 94 C 62 88 62 72 58 64 Z" fill="#1b1c22" />
        {/* Shadow gap between thighs */}
        <Path d="M 48 64 L 52 64 L 50 78 Z" fill="rgba(0,0,0,0.35)" />
        {/* Crotch seam shadow */}
        <Path d="M 47 64 C 49 68 51 68 53 64" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={1.5} />

        {/* UNIFIED SUIT BLAZER & SLEEVES - perfectly seamless shoulder & arm structure */}
        <Path d="M 25 72 L 30 52 C 31 49 35 47 39 47 L 47 43 L 53 43 L 61 47 C 65 47 69 49 70 52 L 75 72 L 68 72 L 65 62 L 58 64 L 42 64 L 35 62 L 25 72 Z" fill="#e11d48" />

        {/* Armpit and sleeve definition shadows (seam lines for depth) */}
        <Path d="M 39 47 C 36 50 34 56 35 62" fill="none" stroke="#be123c" strokeWidth={1.5} />
        <Path d="M 61 47 C 64 50 66 56 65 62" fill="none" stroke="#be123c" strokeWidth={1.5} />

        {/* Left white cuff */}
        <Rect x={24} y={71} width={9} height={3} rx={1} fill="#f8fafc" />
        {/* Left hand */}
        <Ellipse cx={28} cy={76} rx={4} ry={2.5} fill="#e2b49a" />

        {/* Right white cuff */}
        <Rect x={67} y={71} width={9} height={3} rx={1} fill="#f8fafc" />
        {/* Right hand */}
        <Ellipse cx={72} cy={76} rx={4} ry={2.5} fill="#e2b49a" />
        {/* Left and Right bust curves */}
        <Circle cx={46} cy={54} r={5} fill="#e11d48" />
        <Circle cx={54} cy={54} r={5} fill="#e11d48" />
        {/* Underbust shadow lines */}
        <Path d="M 41 55 C 44 59 47 59 49 55 C 51 59 54 59 57 55" fill="none" stroke="#be123c" strokeWidth={1.8} />
        {/* Chest highlight curves */}
        <Path d="M 43 51 C 45 53 47 53 48 50" fill="none" stroke="#f43f5e" strokeWidth={1.2} />
        <Path d="M 57 51 C 55 53 53 53 52 50" fill="none" stroke="#f43f5e" strokeWidth={1.2} />

        {/* V neckline */}
        <Path d="M 46 44 L 50 51 L 54 44 Z" fill="#e2b49a" />

        {/* Neck */}
        <Rect x={47} y={37} width={6} height={8} fill="#e2b49a" />
        {/* Head */}
        <Circle cx={50} cy={29} r={11} fill="#e2b49a" />

        {/* BEAUTIFUL GOLDEN YELLOW HAIR (Perfect Head Wrap, Ends exactly above glasses) */}
        {/* Bun detail */}
        <Circle cx={50} cy={11} r={4.5} fill="#d97706" />
        <Circle cx={50} cy={11} r={2.5} fill="#fbbf24" />
        {/* Hair base and wrap around the head circle */}
        <Path d="M 35 29 C 35 15 65 15 65 29 C 65 37 63 43 61 43 C 58 40 60 33 60 29 C 60 24 40 24 40 29 C 40 33 42 40 39 43 C 37 43 35 37 35 29 Z" fill="#d97706" />
        {/* Hair front volume and bangs contour - ending exactly at y=22, above the glasses */}
        <Path d="M 36 24 C 36 12 64 12 64 24 C 60 24 56 22 50 22 C 44 22 40 24 36 24 Z" fill="#fbbf24" />
        {/* Side locks */}
        <Path d="M 36 24 L 38 24 L 39 34 L 36 34 Z" fill="#fbbf24" />
        <Path d="M 64 24 L 62 24 L 61 34 L 64 34 Z" fill="#fbbf24" />
        {/* Top shine highlight */}
        <Path d="M 42 19 Q 50 14 58 19 Q 50 17 42 19 Z" fill="#fef08a" />

        {/* BLACK GLASSES - left lens */}
        <Rect x={40} y={26} width={8} height={5} rx={2} fill="rgba(0,0,0,0.7)" stroke="#1a1a1a" strokeWidth={1.3} />
        {/* Black glasses - right lens */}
        <Rect x={52} y={26} width={8} height={5} rx={2} fill="rgba(0,0,0,0.7)" stroke="#1a1a1a" strokeWidth={1.3} />
        {/* Bridge */}
        <Line x1={48} y1={28.5} x2={52} y2={28.5} stroke="#1a1a1a" strokeWidth={1.3} />
        {/* Left temple arm */}
        <Line x1={40} y1={28.5} x2={36} y2={30} stroke="#1a1a1a" strokeWidth={1.3} />
        {/* Right temple arm */}
        <Line x1={60} y1={28.5} x2={64} y2={30} stroke="#1a1a1a" strokeWidth={1.3} />
        
        {/* FEMALE FACIAL DETAILS - EYES, NOSE, MOUTH */}
        <Ellipse cx={44} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        <Ellipse cx={56} cy={29} rx={1.3} ry={0.9} fill="#1a1a1a" />
        {/* Eyebrows */}
        <Path d="M 41 25 Q 44 24 47 26" fill="none" stroke="#582007" strokeWidth={0.8} />
        <Path d="M 59 25 Q 56 24 53 26" fill="none" stroke="#582007" strokeWidth={0.8} />
        {/* Shaded nose */}
        <Path d="M 50 29 L 51.5 32 L 49.5 32" fill="none" stroke="#b8866d" strokeWidth={1.2} strokeLinecap="round" />
        {/* Red lips smile */}
        <Path d="M 47 35 C 48 37 52 37 53 35" fill="none" stroke="#be123c" strokeWidth={1.3} strokeLinecap="round" />
      </Svg>
    )
  }
];

const POLITICAL_IDEOLOGIES = [
  { id: 1, name: 'Sosyal Demokrasi' },
  { id: 2, name: 'Muhafazakarlık' },
  { id: 3, name: 'Milliyetçilik' },
  { id: 4, name: 'Liberalizm' },
  { id: 5, name: 'Sosyalizm' },
  { id: 6, name: 'Avrasyacılık' },
  { id: 7, name: 'Merkez Sağ' },
  { id: 8, name: 'Yeşiller / Çevrecilik' },
  { id: 9, name: 'Teknokrasi' },
  { id: 10, name: 'Federalizm' }
];

const FEMALE_NAMES = [
  'Fatma', 'Ayşe', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Meryem', 'Şerife', 'Zehra', 'Sultan',
  'Hanife', 'Merve', 'Yasemin', 'Fadime', 'Şennur', 'Kübra', 'Selvi', 'Leyla', 'Melek', 'Sibel',
  'Havva', 'Neriman', 'Asiye', 'Kezban', 'Songül', 'Aslı', 'Begüm', 'Hande', 'Dilan', 'Duygu',
  'Ebru', 'Gamze', 'Gözde', 'Hilal', 'İrem', 'Melis', 'Özlem', 'Pelin', 'Rabia', 'Seda',
  'Tuğba', 'Yağmur', 'Büşra', 'Ceren', 'Damla', 'Dilara', 'Gizem', 'Hazal', 'Belgin', 'Nermin'
];

const MALE_NAMES = [
  'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'Halil', 'Süleyman', 'Yusuf',
  'Ömer', 'Osman', 'Murat', 'Salih', 'Hakan', 'Ramazan', 'İsmail', 'Kemal', 'Recep', 'Serkan',
  'Bülent', 'Gökhan', 'Fatih', 'Metin', 'Ercan', 'Volkan', 'Sinan', 'Kenan', 'Yasin', 'Zafer',
  'Alper', 'Burak', 'Can', 'Deniz', 'Egemen', 'Emre', 'Eren', 'Furkan', 'Mert', 'Oğuz',
  'Onur', 'Sercan', 'Tolga', 'Umut', 'Uğur', 'Yiğit', 'Tarık', 'Selim', 'Kerem', 'Kadir'
];

// Statically memoized background media to prevent heavy expo-av Video re-renders
const BackgroundMedia = React.memo(() => {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Background static fallback */}
      <Image source={fallbackBg} style={StyleSheet.absoluteFill} resizeMode="cover" />

      {/* Infinite loop single video background - render instantly */}
      <Video
        source={bgVideo1}
        style={StyleSheet.absoluteFill}
        resizeMode={ResizeMode.COVER}
        shouldPlay
        isLooping
        isMuted
      />
    </View>
  );
});

export default function CharacterCreationScreen() {
  const { user, refreshUser } = useAuth();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(insets, width, height), [insets, width, height]);

  const [step, setStep] = useState<number>(1);
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [age, setAge] = useState<number>(18);
  const [selectedIdeologyId, setSelectedIdeologyId] = useState<number>(1);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedBackstoryId, setSelectedBackstoryId] = useState<string | null>('story_veteran');
  const [selectedIsometricId, setSelectedIsometricId] = useState<string | null>(null);
  const [motherName, setMotherName] = useState<string>('');
  const [fatherName, setFatherName] = useState<string>('');
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [initialLoaded, setInitialLoaded] = useState<boolean>(false);

  // Load initial values from DB once on mount & refresh profile
  React.useEffect(() => {
    refreshUser();
  }, []);

  // Sync states once user profile is retrieved
  React.useEffect(() => {
    if (user && !initialLoaded) {
      if (user.characterCreationStep) setStep(user.characterCreationStep);
      if (user.gender) setGender(user.gender);
      if (user.characterAge) setAge(user.characterAge);
      if (user.politicalIdeologyId) setSelectedIdeologyId(user.politicalIdeologyId);
      if (user.citizenshipProvinceId) setSelectedProvinceId(user.citizenshipProvinceId);
      if (user.citizenshipDistrictId) setSelectedDistrictId(user.citizenshipDistrictId);
      if (user.backstoryId) setSelectedBackstoryId(user.backstoryId);
      if (user.isometricModelId) setSelectedIsometricId(user.isometricModelId);
      setInitialLoaded(true);
    }
  }, [user, initialLoaded]);

  // Systemic random assignment for mother and father name when step becomes 4
  React.useEffect(() => {
    if (step === 4) {
      if (!motherName) {
        const randomMother = FEMALE_NAMES[Math.floor(Math.random() * FEMALE_NAMES.length)];
        setMotherName(randomMother);
      }
      if (!fatherName) {
        const randomFather = MALE_NAMES[Math.floor(Math.random() * MALE_NAMES.length)];
        setFatherName(randomFather);
      }
    }
  }, [step, motherName, fatherName]);

  const filteredModels = useMemo(() => {
    return ISOMETRIC_MODELS.filter((m) => m.gender === gender);
  }, [gender]);

  React.useEffect(() => {
    if (gender && filteredModels.length > 0) {
      const currentIsValid = filteredModels.some((m) => m.id === selectedIsometricId);
      if (!currentIsValid) {
        setSelectedIsometricId(filteredModels[0].id);
      }
    }
  }, [gender, filteredModels, selectedIsometricId]);

  // Available districts for selected province
  const availableDistricts = useMemo(() => {
    if (selectedProvinceId === null) return [];
    return DISTRICTS.filter((d: any) => d.provinceId === selectedProvinceId);
  }, [selectedProvinceId]);

  const handleNext = async () => {
    setError(null);
    if (submitting) return;

    if (step === 1) {
      if (!gender) {
        setError('Lütfen bir cinsiyet seçiniz.');
        return;
      }
      setSubmitting(true);
      try {
        const response = await axiosClient.post('/users/update-character-draft', {
          step: 1,
          gender,
          characterAge: age,
          politicalIdeologyId: selectedIdeologyId
        });
        if (response.data && response.data.success) {
          await refreshUser();
          setStep(2);
        } else {
          setError(response.data.message || 'Taslak kaydedilemedi.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Bağlantı hatası oluştu.');
      } finally {
        setSubmitting(false);
      }
    } else if (step === 2) {
      if (!selectedProvinceId || !selectedDistrictId) {
        setError('Lütfen yaşamak istediğiniz devleti ve ilçeyi seçiniz.');
        return;
      }
      setSubmitting(true);
      try {
        const response = await axiosClient.post('/users/update-character-draft', {
          step: 2,
          provinceId: selectedProvinceId,
          districtId: selectedDistrictId
        });
        if (response.data && response.data.success) {
          await refreshUser();
          setStep(3);
        } else {
          setError(response.data.message || 'Taslak kaydedilemedi.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Bağlantı hatası oluştu.');
      } finally {
        setSubmitting(false);
      }
    } else if (step === 3) {
      if (!selectedIsometricId) {
        setError('Lütfen karakterinizin izometrik görünümünü seçiniz.');
        return;
      }
      setSubmitting(true);
      try {
        const response = await axiosClient.post('/users/update-character-draft', {
          step: 3,
          isometricModelId: selectedIsometricId
        });
        if (response.data && response.data.success) {
          await refreshUser();
          setStep(4);
        } else {
          setError(response.data.message || 'Taslak kaydedilemedi.');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Bağlantı hatası oluştu.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = useCallback(() => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  }, [step]);

  const handleFinish = async () => {
    setError(null);
    if (!gender || !selectedProvinceId || !selectedDistrictId || !selectedIsometricId) {
      setError('Lütfen tüm adımları doldurduğunuzdan emin olun.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        avatarId: gender === 'male' ? 'avatar_m_1' : 'avatar_f_1',
        isometricModelId: selectedIsometricId,
        backstoryId: 'story_veteran',
        provinceId: selectedProvinceId,
        districtId: selectedDistrictId,
        gender: gender,
        characterAge: age,
        politicalIdeologyId: selectedIdeologyId,
      };

      const response = await axiosClient.post('/users/setup-character', payload);
      if (response.data && response.data.success) {
        await refreshUser();
      } else {
        setError(response.data.message || 'Karakter kurulumu başarısız oldu.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sunucu bağlantısı sırasında bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackgroundMedia />

      <View style={styles.overlay} pointerEvents="none" />

      <View style={[styles.header, { marginTop: Math.max(insets.top, 20) }]}>
        <Text style={styles.stepTitle}>KARAKTER OLUŞTUR</Text>
        <View style={styles.stepperContainer}>
          {[1, 2, 3, 4].map((num) => (
            <React.Fragment key={num}>
              <View style={[
                styles.stepCircle, 
                step >= num && styles.activeStepCircle,
                step === num && styles.currentStepCircle
              ]}>
                <Text style={[
                  styles.stepCircleText, 
                  step >= num && styles.activeStepCircleText,
                  step === num && styles.currentStepCircleText
                ]}>{num}</Text>
              </View>
              {num < 4 && (
                <View style={[
                  styles.stepLine, 
                  step > num && styles.activeStepLine
                ]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </View>

        <Modal
          visible={!!error}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setError(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalIconContainer}>
                <Text style={styles.modalIconText}>⚠️</Text>
              </View>
              <Text style={styles.modalTitle}>UYARI</Text>
              <Text style={styles.modalMessage}>{error}</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setError(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseBtnText}>TAMAM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View style={[styles.card, { marginBottom: Math.max(insets.bottom, 20) }]}>

        {/* STEP 1: GENDER & AGE */}
        {step === 1 && (
          <ScrollView style={styles.stepContent} contentContainerStyle={styles.stepScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Cinsiyet Seçimi</Text>
            <Text style={styles.sectionSubtitle}>Kimliğinizde beyan edilecek cinsiyeti seçiniz.</Text>

            <View style={styles.genderContainer}>
              {/* Male Card */}
              <TouchableOpacity
                style={[styles.genderCard, gender === 'male' && styles.activeGenderCard]}
                onPress={() => setGender('male')}
                activeOpacity={0.85}
              >
                <View style={[styles.genderAvatarWrapper, gender === 'male' && styles.activeGenderAvatarWrapper]}>
                  {React.cloneElement(
                    ISOMETRIC_MODELS.find(m => m.id === 'char_diplomat_male')!.svg(gender === 'male' ? '#06b6d4' : '#334155'),
                    { style: { width: 106, height: 106 } }
                  )}
                </View>
                <Text style={[styles.genderLabelMain, gender === 'male' && styles.activeGenderText]}>ERKEK</Text>
              </TouchableOpacity>

              {/* Female Card */}
              <TouchableOpacity
                style={[styles.genderCard, gender === 'female' && styles.activeGenderCard]}
                onPress={() => setGender('female')}
                activeOpacity={0.85}
              >
                <View style={[styles.genderAvatarWrapper, gender === 'female' && styles.activeGenderAvatarWrapper]}>
                  {React.cloneElement(
                    ISOMETRIC_MODELS.find(m => m.id === 'char_researcher_female')!.svg(gender === 'female' ? '#8b5cf6' : '#334155'),
                    { style: { width: 106, height: 106 } }
                  )}
                </View>
                <Text style={[styles.genderLabelMain, gender === 'female' && styles.activeGenderText]}>KADIN</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Karakter Yaşı</Text>
            
            <View style={styles.ageSelectorContainer}>
              <View style={styles.ageConsolePanel}>
                <TouchableOpacity 
                  style={styles.ageControlBtn} 
                  onPress={() => setAge(Math.max(18, age - 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ageControlBtnText}>◀</Text>
                </TouchableOpacity>
                
                <View style={styles.ageDisplayContainer}>
                  <Text style={styles.ageValue}>{age}</Text>
                  <Text style={styles.ageValueLabel}>YAŞINDA</Text>
                </View>

                <TouchableOpacity 
                  style={styles.ageControlBtn} 
                  onPress={() => setAge(Math.min(75, age + 1))}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ageControlBtnText}>▶</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Siyasi Görüş</Text>
            <Text style={styles.sectionSubtitle}>Karakterinizin dünya görüşünü ve siyasi duruşunu belirleyin.</Text>

            <View style={styles.ageSelectorContainer}>
              <View style={styles.ageConsolePanel}>
                <TouchableOpacity 
                  style={styles.ageControlBtn} 
                  onPress={() => setSelectedIdeologyId(prev => prev === 1 ? 10 : prev - 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ageControlBtnText}>◀</Text>
                </TouchableOpacity>
                
                <View style={styles.ageDisplayContainer}>
                  <Text style={styles.ideologyValue}>
                    {POLITICAL_IDEOLOGIES.find(i => i.id === selectedIdeologyId)?.name}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.ageControlBtn} 
                  onPress={() => setSelectedIdeologyId(prev => prev === 10 ? 1 : prev + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ageControlBtnText}>▶</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}

        {/* STEP 2: PROVINCE & DISTRICT */}
        {step === 2 && (
          <View style={styles.stepContent}>
            {selectedProvinceId === null ? (
              // State selection view
              <>
                <Text style={[styles.sectionTitle, { marginTop: 0 }]}>İkametgah Seç</Text>
                <Text style={styles.sectionSubtitle}>Geleceğinizi inşa etmek ve yaşamak istediğiniz devleti belirleyin.</Text>

                <Text style={styles.label}>Devletinizi Seçin</Text>
                <ScrollView style={styles.provinceScroll} nestedScrollEnabled={true} contentContainerStyle={{ paddingVertical: 6 }}>
                  {STARTING_PROVINCES.map((prov) => (
                    <TouchableOpacity
                      key={prov.id}
                      style={[styles.listItem, selectedProvinceId === prov.id && styles.activeListItem]}
                      onPress={() => {
                        setSelectedProvinceId(prov.id);
                        setSelectedDistrictId(null);
                      }}
                    >
                      <Text style={[styles.listItemText, selectedProvinceId === prov.id && styles.activeListItemText]}>
                        {prov.name}
                      </Text>
                      <Text style={styles.listItemDesc}>{prov.description}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              // District selection view
              <>
                <Text style={[styles.sectionTitle, { marginTop: 0 }]}>İkametgah Seç</Text>
                <Text style={styles.sectionSubtitle}>
                  {STARTING_PROVINCES.find(p => p.id === selectedProvinceId)?.name} sınırları içerisinde yaşayacağınız ilçeyi seçin.
                </Text>

                <TouchableOpacity
                  style={styles.backToProvinceButton}
                  onPress={() => {
                    setSelectedProvinceId(null);
                    setSelectedDistrictId(null);
                  }}
                >
                  <Text style={styles.backToProvinceText}>◀ Farklı Bir Devlet Seç</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Yerleşim Bölgesi (İlçe)</Text>
                <ScrollView style={styles.districtScroll} nestedScrollEnabled={true} contentContainerStyle={{ paddingVertical: 6 }}>
                  {availableDistricts.map((dist: any) => (
                    <TouchableOpacity
                      key={dist.id}
                      style={[styles.subListItem, selectedDistrictId === dist.id && styles.activeSubListItem]}
                      onPress={() => setSelectedDistrictId(dist.id)}
                    >
                      <Text style={[styles.subListItemText, selectedDistrictId === dist.id && styles.activeSubListItemText]}>
                        {dist.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>
        )}

        {/* STEP 3: ISOMETRIC MODEL SELECTION */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Görünüm Seç</Text>
            <Text style={styles.sectionSubtitle}>Mekanlarda ve haritada sizi temsil edecek izometrik karakterinizi seçin.</Text>

            <ScrollView style={styles.backstoryScroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 6 }}>
              {filteredModels.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  style={[
                    styles.backstoryCard,
                    selectedIsometricId === model.id && styles.activeBackstoryCard
                  ]}
                  onPress={() => setSelectedIsometricId(model.id)}
                  activeOpacity={0.85}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={{
                      width: 70,
                      height: 84,
                      borderRadius: 8,
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderWidth: 1.5,
                      borderColor: selectedIsometricId === model.id ? model.color : 'rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden'
                    }}>
                      {model.svg(model.color)}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[
                        styles.backstoryName,
                        selectedIsometricId === model.id && { color: model.color }
                      ]}>
                        {model.name}
                      </Text>
                      <Text style={styles.backstoryDesc}>{model.description}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* STEP 4: ON ONAYLAMA & FINISH */}
        {step === 4 && (() => {
          const displayAge = user?.characterAge || age;
          const displayGender = user?.gender || gender;
          const displayProvinceId = user?.citizenshipProvinceId || selectedProvinceId;
          const displayDistrictId = user?.citizenshipDistrictId || selectedDistrictId;
          
          const displayProvinceObj = STARTING_PROVINCES.find(p => p.id === displayProvinceId);
          const districtsList = displayProvinceId ? DISTRICTS.filter((d: any) => d.provinceId === displayProvinceId) : [];
          const displayDistrictObj = districtsList.find((d: any) => d.id === displayDistrictId);
          const displayResidence = `${displayProvinceObj?.name || ''} / ${displayDistrictObj?.name || ''}`.trim().toUpperCase();

          const userName = user?.characterName ? user.characterName.toUpperCase() : 'VATANDAŞ';
          const userSurname = user?.characterSurname ? user.characterSurname.toUpperCase() : 'ADAYI';
          const displayCitizenId = user?.citizenId || '7291038';
          const displayBirthDate = user?.birthDate || `19.05.${2026 - displayAge}`;

          return (
            <ScrollView style={styles.stepContent} contentContainerStyle={styles.stepScrollContent} showsVerticalScrollIndicator={false}>
              <Text style={[styles.sectionTitle, { marginTop: 0 }]}>Kimlik Kartı</Text>
              <Text style={styles.sectionSubtitle}>Cumhuriyet vatandaşlık kimlik belgenizi kontrol edip onaylayınız.</Text>

              {/* Premium Citizenship ID Card */}
              <View style={styles.idCard}>
                {/* Holographic wavy line backgrounds */}
                <View style={styles.idCardHologram} pointerEvents="none">
                  <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
                    <Path
                      d="M-20 60 Q 60 10 140 80 T 300 20 T 460 70"
                      fill="none"
                      stroke="rgba(45, 212, 191, 0.07)"
                      strokeWidth={2}
                    />
                    <Path
                      d="M-20 80 Q 70 30 160 90 T 320 30 T 480 80"
                      fill="none"
                      stroke="rgba(45, 212, 191, 0.04)"
                      strokeWidth={1.5}
                    />
                    <Circle cx="220" cy="90" r="32" fill="none" stroke="rgba(45, 212, 191, 0.03)" strokeWidth={1} strokeDasharray="3 3" />
                  </Svg>
                </View>

                {/* ID Card Header */}
                <View style={styles.idCardHeader}>
                  <Svg width={18} height={18} viewBox="0 0 100 100" style={{ marginRight: 6 }}>
                    <Path d="M 50 15 A 35 35 0 1 0 85 50 A 28 28 0 1 1 50 22 Z" fill="#2dd4bf" />
                    <Path d="M 75 35 L 77 42 L 84 42 L 79 46 L 81 53 L 75 49 L 69 53 L 71 46 L 66 42 L 73 42 Z" fill="#2dd4bf" />
                  </Svg>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.idCardHeaderTitle}>KİMLİK KARTI</Text>
                    <Text style={styles.idCardHeaderSubtitle}>CITIZENSHIP CARD</Text>
                  </View>
                  {/* Microchip */}
                  <View style={styles.idCardChip}>
                    <View style={styles.idCardChipLine} />
                    <View style={styles.idCardChipLine} />
                    <View style={[styles.idCardChipLine, { borderBottomWidth: 0 }]} />
                    <View style={styles.idCardChipInner} />
                  </View>
                </View>

                {/* ID Card Body */}
                <View style={styles.idCardBody}>
                  {/* Left side: Photo & Signature */}
                  <View style={styles.idCardLeftCol}>
                    <View style={styles.idCardPhotoFrame}>
                      {selectedIsometricId && ISOMETRIC_MODELS.find(m => m.id === selectedIsometricId) && (
                        React.cloneElement(
                          ISOMETRIC_MODELS.find(m => m.id === selectedIsometricId)!.svg(
                            ISOMETRIC_MODELS.find(m => m.id === selectedIsometricId)!.color
                          ),
                          {
                            viewBox: "25 12 50 50",
                            style: { width: '100%', height: '100%' }
                          }
                        )
                      )}
                    </View>
                    <Text style={styles.idCardSerial}>TR-C{displayCitizenId}</Text>
                    {/* Simulated signature */}
                    <Svg width={46} height={12} viewBox="0 0 100 30" style={{ marginTop: 2 }}>
                      <Path
                        d="M10 20 Q 30 5 45 22 T 80 15 T 95 10"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.4)"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                      />
                    </Svg>
                  </View>

                  {/* Right side: Fields */}
                  <View style={styles.idCardRightCol}>
                    <View style={styles.idCardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.idCardFieldLabel}>KİMLİK NO / ID NO</Text>
                        <Text style={styles.idCardFieldValue}>{displayCitizenId}</Text>
                      </View>
                    </View>

                    <View style={styles.idCardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.idCardFieldLabel}>SOYADI / SURNAME</Text>
                        <Text style={styles.idCardFieldValue}>{userSurname}</Text>
                      </View>
                    </View>

                    <View style={styles.idCardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.idCardFieldLabel}>ADI / GIVEN NAME</Text>
                        <Text style={styles.idCardFieldValue}>{userName}</Text>
                      </View>
                    </View>

                    <View style={styles.idCardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.idCardFieldLabel}>DOĞUM TARİHİ / DATE OF BIRTH</Text>
                        <Text style={styles.idCardFieldValue}>{displayBirthDate}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.idCardFieldLabel}>CİNSİYET / SEX</Text>
                        <Text style={styles.idCardFieldValue}>{displayGender === 'male' ? 'ERKEK / M' : 'KADIN / F'}</Text>
                      </View>
                    </View>

                    <View style={styles.idCardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.idCardFieldLabel}>BABA ADI / FATHER NAME</Text>
                        <Text style={styles.idCardFieldValue}>{fatherName.toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 8 }}>
                        <Text style={styles.idCardFieldLabel}>ANNE ADI / MOTHER NAME</Text>
                        <Text style={styles.idCardFieldValue}>{motherName.toUpperCase()}</Text>
                      </View>
                    </View>

                    <View style={styles.idCardRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.idCardFieldLabel}>İKAMETGAH / RESIDENCE</Text>
                        <Text style={styles.idCardFieldValue}>{displayResidence}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Selected Appearance, Political View, and Criminal Record */}
              <View style={styles.detailsRowContainer}>
                <View style={styles.detailCapsuleIdeology}>
                  <Text style={[styles.detailCapsuleLabel, { backgroundColor: 'transparent' }]}>Siyasi Görüş</Text>
                  <Text style={[styles.detailCapsuleValue, { color: '#10b981', backgroundColor: 'transparent' }]}>
                    {POLITICAL_IDEOLOGIES.find(i => i.id === selectedIdeologyId)?.name}
                  </Text>
                </View>
                <View style={styles.detailCapsuleRecord}>
                  <Text style={[styles.detailCapsuleLabel, { backgroundColor: 'transparent' }]}>Adli Sicil Kaydı</Text>
                  <Text style={[styles.detailCapsuleValue, { color: '#10b981', backgroundColor: 'transparent' }]}>Yok</Text>
                </View>
              </View>
            </ScrollView>
          );
        })()}

        {/* Control Buttons */}
        <View style={styles.buttonContainer}>
          {step > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={submitting}>
              <Text style={styles.backButtonText}>GERİ</Text>
            </TouchableOpacity>
          )}

          {step < 4 ? (
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>DEVAM ET ➔</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.finishButton} onPress={handleFinish} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color="#020617" size="small" />
              ) : (
                <Text style={styles.finishButtonText}>BAŞLA</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}


