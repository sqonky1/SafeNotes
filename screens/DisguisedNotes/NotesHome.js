// screens/DisguisedNotes/NotesHome.js
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useNotes } from '../../hooks/useNotes';
import { theme } from '../../constants/colors';
import { Calculator, X } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';

export default function NotesHome() {
  const navigation = useNavigation();
  const { notes, deleteNote, reload } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');

  // Force notes to be an array, even if something went wrong
  const safeNotesArray = Array.isArray(notes) ? notes : [];

  // Filter them
  const filteredNotes = safeNotesArray.filter((note) =>
    (note.title?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [])
  );

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteNote(id);
            reload();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.noteCard}
      onPress={() => navigation.navigate('NoteDetail', { noteId: item.id })}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle}>{item.title || 'Untitled'}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <X size={20} color={theme.muted} />
        </TouchableOpacity>
      </View>
      <Text style={styles.noteTime}>
        {formatTimestamp(item.timestamp)}
      </Text>
    </TouchableOpacity>
  );

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
          <Text style={styles.headerText}>Notes</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('NoteDetail', { noteId: null })}
          >
            <Text style={styles.newNote}>+ New Note</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search"
            placeholderTextColor={theme.muted}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* NOTES LIST */}
        <FlatList
          data={
            Array.isArray(filteredNotes)
              ? [...filteredNotes].sort((a, b) => b.timestamp - a.timestamp)
              : []
          }
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          overScrollMode="never"
        />

        {/* Calculator FAB */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CalculatorUnlock')}
        >
          <Calculator size={34} color={theme.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function formatTimestamp(timestamp) {
  const date = new Date(Math.round(new Date(timestamp).getTime() / 60000) * 60000);
  const now = new Date();
  
  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return `Today • ${timeStr}`;
  if (isYesterday) return `Yesterday • ${timeStr}`;

  return `${date.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })} • ${timeStr}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  headerText: {
    color: theme.text,
    fontSize: 45,
    fontWeight: '700',
    fontFamily: 'Inter',
  },
  newNote: {
    color: theme.accent,
    fontSize: 18,
    fontFamily: 'Inter',
    marginTop: 25,
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingBottom: 120,
  },
  noteCard: {
    backgroundColor: theme.background,
    borderColor: theme.input,
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noteTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  noteTime: {
    color: theme.muted,
    fontSize: 14,
    marginTop: 8,
    fontFamily: 'Inter',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: theme.card,
    borderRadius: 40,
    borderColor: theme.muted,
    borderWidth: 0.7,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 4,
  },
  searchContainer: {
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 10,
    color: theme.text,
    fontFamily: 'Inter',
    fontSize: 18,
  },
});
