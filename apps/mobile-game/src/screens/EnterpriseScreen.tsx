import React, { useMemo } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { createStyles } from '../styles/screens/EnterpriseScreen.styles';

export default function EnterpriseScreen() {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width, height), [width, height]);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Şirket Yönetimi</Text>
      <Text style={styles.subtitle}>Fabrikalarınız ve Üretim Bantlarınız</Text>
    </View>
  );
}


