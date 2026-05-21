import { StyleSheet, Platform } from 'react-native';

export const createStyles = (insets: { top?: number; bottom?: number } | null | undefined, width: number, height: number) => {
  const isTablet = width >= 768;
  const insetTop = insets?.top ?? 0;
  const insetBottom = insets?.bottom ?? 0;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#02040a', // Solid deep cyber black
    },
    
    // 2D Scrollable Map Canvas System
    mapCanvasScrollContainer: {
      flex: 1,
    },
    mapCanvas: {
      width: 900,
      height: 900,
      position: 'relative',
      backgroundColor: '#070b16',
    },
    mapCanvasImage: {
      position: 'absolute',
      width: 900,
      height: 900,
    },

    // Floating Zoom Controls (Left side above return button)
    zoomControlContainer: {
      position: 'absolute',
      left: 16,
      bottom: Math.max(insetBottom, 16) + 85, // Positioned safely above return button
      zIndex: 12,
      gap: 10,
    },
    zoomBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderWidth: 1.5,
      borderColor: 'rgba(56, 189, 248, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#38BDF8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    },
    zoomBtnText: {
      color: '#38BDF8',
      fontSize: 20,
      fontWeight: '900',
    },

    // Dynamic React Navigation Header custom styles
    headerRightContainer: {
      flexDirection: 'row',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: 10,
      padding: 2,
      marginRight: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    headerSwitcherBtn: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerSwitcherBtnActive: {
      backgroundColor: '#38BDF8',
    },
    headerSwitcherText: {
      fontSize: 9,
      fontWeight: '800',
      color: '#94A3B8',
    },
    headerSwitcherTextActive: {
      color: '#0F172A',
    },

    // Slim floating stats bar right below React Navigation Header
    statsBar: {
      position: 'absolute',
      top: 12,
      left: 16,
      right: 16,
      backgroundColor: 'rgba(11, 19, 43, 0.85)',
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: 'rgba(56, 189, 248, 0.25)',
      paddingVertical: 10,
      paddingHorizontal: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 10,
      shadowColor: '#38BDF8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 5,
    },
    statsBarPill: {
      backgroundColor: 'rgba(56, 189, 248, 0.15)',
      borderColor: 'rgba(56, 189, 248, 0.3)',
      borderWidth: 1,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    statsBarPillText: {
      fontSize: 8,
      color: '#38BDF8',
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    compactStatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    compactStat: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    compactStatLabel: {
      fontSize: 8,
      color: '#64748B',
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    compactStatValue: {
      fontSize: 10,
      fontWeight: '800',
      color: '#E2E8F0',
    },

    // 3D Image & Hotspot Overlays (Fixed Pixel coordinates inside 900x900 canvas)
    buildingHotspot: {
      position: 'absolute',
      borderRadius: 24,
      borderWidth: 2,
      borderColor: 'transparent',
      justifyContent: 'center',
      alignItems: 'center',
    },
    buildingHotspotSelected: {
      borderColor: 'rgba(56, 189, 248, 0.8)',
      backgroundColor: 'rgba(56, 189, 248, 0.08)',
      shadowColor: '#38BDF8',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 15,
      elevation: 10,
    },
    hotspotBadge: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      borderWidth: 1.5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 14,
      position: 'absolute',
      bottom: -12,
      alignSelf: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    hotspotBadgeText: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.5,
    },

    // LIST VIEW SYSTEM
    listViewContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    listViewContent: {
      paddingTop: 68, // Space for statsBar
      paddingBottom: Math.max(insetBottom, 16) + 90, // Space for back button
    },
    listHeaderTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: '#38BDF8',
      marginBottom: 16,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    buildingCard: {
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.06)',
      marginBottom: 16,
      overflow: 'hidden',
      flexDirection: 'row',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
    cardIndicator: {
      width: 6,
      height: '100%',
    },
    cardContent: {
      flex: 1,
      padding: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    cardTitleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    cardIcon: {
      fontSize: 18,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#F8FAFC',
    },
    cardBtn: {
      backgroundColor: 'rgba(56, 189, 248, 0.15)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(56, 189, 248, 0.3)',
    },
    cardBtnText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#38BDF8',
    },
    cardDesc: {
      fontSize: 11,
      color: '#94A3B8',
      lineHeight: 16,
      marginBottom: 12,
    },
    cardStatsRow: {
      flexDirection: 'row',
      backgroundColor: 'rgba(7, 11, 22, 0.4)',
      borderRadius: 12,
      padding: 8,
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.03)',
    },
    cardStatItem: {
      alignItems: 'center',
      flex: 1,
    },
    cardStatLabel: {
      fontSize: 7,
      color: '#64748B',
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    cardStatValue: {
      fontSize: 10,
      fontWeight: '800',
      color: '#E2E8F0',
    },

    // Bottom Action Bar replacing Navbar
    bottomActionBar: {
      position: 'absolute',
      bottom: Math.max(insetBottom, 16),
      left: 16,
      right: 16,
      zIndex: 10,
    },
    backButton: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)', // Glassmorphic slate 900
      borderWidth: 1.5,
      borderColor: 'rgba(244, 63, 94, 0.6)', // Crimson red border glow
      borderRadius: 20,
      paddingVertical: 14,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 10,
      shadowColor: '#f43f5e',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 6,
    },
    backButtonIcon: {
      fontSize: 16,
      color: '#f43f5e',
    },
    backButtonText: {
      color: '#f43f5e',
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },

    // ULTRA-PREMIUM FULL SCREEN MODAL
    fullScreenModal: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(5, 8, 16, 0.98)', // Premium dark glass blur simulation
      zIndex: 100,
    },
    modalSafeArea: {
      flex: 1,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1.5,
      borderBottomColor: 'rgba(255, 255, 255, 0.05)',
      marginTop: Platform.OS === 'ios' ? 0 : 8,
    },
    modalTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
    },
    modalIconCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
    },
    modalIconText: {
      fontSize: 22,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: '#F8FAFC',
      letterSpacing: 0.5,
      flex: 1,
    },
    modalCloseBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(244, 63, 94, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(244, 63, 94, 0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalCloseBtnText: {
      fontSize: 16,
      color: '#f43f5e',
      fontWeight: '900',
    },
    modalScroll: {
      flex: 1,
    },
    modalScrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    modalDescriptionBox: {
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      padding: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
      marginBottom: 20,
    },
    modalSectionLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: '#38BDF8',
      marginBottom: 8,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    modalDescription: {
      fontSize: 13,
      color: '#CBD5E1',
      lineHeight: 20,
    },
    modalStatsGrid: {
      gap: 12,
      marginBottom: 24,
    },
    modalStatCard: {
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      borderRadius: 16,
      padding: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.05)',
    },
    modalStatLabel: {
      fontSize: 12,
      color: '#94A3B8',
      fontWeight: '600',
    },
    modalStatValue: {
      fontSize: 14,
      fontWeight: '900',
    },
    modalActionsBlock: {
      gap: 14,
      marginBottom: 24,
    },
    modalActionTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: '#38BDF8',
      marginBottom: 4,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    modalBtnPrimary: {
      borderRadius: 18,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    modalBtnPrimaryText: {
      fontSize: 13,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    modalBtnSecondary: {
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      borderRadius: 18,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    modalBtnSecondaryText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#E2E8F0',
    },
    modalCloseFooterBtn: {
      backgroundColor: 'rgba(244, 63, 94, 0.1)',
      borderWidth: 1.5,
      borderColor: 'rgba(244, 63, 94, 0.4)',
      borderRadius: 18,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 8,
    },
    modalCloseFooterBtnText: {
      color: '#f43f5e',
      fontSize: 13,
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
  });
};
