import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthScreen } from './src/screens/AuthScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { BudgetScreen } from './src/screens/BudgetScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { initializeDB } from './src/store/storage';

const Stack = createNativeStackNavigator();

const AppNav = ({ initialRoute }: { initialRoute: string }) => {
  const { colors, isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background }
          }}
        >
          <Stack.Screen name="Auth" component={AuthScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Budget" component={BudgetScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Auth');

  useEffect(() => {
    const init = async () => {
      try {
        await initializeDB();
      } catch (e) {
        console.error("DB Error", e);
      }
      setDbReady(true);

      const hasSeenAuth = await AsyncStorage.getItem('@has_seen_auth');
      if (hasSeenAuth === 'true') {
        setInitialRoute('Home');
      }

      const authEnabled = await AsyncStorage.getItem('@auth_enabled');
      if (authEnabled === 'true') {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
          const auth = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Authenticate to view your budgets',
            fallbackLabel: 'Use PIN',
          });
          setIsAuthenticated(auth.success);
        } else {
          // Hardware unavailable or disabled - just let them in
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(true);
      }
      setAuthChecked(true);
    };

    init();
  }, []);

  if (!dbReady || !authChecked) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#0F172A' }]}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  if (!isAuthenticated && authChecked) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: '#0F172A' }]}>
        <Text style={{ color: '#F8FAFC', fontSize: 20, marginBottom: 20 }}>Authentication Failed</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AppNav initialRoute={initialRoute} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
