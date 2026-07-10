import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BearProvider } from './src/context/BearContext';
import DashboardScreen from './src/screens/DashboardScreen';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BearProvider>
          <DashboardScreen />
          <StatusBar style="auto" />
        </BearProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
