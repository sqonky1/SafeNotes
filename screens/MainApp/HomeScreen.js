import React, { useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../constants/colors';
import { TabHistoryContext } from '../../contexts/TabHistoryContext';

import {
  BookOpenText,
  MessageSquareText,
  Paperclip,
  Settings,
} from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const { pushTab } = useContext(TabHistoryContext);
  const navigation = useNavigation();

  useEffect(() => {
    pushTab('Home');
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Press SOS to send an {'\n'}emergency SMS.</Text>
      </View>

      {/* Floating SOS Button */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={() => navigation.navigate('SOS')}
      >
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

      {/* Grid */}
      <View style={styles.grid}>
        <Card icon={<BookOpenText color={theme.text} 
          size={60} />} 
          label="Information" 
          onPress={() => {
            pushTab('Home');
            navigation.navigate('Info');
          }} 
        />
        <Card icon={<MessageSquareText color={theme.text} 
          size={60} />} 
          label="AI Chatbot" 
          onPress={() => {
            pushTab('Home');
            navigation.navigate('Chatbot')
          }} 
        />
        <Card icon={<Paperclip color={theme.text} 
          size={60} />} 
          label="Journal" 
          onPress={() => {
            pushTab('Home');
            navigation.navigate('Journal')
          }} 
        />
        <Card icon={<Settings color={theme.text} 
          size={60} />} 
          label="Settings" 
          onPress={() => {
            pushTab('Home');
            navigation.navigate('Settings')
          }} 
        />
      </View>
    </View>
  );
}

function Card({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {icon}
      <Text style={styles.cardText}>{label}</Text>
    </TouchableOpacity>
  );
}

const cardSize = (screenWidth - 66) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 24,
    paddingTop: 156,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 50,
    left: 10,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    color: theme.text,
  },
  subtitle: {
    fontSize: 18,
    left: 10,
    color: theme.muted,
    fontFamily: 'Inter',
    marginTop: 4,
  },
  sosButton: {
    position: 'absolute',
    top: 116,
    right: 30,
    backgroundColor: theme.danger,
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  sosText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 50,
    fontFamily: 'Inter',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 20,
  },
  card: {
    width: cardSize,
    height: cardSize,
    backgroundColor: theme.card,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    marginTop: 10,
    color: theme.text,
    fontSize: 18,
    fontFamily: 'Inter',
  },
});
