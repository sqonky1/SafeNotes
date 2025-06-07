import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { theme } from '../../constants/colors';
import InfoCard from '../../components/UI/InfoCard';
import infoIconMap from '../../components/UI/InfoIconMap';
import MarkdownContent from '../../components/UI/MarkdownContent';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function InfoDetail({ route }) {
  const { icon, title, content } = route.params;
  const navigation = useNavigation();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 10 : StatusBar.currentHeight,
        backgroundColor: theme.background,
      }}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="white" size={40} />
          </Pressable>
          <InfoCard iconComponent={infoIconMap[icon]} title={title} />
        </View>

        {/* Scrollable content */}
        <ScrollView 
            style={styles.scroll}
            overScrollMode="never" // ← disables overscroll glow
        >
          <View style={styles.scrollInner}>
            <MarkdownContent content={content} theme={theme} />
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
    paddingTop: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 0,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
  },
  backButton: {
    marginBottom: 10,
  },
    scrollInner: {
    paddingBottom: 50, // now it works
    }
});
