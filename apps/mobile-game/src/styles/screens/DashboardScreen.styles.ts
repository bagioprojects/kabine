import { StyleSheet } from 'react-native';

export const createStyles = (width: number, height: number) => {
  const isTablet = width >= 768;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0F0F16',
      padding: isTablet ? 24 : 16,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: isTablet ? 30 : 24,
      fontWeight: 'bold',
      color: '#F8FAFC',
    },
    subtitle: {
      fontSize: isTablet ? 16 : 14,
      color: '#94A3B8',
      marginTop: 4,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    statCard: {
      flex: 1,
      backgroundColor: '#1E1E2D',
      padding: isTablet ? 20 : 16,
      borderRadius: 12,
      marginHorizontal: 4,
    },
    statLabel: {
      fontSize: isTablet ? 14 : 12,
      color: '#64748B',
      marginBottom: 8,
    },
    statValue: {
      fontSize: isTablet ? 22 : 18,
      fontWeight: '700',
      color: '#10B981',
    },
    newsSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: isTablet ? 22 : 18,
      fontWeight: '600',
      color: '#E2E8F0',
      marginBottom: 12,
    },
    newsItem: {
      backgroundColor: '#1E1E2D',
      padding: isTablet ? 16 : 12,
      borderRadius: 8,
      marginBottom: 8,
      borderLeftWidth: 4,
      borderLeftColor: '#3B82F6',
    },
    newsText: {
      color: '#CBD5E1',
      fontSize: isTablet ? 16 : 14,
      lineHeight: 20,
    },
    actionButton: {
      backgroundColor: '#2563EB',
      padding: isTablet ? 18 : 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 40,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: isTablet ? 18 : 16,
      fontWeight: '600',
    },
  });
};
