import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// Main Info menu
import InfoScreen from '../screens/MainApp/InfoScreen'

// Subpages
import InfoSignsOfViolenceScreen from '../screens/MainApp/Info/InfoSignsOfViolenceScreen'
import InfoDangerActionScreen from '../screens/MainApp/Info/InfoDangerActionScreen'
import InfoLegalSupportScreen from '../screens/MainApp/Info/InfoLegalSupportScreen'
import InfoHotlinesScreen from '../screens/MainApp/Info/InfoHotlinesScreen'
import InfoHiddenUsageScreen from '../screens/MainApp/Info/InfoHiddenUsageScreen'
import InfoGuideScreen from '../screens/MainApp/Info/InfoGuideScreen'
import InfoDeleteSMSScreen from '../screens/MainApp/Info/InfoDeleteSMSScreen'

const Stack = createNativeStackNavigator()

export default function InfoStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        headerStyle: { backgroundColor: '#121212' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontFamily: 'Inter' },
      }}
    >
      <Stack.Screen name="InfoMenu" component={InfoScreen} options={{ title: 'Info' }} />
      <Stack.Screen name="SignsOfViolence" component={InfoSignsOfViolenceScreen} />
      <Stack.Screen name="DangerAction" component={InfoDangerActionScreen} />
      <Stack.Screen name="LegalSupport" component={InfoLegalSupportScreen} />
      <Stack.Screen name="Hotlines" component={InfoHotlinesScreen} />
      <Stack.Screen name="HiddenUsage" component={InfoHiddenUsageScreen} />
      <Stack.Screen name="Guide" component={InfoGuideScreen} />
      <Stack.Screen name="DeleteSMS" component={InfoDeleteSMSScreen} />
    </Stack.Navigator>
  )
}
