import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../constants/colors';

export default function TestImageScreen() {
  const navigation = useNavigation();
  const TEST_REMOTE = 'https://reactnative.dev/img/tiny_logo.png';

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>
        If you see a “HELLO” image below, remote images load fine.
      </Text>

      <Image
        source={{ uri: TEST_REMOTE }}
        style={styles.testImage}
        onError={(e) => console.log('Remote image load error:', e.nativeEvent)}
      />

      {/* Simple back button so we can exit this test screen */}
      <ChevronLeft
        onPress={() => navigation.goBack()}
        color={theme.text}
        size={36}
        style={styles.backButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#550000', // dark red background to confirm full‐screen
    justifyContent: 'center',
    alignItems: 'center',
  },
  instruction: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  testImage: {
    width: 200,
    height: 200,
    borderWidth: 3,
    borderColor: 'yellow', // bright border so it’s obvious
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
});
