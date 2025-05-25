import React, { useContext } from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SettingsContext } from '../contexts/SettingsContext'

// Disguised flow
import NotesHome from '../screens/DisguisedNotes/NotesHome'
import NoteDetailScreen from '../screens/DisguisedNotes/NoteDetailScreen'
import CalculatorUnlock from '../screens/DisguisedNotes/CalculatorUnlock'

// Main app flow
import TabNavigator from './TabNavigator'
import SOSScreen from '../screens/MainApp/SOSScreen'
import JournalViewScreen from '../screens/MainApp/JournalViewScreen'

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
  const { isUnlocked } = useContext(SettingsContext)

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isUnlocked ? (
        <>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="SOS" component={SOSScreen} />
          <Stack.Screen name="MediaView" component={JournalViewScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="NotesHome" component={NotesHome} />
          <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
          <Stack.Screen name="CalculatorUnlock" component={CalculatorUnlock} />
        </>
      )}
    </Stack.Navigator>
  )
}
