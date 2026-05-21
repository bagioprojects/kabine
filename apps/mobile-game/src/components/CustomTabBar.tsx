import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const currentRouteName = state.routes[state.index].name;
  
  if (currentRouteName === 'City') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          // Icon seçimi
          let iconName: keyof typeof Ionicons.glyphMap = 'help';
          if (route.name === 'Dashboard') iconName = isFocused ? 'pie-chart' : 'pie-chart-outline';
          if (route.name === 'City') iconName = isFocused ? 'map' : 'map-outline';
          if (route.name === 'Enterprise') iconName = isFocused ? 'business' : 'business-outline';
          if (route.name === 'Market') iconName = isFocused ? 'trending-up' : 'trending-up-outline';
          if (route.name === 'Logistics') iconName = isFocused ? 'bus' : 'bus-outline'; // 'truck' is not in standard Ionicons sometimes, using bus/car/cube for now. let's use 'earth' for politics maybe.
          if (route.name === 'Politics') iconName = isFocused ? 'flag' : 'flag-outline';

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
              activeOpacity={0.8}
            >
              <View style={[styles.iconContainer, isFocused && styles.iconContainerFocused]}>
                <Ionicons
                  name={iconName}
                  size={24}
                  color={isFocused ? '#38BDF8' : '#64748B'} // Neon Blue for active, Slate for inactive
                />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelFocused]}>
                {label as string}
              </Text>
              
              {/* Caching/Glow Effect indicator under the active tab */}
              {isFocused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    width: width,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.95)', // Slate 900 with transparency
    borderRadius: 30,
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)', // Subtle Slate 700 border for glass effect
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 2,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)', // Light blue glow background
  },
  tabLabel: {
    fontSize: 10,
    color: '#64748B', // Slate 500
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: '#38BDF8', // Light blue (Sky 400)
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -10,
    width: 20,
    height: 3,
    backgroundColor: '#38BDF8',
    borderRadius: 2,
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4, // Android glow
  }
});
