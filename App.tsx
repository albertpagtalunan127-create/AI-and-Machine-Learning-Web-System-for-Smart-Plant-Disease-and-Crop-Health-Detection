import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase } from './src/services/supabase';
import { ActivityIndicator, StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ScanScreen from './src/screens/ScanScreen';

const Stack = createStackNavigator();

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={['#0d1b2a', '#1a2e47', '#0f3a2a']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar barStyle="light-content" />
        <ActivityIndicator size="large" color="#22c55e" />
      </LinearGradient>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: 'transparent' } }}>
          {session ? (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen name="Scan" component={ScanScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
