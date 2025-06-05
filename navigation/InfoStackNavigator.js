import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// Main Info menu
import InfoScreen from '../screens/MainApp/InfoScreen'

//  subpage
import InfoDetailScreen from '../screens/MainApp/InfoDetailScreen'

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
      <Stack.Screen
        name="InfoDetail"
        component={InfoDetailScreen}
        options={{ title: 'Information' }}
      />
    </Stack.Navigator>
  )
}
