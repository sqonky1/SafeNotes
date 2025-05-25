import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../constants/colors' // adjust path if needed

export default function ChatbotScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ChatbotScreen screen</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: theme.text,
    fontFamily: 'Inter',
    fontSize: 18,
  },
})
