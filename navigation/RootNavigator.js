import React, { useContext } from 'react'
import { createNativeStackNavigator, TransitionPresets } from '@react-navigation/native-stack'
import { SettingsContext } from '../contexts/SettingsContext'
import { theme } from '../constants/colors';

// Disguised flow
import NotesHome from '../screens/DisguisedNotes/NotesHome'
import NoteDetailScreen from '../screens/DisguisedNotes/NoteDetailScreen'
import CalculatorUnlock from '../screens/DisguisedNotes/CalculatorUnlock'

// Main app flow
import TabNavigator from './TabNavigator'
import SOSScreen from '../screens/MainApp/SOSScreen'
import JournalViewScreen from '../screens/MainApp/JournalViewScreen'

// For switching between real and disguised UI
import { TapGestureHandler } from 'react-native-gesture-handler';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
  const { isUnlocked, setIsUnlocked } = useContext(SettingsContext);

  const tripleTapHandler = ({ nativeEvent }) => {
    if (nativeEvent.state === 5) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsUnlocked(false);
    }
  };

  if (isUnlocked) {
    return (
      <TapGestureHandler
        numberOfTaps={3}
        maxDelayMs={600}
        shouldCancelWhenOutside={false}
        onHandlerStateChange={tripleTapHandler}
      >
        <View style={{ flex: 1 }}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="SOS" component={SOSScreen} />
            <Stack.Screen name="MediaView" component={JournalViewScreen} />
          </Stack.Navigator>
        </View>
      </TapGestureHandler>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NotesHome" component={NotesHome} />
      <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
      <Stack.Screen name="CalculatorUnlock" component={CalculatorUnlock} />
    </Stack.Navigator>
  );
}
