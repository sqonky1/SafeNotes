import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screens
import HomeScreen from '../screens/MainApp/HomeScreen';
import JournalScreen from '../screens/MainApp/JournalScreen';
import InfoStackNavigator from './InfoStackNavigator';
import ChatbotScreen from '../screens/MainApp/ChatbotScreen';
import SettingsScreen from '../screens/Settings/SettingsScreen';

// Tab icons
import { Home, BookOpenText, MessageSquareText, Paperclip, Settings } from 'lucide-react-native';

import { SettingsContext } from '../contexts/SettingsContext';
import { TabHistoryContext } from '../contexts/TabHistoryContext'; // ✅ Add this
import { useNavigationState } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { pushTab } = useContext(TabHistoryContext); // ✅ Use context

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFF',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          height: 100,
          backgroundColor: '#262626',
          paddingBottom: 10, // Optional: tweak for icon alignment
          paddingTop: 10,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter',
        },
        tabBarItemStyle: {
          flex: 0.9,
          justifyContent: 'center',  // ✅ Vertically center
          alignItems: 'center',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <Home color={color} size={27} />,
        }}
      />
      <Tab.Screen
        name="Info"
        component={InfoStackNavigator}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const currentRoute = navigation.getState().routes[navigation.getState().index].name;
            if (currentRoute !== 'Info') {
              pushTab(currentRoute);
            }
          },
        })}
        options={{
          tabBarIcon: ({ color }) => <BookOpenText color={color} size={27} />,
        }}
      />
      <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const currentRoute = navigation.getState().routes[navigation.getState().index].name;
            if (currentRoute !== 'Chatbot') {
              pushTab(currentRoute);
            }
          },
        })}
        options={{
          tabBarIcon: ({ color }) => <MessageSquareText color={color} size={27} />,
        }}
      />
      <Tab.Screen
        name="Journal"
        component={JournalScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const currentRoute = navigation.getState().routes[navigation.getState().index].name;
            if (currentRoute !== 'Journal') {
              pushTab(currentRoute);
            }
          },
        })}
        options={{
          tabBarIcon: ({ color }) => <Paperclip color={color} size={27} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const currentRoute = navigation.getState().routes[navigation.getState().index].name;
            if (currentRoute !== 'Settings') {
              pushTab(currentRoute);
            }
          },
        })}
        options={{
          tabBarIcon: ({ color }) => <Settings color={color} size={27} />,
        }}
      />
    </Tab.Navigator>
  );
}
