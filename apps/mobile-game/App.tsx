import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';

// Context & Screens
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthScreen from './src/screens/AuthScreen';
import CharacterCreationScreen from './src/screens/CharacterCreationScreen';

// Components
import { CustomTabBar } from './src/components/CustomTabBar';

// Screens
import DashboardScreen from './src/screens/DashboardScreen';
import CityScreen from './src/screens/CityScreen';
import EnterpriseScreen from './src/screens/EnterpriseScreen';

const Tab = createBottomTabNavigator();

function NavigationWrapper() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {isAuthenticated ? (
        user?.isCharacterCreated ? (
          <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            sceneContainerStyle={{ backgroundColor: '#020617' }} // Slate 950 (deepest dark)
            screenOptions={{
              headerStyle: { 
                backgroundColor: '#0F172A', // Slate 900
                shadowColor: 'transparent',
                elevation: 0, // Remove header shadow for clean look
                borderBottomWidth: 1,
                borderBottomColor: '#1E293B',
              },
              headerTintColor: '#F8FAFC', // Slate 50
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 18,
                letterSpacing: 0.5,
              },
            }}
          >
            <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Karargah' }} />
            <Tab.Screen name="City" component={CityScreen} options={{ title: 'Şehir' }} />
            <Tab.Screen name="Enterprise" component={EnterpriseScreen} options={{ title: 'Şirket' }} />
            {/* Re-use DashboardScreen as placeholder for now to test the navbar layout */}
            <Tab.Screen name="Market" component={DashboardScreen} options={{ title: 'Borsa' }} />
            <Tab.Screen name="Logistics" component={DashboardScreen} options={{ title: 'Lojistik' }} />
            <Tab.Screen name="Politics" component={DashboardScreen} options={{ title: 'Siyaset' }} />
          </Tab.Navigator>
        ) : (
          <CharacterCreationScreen />
        )
      ) : (
        <AuthScreen />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AuthProvider>
        <NavigationWrapper />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

