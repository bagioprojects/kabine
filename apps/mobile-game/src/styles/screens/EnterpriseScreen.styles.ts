import { StyleSheet } from 'react-native';

export const createStyles = (width: number, height: number) => {
  const isTablet = width >= 768;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0F0F16',
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: isTablet ? 30 : 24,
      fontWeight: 'bold',
      color: '#F8FAFC',
    },
    subtitle: {
      fontSize: isTablet ? 16 : 14,
      color: '#94A3B8',
      marginTop: 8,
    },
  });
};
