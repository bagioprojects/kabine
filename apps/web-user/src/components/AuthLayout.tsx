import React, { useState } from 'react';
import { UserPlus, LogIn, Eye, EyeOff } from 'lucide-react';
import { ComplianceModal, type ComplianceDocType } from './ComplianceModal';
import { PROVINCE_LOOKUP, DISTRICT_LOOKUP } from '../data/locationData';
import { VideoBackgroundOverlay } from './VideoBackgroundOverlay';

interface AuthLayoutProps {
  onLoginSuccess: (userData: {
    username: string;
    characterName: string;
    characterSurname: string;
    politicalRole: string;
    province?: string;
    residenceProvince?: string;
    residenceDistrict?: string;
    isCharacterCreated?: boolean;
    avatarId?: string;
    isometricModelId?: string;
    backstoryId?: string;
    gender?: string | null;
    characterAge?: number | null;
    politicalInfluence?: number;
    coalMineLevel?: number;
    autoFactoryLevel?: number;
    defenseFactoryLevel?: number;
    materials?: any;
  }) => void;
}


export const AuthLayout: React.FC<AuthLayoutProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState<boolean>(true); // Default to Login
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activeComplianceDoc, setActiveComplianceDoc] = useState<ComplianceDocType | null>(null);


  // Form Fields
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [charName, setCharName] = useState<string>('');
  const [charSurname, setCharSurname] = useState<string>('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const API_BASE = '/api/v1';

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password;

    const containsXmlOrXss = (val: string): boolean => {
      const dangerousPatterns = [
        /<\?xml/i,
        /<!DOCTYPE/i,
        /<!ENTITY/i,
        /<!ELEMENT/i,
        /SYSTEM\s+['"]/i,
        /PUBLIC\s+['"]/i,
        /xmlns/i,
        /<script/i,
        /javascript:/i,
        /<\/?[a-z][a-z0-9]*[^>]*>/i
      ];
      return dangerousPatterns.some(pattern => pattern.test(val));
    };

    if (containsXmlOrXss(cleanUsername) || containsXmlOrXss(cleanPassword) || containsXmlOrXss(charName) || containsXmlOrXss(charSurname) || containsXmlOrXss(phoneNumber)) {
      setError('Girdiğiniz bilgiler geçersiz karakterler veya güvenlik dışı kod ögeleri içermektedir.');
      return;
    }

    try {
      if (isLogin) {
        if (!cleanUsername || !cleanPassword) {
          setError('Kullanıcı adı ve şifrenizi giriniz.');
          return;
        }

        const response = await fetch(`${API_BASE}/users/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: cleanUsername, password: cleanPassword })
        });
        const data = await response.json();

        if (!data.success) {
          setError(data.message || 'Giriş başarısız. Bilgilerinizi kontrol ediniz.');
          return;
        }

        const userObj = data.data.user;
        const token = data.data.token;
        localStorage.setItem('politic_token', token);

        // Lazy-load confetti to reduce initial bundle size and boost page load speed
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        onLoginSuccess({
          username: userObj.username,
          characterName: userObj.characterName,
          characterSurname: userObj.characterSurname,
          politicalRole: userObj.politicalRole,
          province: PROVINCE_LOOKUP[userObj.currentProvinceId] || 'Ankara',
          residenceProvince: PROVINCE_LOOKUP[userObj.citizenshipProvinceId] || 'Ankara',
          residenceDistrict: DISTRICT_LOOKUP[userObj.citizenshipDistrictId] || 'Çankaya',
          isCharacterCreated: userObj.isCharacterCreated,
          avatarId: userObj.avatarId,
          isometricModelId: userObj.isometricModelId,
          backstoryId: userObj.backstoryId,
          gender: userObj.gender,
          characterAge: userObj.characterAge,
          politicalInfluence: userObj.politicalInfluence,
          coalMineLevel: userObj.coalMineLevel,
          autoFactoryLevel: userObj.autoFactoryLevel,
          defenseFactoryLevel: userObj.defenseFactoryLevel,
          materials: userObj.materials
        });
      } else {
        const cleanPhone = phoneNumber.trim();
        const cleanCharName = charName.trim();
        const cleanCharSurname = charSurname.trim();

        if (!cleanUsername || !cleanPassword || !cleanPhone || !cleanCharName || !cleanCharSurname) {
          setError('Tüm kimlik alanlarının doldurulması zorunludur.');
          return;
        }

        // 1. Username pattern check
        const usernameRegex = /^[a-z0-9_-]{3,20}$/;
        if (!usernameRegex.test(cleanUsername)) {
          setError('Kullanıcı adı 3-20 karakter uzunluğunda olmalı ve yalnızca küçük harf, rakam, alt çizgi (_) veya tire (-) içermelidir.');
          return;
        }

        // 2. Character Name & Surname checks
        const nameRegex = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]{2,30}$/;
        if (!nameRegex.test(cleanCharName) || !nameRegex.test(cleanCharSurname)) {
          setError('Karakter adı ve soyadı yalnızca harflerden oluşmalı ve en az 2 karakter olmalıdır.');
          return;
        }

        // 3. Password check
        if (cleanPassword.length < 6) {
          setError('Şifreniz en az 6 karakter uzunluğunda olmalıdır.');
          return;
        }

        // 4. Phone check - must be exactly 10 digits entered in the editable part
        if (phoneNumber.length !== 10) {
          setError('Lütfen geçerli bir telefon numarası giriniz (telefon numarası alanı tam olarak 10 haneli olmalıdır).');
          return;
        }

        const fullPhone = '+90' + phoneNumber;

        const response = await fetch(`${API_BASE}/users/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: cleanUsername,
            password: cleanPassword,
            phoneNumber: fullPhone,
            characterName: cleanCharName,
            characterSurname: cleanCharSurname
          })
        });
        const data = await response.json();

        if (!data.success) {
          setError(data.message || 'Kayıt başarısız. Kullanıcı adı veya telefon kullanımda olabilir.');
          return;
        }

        const userObj = data.data.user;
        const token = data.data.token;
        localStorage.setItem('politic_token', token);

        // Lazy-load confetti to reduce initial bundle size and boost page load speed
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });

        onLoginSuccess({
          username: userObj.username,
          characterName: userObj.characterName,
          characterSurname: userObj.characterSurname,
          politicalRole: userObj.politicalRole,
          province: PROVINCE_LOOKUP[userObj.currentProvinceId] || 'Ankara',
          residenceProvince: PROVINCE_LOOKUP[userObj.citizenshipProvinceId] || 'Ankara',
          residenceDistrict: DISTRICT_LOOKUP[userObj.citizenshipDistrictId] || 'Çankaya',
          isCharacterCreated: userObj.isCharacterCreated,
          avatarId: userObj.avatarId,
          isometricModelId: userObj.isometricModelId,
          backstoryId: userObj.backstoryId,
          gender: userObj.gender,
          characterAge: userObj.characterAge,
          politicalInfluence: userObj.politicalInfluence,
          coalMineLevel: userObj.coalMineLevel,
          autoFactoryLevel: userObj.autoFactoryLevel,
          defenseFactoryLevel: userObj.defenseFactoryLevel,
          materials: userObj.materials
        });
      }
    } catch (err: any) {
      console.error(err);
      setError('Bağlantı hatası: Simülasyon sunucusu çalışmıyor veya ulaşılamıyor.');
    }
  };

  // Base styles to ensure inputs are dark and text is white
  const inputStyle: React.CSSProperties = {
    background: 'rgba(15, 23, 42, 0.95)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    border: '1.5px solid rgba(217, 119, 6, 0.5)',
    color: '#ffffff',
    borderRadius: '4px',
    padding: '0.65rem 0.85rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      overflow: 'hidden',
      boxSizing: 'border-box',
      backgroundColor: '#f1f5f9'
    }}>
      {/* Dynamic Fullscreen Video Crossfade Overlay */}
      <VideoBackgroundOverlay />
      {/* Dynamic styles injected directly */}
      <style>{`
        .strategy-input {
          background: rgba(15, 23, 42, 0.95) !important;
          background-color: rgba(15, 23, 42, 0.95) !important;
          border: 1.5px solid rgba(217, 119, 6, 0.5) !important;
          color: #ffffff !important;
          border-radius: 4px !important;
          padding: 0.65rem 0.85rem !important;
          font-size: 0.9rem !important;
          font-weight: 600 !important;
          width: 100% !important;
          box-sizing: border-box !important;
          outline: none !important;
          transition: all 0.2s ease !important;
        }
        .strategy-phone-prefix {
          display: flex;
          align-items: center;
          padding: 0.65rem 0.85rem;
          background: rgba(15, 23, 42, 0.95);
          border: 1.5px solid rgba(217, 119, 6, 0.5);
          border-right: none !important;
          border-radius: 4px 0 0 4px !important;
          color: #fbbf24;
          font-size: 0.9rem;
          font-weight: 900;
          user-select: none;
          box-sizing: border-box;
        }
        .strategy-phone-input {
          border-radius: 0 4px 4px 0 !important;
          border-left: none !important;
        }
        :root[data-theme="light"] input.strategy-input,
        :root[data-theme="dark"] input.strategy-input,
        input.strategy-input {
          background: rgba(15, 23, 42, 0.95) !important;
          background-color: rgba(15, 23, 42, 0.95) !important;
          border: 1.5px solid rgba(217, 119, 6, 0.5) !important;
          color: #ffffff !important;
        }
        .strategy-input::placeholder {
          color: rgba(255, 255, 255, 0.45) !important;
        }
        :root[data-theme="light"] input.strategy-input:focus,
        :root[data-theme="dark"] input.strategy-input:focus,
        input.strategy-input:focus {
          border-color: #f59e0b !important;
          box-shadow: 0 0 10px rgba(245, 158, 11, 0.5) !important;
          background: rgba(17, 24, 39, 0.98) !important;
          background-color: rgba(17, 24, 39, 0.98) !important;
          color: #ffffff !important;
        }
        .social-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: 1.5px solid rgba(245, 158, 11, 0.5);
          background: rgba(15, 23, 42, 0.9);
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer;
          transition: all 0.2s;
          color: #f59e0b;
          padding: 0 !important;
          box-sizing: border-box !important;
        }
        .social-btn:hover {
          transform: translateY(-2px);
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.18);
          box-shadow: 0 0 12px rgba(245, 158, 11, 0.5);
        }
        .social-btn svg {
          width: 20px;
          height: 20px;
          color: #f59e0b;
          transition: color 0.2s;
        }
        .social-btn:hover svg {
          color: #fbbf24;
        }
        /* Custom scrollbar inside the auth card */
        .auth-scrollable::-webkit-scrollbar {
          width: 6px;
        }
        .auth-scrollable::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .auth-scrollable::-webkit-scrollbar-thumb {
          background: rgba(245, 158, 11, 0.4);
          border-radius: 3px;
        }
        .auth-scrollable::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 158, 11, 0.6);
        }
        @media (max-width: 1024px) {
          .auth-footer-links {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .tactic-bg {
            background-position: 65% center !important;
          }
        }          4% { opacity: 1; }
          96% { opacity: 1; }
          100% { left: -300px; opacity: 0; }
        }

        /* Slow rotating logo compass lines */
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>

      {/* Spotlight overlay mask */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.1) 0%, rgba(15, 23, 42, 0.35) 100%)',
        pointerEvents: 'none',
        zIndex: 1
      }} />
      {/* CENTER REGISTRATION & MAIN LOGIN CORE CONSOLE */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        width: '92%',
        maxWidth: '430px',
        maxHeight: '88vh',
        background: 'linear-gradient(135deg, rgba(20, 25, 40, 0.98) 0%, rgba(8, 10, 18, 0.99) 100%)',
        border: '2.5px solid #d97706',
        borderTop: '5px solid #fbbf24',
        borderRadius: '8px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.95), 0 0 35px rgba(217, 119, 6, 0.2)',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        {/* Scrollable Container wrapper */}
        <div className="auth-scrollable" style={{
          overflowY: 'auto',
          padding: '1.75rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          {/* Emblem & Tactical Banner */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* AAA-Grade Animated Golden Metallic Logo Emblem */}
            <div style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'center' }}>
              <svg viewBox="0 0 100 100" width="85" height="85" style={{ filter: 'drop-shadow(0 0 15px rgba(251, 191, 36, 0.45))' }}>
                <defs>
                  {/* Metallic Gold Gradient */}
                  <linearGradient id="gold-metal" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fffbeb" />
                    <stop offset="25%" stopColor="#fbbf24" />
                    <stop offset="50%" stopColor="#d97706" />
                    <stop offset="75%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                  
                  {/* Metallic Gold Secondary */}
                  <linearGradient id="gold-bright" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#d97706" />
                    <stop offset="50%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>

                  {/* Deep Red Crimson shield gradient */}
                  <radialGradient id="shield-crimson" cx="50%" cy="45%" r="65%">
                    <stop offset="0%" stopColor="#dc2626" />
                    <stop offset="60%" stopColor="#7f1d1d" />
                    <stop offset="100%" stopColor="#450a0a" />
                  </radialGradient>

                  {/* Neon red glow filter */}
                  <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  {/* Crescent mask: white circle represents the moon shape, black circle bites it from the right */}
                  <mask id="crescent-mask">
                    <rect x="0" y="0" width="100" height="100" fill="black" />
                    <circle cx="47" cy="50" r="7.5" fill="white" />
                    <circle cx="51.5" cy="50" r="7.5" fill="black" />
                  </mask>
                </defs>

                {/* Outer spinning tactical radar circle */}
                <circle cx="50" cy="50" r="46" fill="none" stroke="url(#gold-metal)" strokeWidth="1.2" strokeDasharray="8 4" style={{ transformOrigin: 'center', animation: 'spin-slow 25s linear infinite' }} />
                
                {/* Inner reverse-spinning compass ring */}
                <circle cx="50" cy="50" r="42" fill="none" stroke="url(#gold-bright)" strokeWidth="1" strokeDasharray="30 8" style={{ transformOrigin: 'center', animation: 'spin-reverse 18s linear infinite', opacity: 0.7 }} />

                {/* Tactical Radar Crosshairs */}
                <line x1="50" y1="2" x2="50" y2="8" stroke="url(#gold-metal)" strokeWidth="1.5" />
                <line x1="50" y1="92" x2="50" y2="98" stroke="url(#gold-metal)" strokeWidth="1.5" />
                <line x1="2" y1="50" x2="8" y2="50" stroke="url(#gold-metal)" strokeWidth="1.5" />
                <line x1="92" y1="50" x2="98" y2="50" stroke="url(#gold-metal)" strokeWidth="1.5" />

                {/* 3 Stars representing Politics, Economy, Geostrategy - Glowing Gold */}
                <g filter="url(#neon-glow)">
                  <path d="M50 12 L52.5 17 L57.5 17 L53.5 20 L55 25 L50 22 L45 25 L46.5 20 L42.5 17 L47.5 17 Z" fill="url(#gold-metal)" />
                  <path d="M20 40 L22.5 43 L27.5 42 L24.5 45.5 L26 50.5 L22 48 L18 50.5 L19.5 45.5 L16.5 42 L21.5 43 Z" fill="url(#gold-metal)" />
                  <path d="M80 40 L82.5 43 L87.5 42 L84.5 45.5 L86 50.5 L82 48 L78 50.5 L79.5 45.5 L76.5 42 L81.5 43 Z" fill="url(#gold-metal)" />
                </g>

                {/* Outer Shield Frame (with mechanical corners) */}
                <path d="M30 32 L50 25 L70 32 L70 56 C70 68 50 78 50 78 C50 78 30 68 30 56 Z" fill="none" stroke="url(#gold-metal)" strokeWidth="3" strokeLinejoin="round" />
                
                {/* Inner Shield Body */}
                <path d="M32 34 L50 27 L68 34 L68 55 C68 66 50 75 50 75 C50 75 32 66 32 55 Z" fill="url(#shield-crimson)" stroke="#450a0a" strokeWidth="1" strokeLinejoin="round" />

                {/* Glowing Crescent & Star inside Shield (using absolute positioning & SVG Masking) */}
                <g filter="url(#neon-glow)">
                  {/* Crescent Moon */}
                  <circle cx="47" cy="50" r="7.5" fill="url(#gold-metal)" mask="url(#crescent-mask)" />
                  {/* Perfect Star */}
                  <polygon points="56.3,47.2 57.2,49.8 59.6,49.8 57.7,51.2 58.4,53.5 56.3,52.1 54.2,53.5 54.9,51.2 53.0,49.8 55.4,49.8" fill="url(#gold-metal)" />
                </g>
              </svg>
            </div>
            
            {/* Brand Logo & Name */}
            <h1 style={{
              fontSize: '2.4rem',
              fontWeight: 950,
              letterSpacing: '0.15em',
              color: '#ffffff',
              margin: 0,
              fontFamily: "'Outfit', sans-serif",
              textShadow: '0 0 12px rgba(251, 191, 36, 0.6), 0 0 24px rgba(217, 119, 6, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}>
              <span style={{ color: '#fbbf24' }}>KABİNE</span>
            </h1>
            <div style={{
              fontSize: '0.78rem',
              color: '#f59e0b',
              fontWeight: 900,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              marginTop: '0.25rem',
              borderTop: '1px solid rgba(251, 191, 36, 0.25)',
              borderBottom: '1px solid rgba(251, 191, 36, 0.25)',
              padding: '0.35rem 1.2rem',
              background: 'rgba(251, 191, 36, 0.03)'
            }}>
              SİYASET • EKONOMİ • JEOSTRATEJİ
            </div>
          </div>

          {/* Display Error Panel if any */}
          {error && (
            <div style={{
              padding: '0.65rem 0.85rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1.5px solid #f87171',
              borderRadius: '4px',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              textAlign: 'center',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Main Tab Toggle - Premium Amber/Gold and Slate Theme */}
          <div style={{
            display: 'flex',
            background: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '6px',
            padding: '0.3rem',
            border: '1.5px solid rgba(217, 119, 6, 0.35)',
            gap: '0.4rem'
          }}>
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              style={{
                flex: 1,
                background: isLogin ? 'rgba(217, 119, 6, 0.15)' : 'transparent',
                border: isLogin ? '1.5px solid #fbbf24' : '1.5px solid transparent',
                borderRadius: '4px',
                padding: '0.65rem 0.5rem',
                color: isLogin ? '#fbbf24' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.85rem',
                fontWeight: 900,
                letterSpacing: '0.07em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textShadow: isLogin ? '0 0 8px rgba(251, 191, 36, 0.3)' : 'none',
                boxShadow: isLogin ? 'inset 0 0 10px rgba(217, 119, 6, 0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <LogIn size={14} style={{ color: isLogin ? '#fbbf24' : 'rgba(255,255,255,0.5)' }} />
              GİRİŞ YAP
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              style={{
                flex: 1,
                background: !isLogin ? 'rgba(217, 119, 6, 0.15)' : 'transparent',
                border: !isLogin ? '1.5px solid #fbbf24' : '1.5px solid transparent',
                borderRadius: '4px',
                padding: '0.65rem 0.5rem',
                color: !isLogin ? '#fbbf24' : 'rgba(255, 255, 255, 0.5)',
                fontSize: '0.85rem',
                fontWeight: 900,
                letterSpacing: '0.07em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textShadow: !isLogin ? '0 0 8px rgba(251, 191, 36, 0.3)' : 'none',
                boxShadow: !isLogin ? 'inset 0 0 10px rgba(217, 119, 6, 0.15)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem'
              }}
            >
              <UserPlus size={14} style={{ color: !isLogin ? '#fbbf24' : 'rgba(255,255,255,0.5)' }} />
              KAYIT OL
            </button>
          </div>

          {/* Form */}
          <form 
            onSubmit={handleAuthSubmit} 
            style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}
          >
            {/* Username Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Kullanıcı Adı
              </label>
              <input
                type="text"
                className="strategy-input"
                style={inputStyle}
                placeholder="Kullanıcı Adınız"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Registration fields */}
            {!isLogin && (
              <>
                {/* Phone */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Telefon Numarası
                  </label>
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    <div className="strategy-phone-prefix">
                      +90
                    </div>
                    <input
                      type="tel"
                      className="strategy-input strategy-phone-input"
                      style={inputStyle}
                      placeholder="5XX XXX XX XX"
                      value={phoneNumber}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhoneNumber(cleanVal);
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Character Name & Surname */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Karakter Adı
                    </label>
                    <input
                      type="text"
                      className="strategy-input"
                      style={inputStyle}
                      placeholder="Karakter Adınız"
                      value={charName}
                      onChange={(e) => setCharName(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <label style={{ fontSize: '0.78rem', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Karakter Soyadı
                    </label>
                    <input
                      type="text"
                      className="strategy-input"
                      style={inputStyle}
                      placeholder="Karakter Soyadınız"
                      value={charSurname}
                      onChange={(e) => setCharSurname(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Password */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: 900, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Şifre
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  className="strategy-input"
                  style={inputStyle}
                  placeholder="Şifreniz"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#fbbf24',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 10
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Glowing Deep Red Strategy Action Button */}
            <button
              type="submit"
              style={{
                marginTop: '0.6rem',
                padding: '0.85rem',
                background: 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)',
                border: '2px solid #ef4444',
                borderRadius: '4px',
                color: '#ffffff',
                fontSize: '0.92rem',
                fontWeight: 950,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(185, 28, 28, 0.4)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(239, 68, 68, 0.6)';
                e.currentTarget.style.transform = 'scale(1.015)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(185, 28, 28, 0.4)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              <span>{isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}</span>
            </button>
          </form>

          {/* Social icons decoration */}
          {isLogin && (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ flex: 1, height: '1.5px', background: 'rgba(251, 191, 36, 0.25)' }} />
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  HIZLI GİRİŞ SEÇENEKLERİ
                </span>
                <div style={{ flex: 1, height: '1.5px', background: 'rgba(251, 191, 36, 0.25)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.2rem', marginTop: '0.2rem' }}>
                {/* Facebook Button */}
                <button className="social-btn" title="Facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                  </svg>
                </button>
                {/* Google Button */}
                <button className="social-btn" title="Google">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.746-.08-1.32-.176-1.887H12.24z"/>
                  </svg>
                </button>
                {/* Apple Button */}
                <button className="social-btn" title="Apple">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.2.67-2.92 1.49-.62.71-1.16 1.85-1.01 2.96 1.09.09 2.22-.58 2.94-1.39z"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER STILLFRONT / BYTRO LOGO BRANDING */}
      <div style={{
        position: 'absolute',
        bottom: '0.75rem',
        left: 0,
        right: 0,
        zIndex: 5,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.3rem',
        pointerEvents: 'auto'
      }}>
        <div className="auth-footer-links" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          fontSize: '0.72rem',
          color: 'rgba(255, 255, 255, 0.45)',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          flexWrap: 'wrap',
          justifyContent: 'center',
          padding: '0 1rem'
        }}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveComplianceDoc('terms'); }} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>HİZMET KOŞULLARI</a>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveComplianceDoc('privacy'); }} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>GİZLİLİK POLİTİKASI</a>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveComplianceDoc('cookie'); }} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>ÇEREZ POLİTİKASI</a>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveComplianceDoc('kvkk'); }} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>KVKK AYDINLATMA</a>
          <span>•</span>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveComplianceDoc('support'); }} style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'} onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}>DESTEK AL</a>
        </div>
        <p style={{
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.3)',
          margin: 0,
          letterSpacing: '0.04em',
          fontWeight: 600
        }}>
          © 2026 BAGIO LABS • KABİNE SÜRÜM 1.1
        </p>
      </div>

      {activeComplianceDoc && (
        <ComplianceModal 
          docType={activeComplianceDoc} 
          onClose={() => setActiveComplianceDoc(null)} 
          onSelectDoc={(type) => setActiveComplianceDoc(type)}
        />
      )}
    </div>
  );
};
