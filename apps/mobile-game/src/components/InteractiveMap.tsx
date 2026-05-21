import React, { useMemo, useState, memo, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import * as d3 from 'd3-geo';

// Load GeoJSON data statically
import turkeyData from '../assets/data/turkey-districts.json';

const { width } = Dimensions.get('window');
const MAP_HEIGHT = 400;

interface RegionData {
  id: string;
  name: string;
  ownerParty?: string;
  population?: number;
}

interface InteractiveMapProps {
  onRegionPress?: (region: RegionData) => void;
  // Dynamic data that might change frequently (e.g., live party colors)
  regionStates?: Record<string, { color: string; owner: string }>;
}

// -----------------------------------------------------------------------------
// Memoized individual Path component to prevent 900+ re-renders
// -----------------------------------------------------------------------------
const MapPath = memo(({ 
  d, 
  id, 
  name, 
  color, 
  isSelected, 
  onPress 
}: { 
  d: string, 
  id: string, 
  name: string, 
  color: string, 
  isSelected: boolean, 
  onPress: (id: string, name: string) => void 
}) => {
  return (
    <Path
      d={d}
      fill={isSelected ? '#38BDF8' : color}
      stroke={isSelected ? '#FFFFFF' : '#0F172A'}
      strokeWidth={isSelected ? 1.5 : 0.5}
      onPress={() => onPress(id, name)}
    />
  );
}, (prev, next) => {
  return (
    prev.isSelected === next.isSelected &&
    prev.color === next.color &&
    prev.d === next.d
  );
});

export function InteractiveMap({ onRegionPress, regionStates = {} }: InteractiveMapProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedRegionName, setSelectedRegionName] = useState<string>('');

  // 1. Calculate map projection paths ONCE
  const mapPaths = useMemo(() => {
    // We use a pseudo-mercator projection centered on Turkey
    const projection = d3.geoMercator()
      // Approximate center of Turkey
      .center([35.2433, 38.9637])
      .scale(MAP_HEIGHT * 3.5) // Adjust scale based on view size
      .translate([width / 2, MAP_HEIGHT / 2]);

    const pathGenerator = d3.geoPath().projection(projection);

    return (turkeyData as any).features.map((feature: any) => ({
      id: feature.properties['@id'] || feature.properties.name,
      name: feature.properties.name,
      d: pathGenerator(feature) as string,
    }));
  }, []);

  const handlePress = useCallback((id: string, name: string) => {
    setSelectedRegionId(id);
    setSelectedRegionName(name);
    if (onRegionPress) {
      onRegionPress({ id, name });
    }
  }, [onRegionPress]);

  return (
    <View style={styles.container}>
      <Svg width={width - 32} height={MAP_HEIGHT}>
        <G>
          {mapPaths.map((region: { id: string, name: string, d: string }) => {
            const isSelected = selectedRegionId === region.id;
            const regionState = regionStates[region.id];
            const fillColor = regionState?.color || '#1E293B'; // Default slate

            return (
              <MapPath
                key={region.id}
                id={region.id}
                name={region.name}
                d={region.d}
                color={fillColor}
                isSelected={isSelected}
                onPress={handlePress}
              />
            );
          })}
        </G>
      </Svg>

      {selectedRegionId && (
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>{selectedRegionName}</Text>
          <Text style={styles.infoSubtitle}>Nüfus: Yükleniyor... | Parti: Bilinmiyor</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 16,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  infoBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  infoTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginTop: 4,
  }
});
