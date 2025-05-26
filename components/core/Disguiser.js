import React, { useContext } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SettingsContext } from '../../contexts/SettingsContext';

export default function TwoFingerDisguiser({ children }) {
  const { setIsUnlocked } = useContext(SettingsContext);

    const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(300)
    .onEnd((event, success) => {
        if (success && event.tapCount === 2) {
        runOnJS(Haptics.selectionAsync)();
        runOnJS(setIsUnlocked)(false);
        }
    });

  return (
    <GestureDetector gesture={doubleTapGesture}>
      <View style={{ flex: 1 }}>{children}</View>
    </GestureDetector>
  );
}
