import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../constants/colors' // adjust path if needed
import BackButton from '../../components/UI/BackButton'

export default function JournalScreen() {
  return (
    <View style={styles.container}>
      <BackButton />
      <Text style={styles.text}>JournalScreen screen</Text>
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
