import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, User, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // XML / XSS güvenlik denetimi filtresi (XML Injection, XXE, DTD ve XSS koruması)
  const cleanInput = (input: string): string => {
    return input
      .replace(/<\?xml.*\?>/gi, '')
      .replace(/<!DOCTYPE.*>/gi, '')
      .replace(/<!ENTITY.*>/gi, '')
      .replace(/SYSTEM/gi, '')
      .replace(/PUBLIC/gi, '')
      .replace(/<script.*?>.*?<\/script>/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/[<>]/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setError('Kullanıcı adı alanı boş bırakılamaz.');
      return;
    }

    if (!password) {
      setError('Şifre alanı boş bırakılamaz.');
      return;
    }

    // XML/XSS güvenlik taraması
    const sanitizedUsername = cleanInput(cleanUsername);
    const sanitizedPassword = cleanInput(password);
    if (sanitizedUsername !== cleanUsername || sanitizedPassword !== password) {
      setError('Girdilerinizde tehlikeli XML veya betik karakterleri tespit edildi!');
      return;
    }

    setLoading(true);

    try {
      // Login API çağrısı
      const response = await axios.post('http://localhost:3000/api/v1/admin/login', {
        username: cleanUsername,
        password: password,
      });

      if (response.data && response.data.success) {
        const { token, user } = response.data;

        // Admin rol kontrolü (Üyelik türü kısıtlaması)
        if (!user.isAdmin) {
          setError('Yetkisiz erişim: Bu panele giriş yapmak için yönetici (Admin) yetkiniz olmalıdır.');
          setLoading(false);
          return;
        }

        setSuccess(true);
        localStorage.setItem('adminToken', token);
        localStorage.setItem('adminUser', JSON.stringify(user));

        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      } else {
        setError(response.data.message || 'Giriş başarısız oldu.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Sunucuyla bağlantı kurulamadı. Lütfen API servisinin çalıştığından emin olun.');
    } finally {
      if (!success) {
        setLoading(false);
      }
    }
  };

  return (
    <div style={styles.container}>
      {/* Background decoration */}
      <div style={styles.bgBlob1} />
      <div style={styles.bgBlob2} />

      <div style={styles.loginCard}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>🛡️</div>
          <h2 style={styles.title}>KABİNE</h2>
          <p style={styles.subtitle}>Merkezi Yönetim ve Denetim Masası</p>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <ShieldAlert size={18} color="#ffffff" style={{ marginRight: '8px', flexShrink: 0 }} />
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {success && (
          <div style={styles.successBox}>
            <CheckCircle2 size={18} color="#ffffff" style={{ marginRight: '8px', flexShrink: 0 }} />
            <span style={styles.successText}>Yönetici kimliği doğrulandı. Yönlendiriliyorsunuz...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Kullanıcı Adı</label>
            <div style={styles.inputWrapper}>
              <input
                type="text"
                placeholder="Yönetici kullanıcı adı"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading || success}
                style={{ ...styles.input, paddingLeft: '16px' }}
              />
              <User size={18} color="#64748b" style={styles.inputIcon} />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Yönetici Şifresi</label>
            <div style={styles.inputWrapper}>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || success}
                style={{ ...styles.input, paddingLeft: '16px' }}
              />
              <Lock size={18} color="#64748b" style={styles.inputIcon} />
            </div>
          </div>

          <button type="submit" disabled={loading || success} style={styles.submitBtn}>
            {loading ? 'Bağlanıyor...' : 'Yönetim Paneline Giriş Yap'}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Devlet Güvenlik Protokolü v4.12</span>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    fontFamily: '"Outfit", "Inter", sans-serif',
    overflow: 'hidden',
    position: 'relative',
  },
  bgBlob1: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(255,255,255,0) 70%)',
    top: '-100px',
    left: '-100px',
    zIndex: 1,
  },
  bgBlob2: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, rgba(255,255,255,0) 70%)',
    bottom: '-150px',
    right: '-150px',
    zIndex: 1,
  },
  loginCard: {
    width: '420px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    padding: '40px',
    boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08)',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '28px',
    margin: '0 auto 16px auto',
    boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.1)',
  },
  title: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#0f172a',
    margin: 0,
    letterSpacing: '1.5px',
  },
  subtitle: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '6px',
    fontWeight: '500',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    letterSpacing: '0.5px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  prefix: {
    position: 'absolute',
    left: '14px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#0f172a',
  },
  input: {
    width: '100%',
    height: '46px',
    paddingLeft: '48px',
    paddingRight: '40px',
    borderRadius: '12px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: '500',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputIcon: {
    position: 'absolute',
    right: '14px',
  },
  submitBtn: {
    height: '48px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '8px',
    boxShadow: '0 8px 20px -6px rgba(15, 23, 42, 0.3)',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  errorBox: {
    backgroundColor: 'rgba(127, 29, 29, 0.95)',
    border: '1.5px solid #ef4444',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
  },
  errorText: {
    fontSize: '13px',
    color: '#ffffff',
    fontWeight: '700',
    lineHeight: '18px',
  },
  successBox: {
    backgroundColor: 'rgba(6, 78, 59, 0.95)',
    border: '1.5px solid #10b981',
    borderRadius: '12px',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
  },
  successText: {
    fontSize: '13px',
    color: '#ffffff',
    fontWeight: '700',
    lineHeight: '18px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '32px',
    fontSize: '10px',
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: '0.5px',
  },
};
