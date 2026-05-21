import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { createStyles } from '../styles/screens/DashboardScreen.styles';

export default function DashboardScreen() {
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(width, height), [width, height]);
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hoş Geldiniz, Başkan</Text>
        <Text style={styles.subtitle}>Siyasi ve Ekonomik Durum Raporu</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Bakiye</Text>
          <Text style={styles.statValue}>₺ 1,250,000</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Siyasi Nüfuz</Text>
          <Text style={styles.statValue}>840 Puan</Text>
        </View>
      </View>

      <View style={styles.newsSection}>
        <Text style={styles.sectionTitle}>Son Gelişmeler</Text>
        <View style={styles.newsItem}>
          <Text style={styles.newsText}>Ankara'da meclis asgari ücret artışını tartışıyor. İşçi maliyetleri artabilir.</Text>
        </View>
        <View style={styles.newsItem}>
          <Text style={styles.newsText}>Zonguldak kömür madenlerinde üretim %15 düştü. Enerji fiyatları yükselişte.</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Bakanlar Kurulunu Topla</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


