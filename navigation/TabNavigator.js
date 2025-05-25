import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

// Screens
import HomeScreen from '../screens/MainApp/HomeScreen'
import JournalScreen from '../screens/MainApp/JournalScreen'
import InfoStackNavigator from './InfoStackNavigator'
import ChatbotScreen from '../screens/MainApp/ChatbotScreen'
import SettingsScreen from '../screens/Settings/SettingsScreen'

// Tab icons
import { Home, BookOpenText, MessageSquareText, Paperclip, Settings } from 'lucide-react-native'


const Tab = createBottomTabNavigator()

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FFF',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#262626',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Inter',
        },
      }}
    >
    <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
            tabBarIcon: ({ color, size }) => <Home color={color} size={20} />,
        }}
    />
    <Tab.Screen
        name="Journal"
        component={JournalScreen}
        options={{
            tabBarIcon: ({ color, size }) => <Paperclip color={color} size={20} />,
        }}
    />
    <Tab.Screen
        name="Info"
        component={InfoStackNavigator}
        options={{
            tabBarIcon: ({ color, size }) => <BookOpenText color={color} size={20} />,
        }}
    />
    <Tab.Screen
        name="Chatbot"
        component={ChatbotScreen}
        options={{
            tabBarIcon: ({ color, size }) => <MessageSquareText color={color} size={20} />,
        }}
    />
    <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
            tabBarIcon: ({ color, size }) => <Settings color={color} size={20} />,
        }}
    />
    </Tab.Navigator>
  )
}
