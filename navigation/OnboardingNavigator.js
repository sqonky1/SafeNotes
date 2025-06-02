import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingProvider } from '../contexts/OnboardingContext';

import WelcomeScreen        from '../screens/Onboarding/WelcomeScreen';
import PinSetupScreen       from '../screens/Onboarding/PinSetupScreen';
import ConfigureSOSScreen   from '../screens/Onboarding/ConfigureSOSScreen';
import SetPreferencesScreen from '../screens/Onboarding/SetPreferences';
import TutorialScreen       from '../screens/Onboarding/TutorialScreen';
import SetupCompleteScreen  from '../screens/Onboarding/SetupCompleteScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <OnboardingProvider>
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
                props.navigation.replace('NotesHome');
              }}
            />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </OnboardingProvider>
  );
}