import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../constants/colors';
import BackButton from '../../components/UI/BackButton';
import { infoData } from '../../data/infoData';
import InfoCard from '../../components/UI/InfoCard';
import infoIconMap from '../../components/UI/InfoIconMap';

export default function InfoScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 10 : StatusBar.currentHeight,
        backgroundColor: theme.background,
      }}
    >
      <View style={{ flex: 1 }}>
        <ScrollView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <BackButton style={styles.backButton} />
            <Text style={styles.title}>Information</Text>
          </View>

          {/* Info List */}
          <View style={styles.group}>
            {infoData.map((item, index) => (
              <Pressable
                key={index}
                onPress={() =>
                  navigation.push('InfoDetail', {
                    icon: item.icon,
                    title: item.label,
                    content: item.fullText,
                  })
                }
              >
                <InfoCard iconComponent={infoIconMap[item.icon]} title={item.label} />
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 0,
    position: 'relative',
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    color: theme.text,
    marginLeft: 0,
  },
  group: {
    marginTop: 10,
    paddingVertical: 5,
    marginBottom: 24,
  },
  backButton: {
    position: 'absolute',
    left: -25,
    top: -40,
  },
});
