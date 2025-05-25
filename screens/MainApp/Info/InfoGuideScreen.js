import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../../constants/colors'

export default function InfoGuideScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>InfoGuideScreen screen</Text>
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
