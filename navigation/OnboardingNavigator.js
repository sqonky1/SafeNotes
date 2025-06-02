// navigation/OnboardingNavigator.js

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen        from '../screens/Onboarding/WelcomeScreen';
import PinSetupScreen       from '../screens/Onboarding/PinSetupScreen';
import ConfigureSOSScreen   from '../screens/Onboarding/ConfigureSOSScreen';
import SetPreferencesScreen from '../screens/Onboarding/SetPreferences';
import TutorialScreen       from '../screens/Onboarding/TutorialScreen';
import SetupCompleteScreen  from '../screens/Onboarding/SetupCompleteScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />

      <Stack.Screen name="PinSetup">
        {props => (
          <PinSetupScreen
            {...props}
            onFinish={() => props.navigation.replace('ConfigureSOS')}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="ConfigureSOS">
        {props => (
          <ConfigureSOSScreen
            {...props}
            onFinish={() => props.navigation.replace('SetPreferences')}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="SetPreferences">
        {props => (
          <SetPreferencesScreen
            {...props}
            onFinish={() => props.navigation.replace('Tutorial')}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Tutorial">
        {props => (
          <TutorialScreen
            {...props}
            onFinish={() => props.navigation.replace('SetupComplete')}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="SetupComplete">
        {props => (
          <SetupCompleteScreen
            {...props}
            onFinish={() => {
              // At this point, all fields in the OnboardingContext are populated.
              // You can console.log them here, or send to your backend.
              props.navigation.replace('NotesHome'); // If you later want to land in real app
            }}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}