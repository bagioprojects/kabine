import React from 'react';

export const mapManagerStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    height: '100%',
    width: '100%',
    fontFamily: '"Outfit", "Inter", sans-serif',
    color: '#f8fafc'
  },
  headerCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(8px)'
  },
  mapIconCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '24px',
    border: '1px solid rgba(59, 130, 246, 0.3)'
  },
  title: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: 0
  },
  subtitle: {
    fontSize: '12px',
    color: '#94a3b8',
    marginTop: '4px',
    marginBottom: 0
  },
  actionBtn: {
    padding: '0 16px',
    height: '40px',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
    transition: 'all 0.2s ease',
  },
  tabsContainer: {
    display: 'flex',
    gap: '24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  tabBtn: {
    padding: '12px 4px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  },
  alert: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid',
    marginTop: '16px',
    fontSize: '13px',
    fontWeight: '500'
  },
  tableCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '20px'
  },
  tableToolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px'
  },
  searchForm: {
    display: 'flex',
    gap: '12px',
    flex: 1,
    maxWidth: '500px'
  },
  searchContainer: {
    position: 'relative',
    flex: 1
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    height: '40px',
    paddingLeft: '40px',
    paddingRight: '12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    transition: 'all 0.2s ease'
  },
  searchBtn: {
    height: '40px',
    padding: '0 18px',
    borderRadius: '8px',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  resultCount: {
    fontSize: '13px',
    color: '#94a3b8'
  },
  loadingSpinnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '48px 0'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  thRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
  },
  th: {
    textAlign: 'left',
    padding: '14px 16px',
    fontSize: '12px',
    textTransform: 'uppercase',
    color: '#94a3b8',
    fontWeight: 'bold',
    letterSpacing: '0.5px'
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    transition: 'background-color 0.2s',
    cursor: 'default'
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#f8fafc'
  },
  residenceCountBadge: {
    padding: '2px 8px',
    borderRadius: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '12px'
  },
  statusHasMap: {
    color: '#10b981',
    fontWeight: '600'
  },
  statusCustomMap: {
    color: '#38bdf8',
    fontWeight: '600'
  },
  statusNoMap: {
    color: '#94a3b8'
  },
  assignActionBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: '#cbd5e1',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '20px'
  },
  pageBtn: {
    padding: '8px 14px',
    borderRadius: '8px',
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255,255,255,0.06)',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  pageIndicator: {
    fontSize: '13px',
    color: '#94a3b8'
  },
  mapsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px'
  },
  emptyMapsBox: {
    gridColumn: '1 / -1',
    padding: '60px 24px',
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    border: '2px dashed rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    textAlign: 'center',
    color: '#94a3b8'
  },
  mapCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '16px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '140px',
    transition: 'all 0.2s ease',
  },
  mapCardHeader: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  mapCardIcon: {
    fontSize: '28px'
  },
  mapCardName: {
    margin: 0,
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff'
  },
  mapCardGridSize: {
    fontSize: '11px',
    color: '#38bdf8',
    fontWeight: 'bold'
  },
  mapCardFooter: {
    display: 'flex',
    gap: '10px'
  },
  designBtn: {
    flex: 1,
    height: '32px',
    borderRadius: '6px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  deleteBtn: {
    height: '32px',
    padding: '0 12px',
    borderRadius: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  // Editor
  editorHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: '16px',
    padding: '16px 24px',
    border: '1px solid rgba(255, 255, 255, 0.05)'
  },
  backBtn: {
    padding: '0 14px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  editorTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: 0
  },
  editorSubtitle: {
    fontSize: '11px',
    color: '#94a3b8',
    margin: '2px 0 0 0'
  },
  saveBtn: {
    padding: '0 18px',
    height: '38px',
    borderRadius: '8px',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.2s'
  },
  editorBody: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    flex: 1
  },
  paletteCard: {
    width: '320px',
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '750px',
    overflowY: 'auto',
    flexShrink: 0
  },
  sectionHeading: {
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#ffffff',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: '0 0 12px 0'
  },
  toolGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    marginBottom: '16px'
  },
  toolBtn: {
    height: '34px',
    fontSize: '11px',
    fontWeight: '700',
    borderRadius: '6px',
    border: '1px solid',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s'
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: '16px 0'
  },
  infoBox: {
    display: 'flex',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.2)',
    borderRadius: '8px',
    padding: '10px 12px',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  tileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  tileSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  colorPreview: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    flexShrink: 0
  },
  buildingIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '18px',
    flexShrink: 0
  },
  tileName: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#ffffff',
    display: 'block'
  },
  tileDesc: {
    fontSize: '10px',
    color: '#94a3b8',
    margin: '2px 0 0 0'
  },
  canvasCard: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.2)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    padding: '24px',
    overflow: 'hidden'
  },
  canvasHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px'
  },
  canvasTitle: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: 0
  },
  canvasWrapper: {
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.06)'
  },
  // Modals
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
    zIndex: 999
  },
  modalContent: {
    width: '90%',
    maxWidth: '450px',
    backgroundColor: '#0f172a',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: '0 0 20px 0',
    letterSpacing: '0.5px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px'
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#94a3b8'
  },
  input: {
    height: '40px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none'
  },
  selectInput: {
    height: '40px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    fontWeight: '600'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px'
  },
  cancelBtn: {
    padding: '0 16px',
    height: '38px',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  submitBtn: {
    padding: '0 18px',
    height: '38px',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.2)'
  }
};
