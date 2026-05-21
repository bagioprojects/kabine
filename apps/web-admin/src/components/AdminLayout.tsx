import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  TrendingUp, 
  Gavel, 
  Truck, 
  LogOut, 
  ShieldCheck,
  Menu,
  X as CloseIcon,
  Map,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('adminSidebarCollapsed') === 'true';
  });
  const [isMapsDropdownOpen, setIsMapsDropdownOpen] = useState(() => {
    return location.pathname === '/maps' || location.pathname === '/models';
  });
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save collapse state to localStorage
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('adminSidebarCollapsed', String(newState));
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/login');
  };

  // Main navigation items
  const menuItems = [
    { path: '/dashboard', label: 'Yönetim Masası', icon: <LayoutDashboard size={20} /> },
    { path: '/users', label: 'Vatandaşlar', icon: <Users size={20} /> },
    { path: '/market', label: 'Borsa & Emtia', icon: <TrendingUp size={20} /> },
    { path: '/politics', label: 'Meclis & Yasalar', icon: <Gavel size={20} /> },
    { path: '/logistics', label: 'Lojistik & Tırlar', icon: <Truck size={20} /> },
  ];

  const sidebarWidth = isMobile ? '260px' : (isCollapsed ? '80px' : '260px');

  return (
    <div style={styles.container}>
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`mobile-sidebar-overlay ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Left Sidebar */}
      <aside 
        className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`} 
        style={{
          ...styles.sidebar,
          width: sidebarWidth,
          position: isMobile ? 'fixed' : 'relative',
        }}
      >
        {/* Collapse Toggle Button (Desktop Only) */}
        {!isMobile && (
          <button 
            onClick={toggleCollapse}
            style={styles.collapseToggleBtn}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}

        {/* Logo Section */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>🛡️</div>
          {(!isCollapsed || isMobile) && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={styles.logoText}>KABİNE</h1>
              <span style={styles.logoBadge}>Yönetici Paneli</span>
            </div>
          )}
          {isMobile && (
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              style={styles.closeSidebarBtn}
            >
              <CloseIcon size={20} />
            </button>
          )}
        </div>

        {/* User Profile Card */}
        <div style={{
          ...styles.profileCard,
          padding: isCollapsed && !isMobile ? '12px 0' : '16px 12px',
          justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
        }}>
          <div style={{
            ...styles.avatar,
            width: isCollapsed && !isMobile ? '40px' : '48px',
            height: isCollapsed && !isMobile ? '40px' : '48px',
            fontSize: isCollapsed && !isMobile ? '16px' : '18px',
          }}>
            {adminUser.characterName ? adminUser.characterName[0] : 'A'}
          </div>
          {(!isCollapsed || isMobile) && (
            <div style={styles.profileDetails}>
              <span style={styles.profileName}>
                {adminUser.characterName || 'Yönetici'} {adminUser.characterSurname || ''}
              </span>
              <span style={styles.profileRole}>
                <ShieldCheck size={12} color="#10b981" style={{ marginRight: '4px' }} />
                Sistem Yetkilisi
              </span>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav style={{
          ...styles.nav,
          padding: isCollapsed && !isMobile ? '12px 6px' : '12px',
        }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                onClick={() => isMobile && setIsSidebarOpen(false)}
                title={isCollapsed ? item.label : undefined}
                style={{
                  ...styles.navLink,
                  backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                  color: isActive ? '#2563eb' : '#475569',
                  fontWeight: isActive ? '700' : '500',
                  justifyContent: isCollapsed && !isMobile ? 'center' : 'flex-start',
                }}
              >
                <span style={{ 
                  color: isActive ? '#2563eb' : '#64748b',
                  marginRight: isCollapsed && !isMobile ? '0' : '12px',
                  display: 'flex',
                  alignItems: 'center' 
                }}>
                  {item.icon}
                </span>
                {(!isCollapsed || isMobile) && <span>{item.label}</span>}
              </Link>
            );
          })}

          {/* Harita Yönetimi Dropdown Menu */}
          <div style={styles.dropdownContainer}>
            <button 
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                  localStorage.setItem('adminSidebarCollapsed', 'false');
                }
                setIsMapsDropdownOpen(!isMapsDropdownOpen);
              }}
              title={isCollapsed ? "Harita Yönetimi" : undefined}
              style={{
                ...styles.navLink,
                width: '100%',
                border: 'none',
                backgroundColor: location.pathname === '/maps' ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
                color: location.pathname === '/maps' ? '#2563eb' : '#475569',
                fontWeight: location.pathname === '/maps' ? '600' : '500',
                justifyContent: isCollapsed && !isMobile ? 'center' : 'space-between',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ 
                  color: location.pathname === '/maps' ? '#2563eb' : '#64748b',
                  marginRight: isCollapsed && !isMobile ? '0' : '12px',
                  display: 'flex',
                  alignItems: 'center' 
                }}>
                  <Map size={20} />
                </span>
                {(!isCollapsed || isMobile) && <span>Harita Yönetimi</span>}
              </div>
              {(!isCollapsed || isMobile) && (
                isMapsDropdownOpen ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />
              )}
            </button>

            {/* Dropdown Items (Şehir Haritaları & Modeller) */}
            {isMapsDropdownOpen && (!isCollapsed || isMobile) && (
              <div style={styles.submenu}>
                <Link
                  to="/maps"
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                  style={{
                    ...styles.submenuLink,
                    color: location.pathname === '/maps' ? '#2563eb' : '#64748b',
                    fontWeight: location.pathname === '/maps' ? '600' : '400',
                    backgroundColor: location.pathname === '/maps' ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                  }}
                >
                  <span style={styles.submenuDot} />
                  Şehir Haritaları
                </Link>

                <Link
                  to="/models"
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                  style={{
                    ...styles.submenuLink,
                    color: location.pathname === '/models' ? '#2563eb' : '#64748b',
                    fontWeight: location.pathname === '/models' ? '600' : '400',
                    backgroundColor: location.pathname === '/models' ? 'rgba(37, 99, 235, 0.05)' : 'transparent',
                  }}
                >
                  <span style={styles.submenuDot} />
                  Modeller
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Sidebar Footer (Logout Button) */}
        <div style={{
          ...styles.sidebarFooter,
          padding: isCollapsed && !isMobile ? '20px 8px' : '20px 16px',
        }}>
          <button 
            onClick={handleLogout} 
            title={isCollapsed ? "Oturumu Kapat" : undefined}
            style={{
              ...styles.logoutBtn,
              padding: isCollapsed && !isMobile ? '12px 0' : '0 16px',
            }}
          >
            <LogOut size={18} style={{ marginRight: isCollapsed && !isMobile ? '0' : '8px' }} />
            {(!isCollapsed || isMobile) && <span>Oturumu Kapat</span>}
          </button>
        </div>
      </aside>

      {/* Right Main Content Area */}
      <div style={styles.mainContent}>
        {/* Floating Mobile Sidebar Trigger (Header replacement for mobile view only) */}
        {isMobile && (
          <header style={styles.mobileHeader}>
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              style={styles.menuToggleBtn}
            >
              <Menu size={22} color="#ffffff" />
            </button>
            <span style={styles.mobileHeaderTitle}>KABİNE YÖNETİMİ</span>
          </header>
        )}

        {/* Dynamic Page Content */}
        <main style={{
          ...styles.contentBody,
          padding: isMobile ? '16px' : '32px',
          marginTop: isMobile ? '60px' : '0' // spacing for floating header on mobile
        }}>
          {children}
        </main>
      </div>

      {/* Cyberpunk Style Maintenance Modal */}
      {showMaintenanceModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <AlertTriangle size={32} color="#f59e0b" style={{ marginBottom: '12px' }} />
              <h3 style={styles.modalTitle}>MODÜL BAKIM AŞAMASINDA</h3>
            </div>
            <p style={styles.modalBody}>
              Seçtiğiniz <strong>"Modeller"</strong> modülü şu anda geliştirme ve bakım aşamasındadır. En kısa sürede sistem yetkililerinin kullanımına açılacaktır.
            </p>
            <button 
              onClick={() => setShowMaintenanceModal(false)}
              style={styles.modalCloseBtn}
            >
              Anlaşıldı
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#070f1e', // Sleek dark siberpunk/premium background
    color: '#f8fafc',
    fontFamily: '"Outfit", "Inter", sans-serif',
    overflow: 'hidden',
  },
  sidebar: {
    backgroundColor: 'rgba(11, 22, 44, 0.95)',
    backdropFilter: 'blur(16px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flexShrink: 0,
    zIndex: 99,
    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative'
  },
  collapseToggleBtn: {
    position: 'absolute',
    right: '-12px',
    top: '28px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 100,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
    transition: 'all 0.2s ease',
  },
  logoSection: {
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    boxShadow: '0 0 10px rgba(59, 130, 246, 0.2)',
  },
  logoText: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '1.5px',
  },
  logoBadge: {
    fontSize: '9px',
    fontWeight: '600',
    color: '#38bdf8',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    padding: '1px 5px',
    borderRadius: '4px',
    marginTop: '2px',
    display: 'inline-block',
  },
  closeSidebarBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
  },
  profileCard: {
    margin: '16px 12px 8px 12px',
    padding: '16px 12px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(15, 23, 42, 0.6))',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    overflow: 'hidden',
  },
  profileDetails: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  profileName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  profileRole: {
    fontSize: '10px',
    color: '#10b981',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    marginTop: '3px',
  },
  avatar: {
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    boxShadow: '0 0 12px rgba(37, 99, 235, 0.4)',
    flexShrink: 0,
    border: '2px solid rgba(255, 255, 255, 0.1)',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    overflowY: 'auto',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    color: '#94a3b8',
  },
  dropdownContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  submenu: {
    paddingLeft: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginTop: '2px',
    borderLeft: '1px solid rgba(255, 255, 255, 0.05)',
    marginLeft: '24px',
  },
  submenuLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '13px',
    transition: 'all 0.2s ease',
    color: '#94a3b8',
  },
  submenuDot: {
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    marginRight: '8px',
  },
  maintenanceBadge: {
    fontSize: '9px',
    color: '#f59e0b',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    border: '1px solid rgba(245, 158, 11, 0.2)',
    padding: '1px 5px',
    borderRadius: '4px',
    fontWeight: '600'
  },
  sidebarFooter: {
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  },
  logoutBtn: {
    width: '100%',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.04)',
    color: '#f87171',
    border: '1px solid rgba(239, 68, 68, 0.1)',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  mobileHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '60px',
    backgroundColor: '#0b162c',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    gap: '12px',
    zIndex: 98,
  },
  mobileHeaderTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    color: '#ffffff'
  },
  menuToggleBtn: {
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentBody: {
    flex: 1,
    overflowY: 'auto',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(3, 7, 18, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  modalContent: {
    width: '90%',
    maxWidth: '400px',
    backgroundColor: '#0f172a',
    border: '1px solid rgba(245, 158, 11, 0.3)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(245, 158, 11, 0.1)',
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: 0,
    letterSpacing: '1px',
  },
  modalBody: {
    fontSize: '14px',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: '16px 0 24px 0',
  },
  modalCloseBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#eab308',
    color: '#0f172a',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 10px -2px rgba(234, 179, 8, 0.3)',
    transition: 'all 0.2s ease',
  }
};
