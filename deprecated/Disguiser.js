import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SettingsContext } from '../contexts/SettingsContext';

export default function Disguiser({ children }) {
  const { setIsUnlocked } = useContext(SettingsContext);

  const tripleTapGesture = Gesture.Tap()
    .numberOfTaps(3)
    .maxDelay(25)
    .onEnd((_, success) => {
      if (success) {
        runOnJS(Haptics.selectionAsync)();
        runOnJS(setIsUnlocked)(false);
      }
    });

  return (
    <View style={{ flex: 1 }}>
      <GestureDetector gesture={tripleTapGesture}>
        {/* Only this view responds to triple tap */}
        <View style={styles.safeGestureArea}>
          {children}
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  safeGestureArea: {
    flex: 1,
    paddingBottom: 80, // Reserve space to avoid the bottom tab bar
  },
});