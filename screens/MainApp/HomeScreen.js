import React, { useEffect, useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../constants/colors' // adjust path if needed
import { TabHistoryContext } from '../../contexts/TabHistoryContext';

export default function HomeScreen() {
  const { pushTab } = useContext(TabHistoryContext);

  useEffect(() => {
    pushTab('Home');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>HomeScreen screen</Text>
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
