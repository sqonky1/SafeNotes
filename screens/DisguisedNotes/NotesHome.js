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

  // DEBUG: print raw “notes” and its type
  console.log('📝 [NotesHome] notes (raw from hook):', notes);
  console.log(
    '📝 [NotesHome] typeof notes:',
    typeof notes,
    'Array.isArray(notes)=',
    Array.isArray(notes)
  );

  // Force notes to be an array, even if something went wrong
  const safeNotesArray = Array.isArray(notes) ? notes : [];
  console.log('📝 [NotesHome] safeNotesArray (guaranteed array):', safeNotesArray);

  // Filter them
  const filteredNotes = safeNotesArray.filter((note) =>
    note.title?.toLowerCase().startsWith(searchQuery.toLowerCase())
  );
  console.log('📝 [NotesHome] filteredNotes:', filteredNotes);

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
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
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
      />

      {/* Calculator FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CalculatorUnlock')}
      >
        <Calculator size={24} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerText: {
    color: theme.text,
    fontSize: 28,
    fontWeight: '600',
    fontFamily: 'Inter',
  },
  newNote: {
    color: theme.accent,
    fontSize: 16,
    fontFamily: 'Inter',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  noteCard: {
    backgroundColor: theme.card,
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
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  noteTime: {
    color: theme.muted,
    fontSize: 12,
    marginTop: 8,
    fontFamily: 'Inter',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: theme.card,
    borderRadius: 30,
    padding: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 1 },
    shadowRadius: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 10,
    color: theme.text,
    fontFamily: 'Inter',
    fontSize: 14,
  },
});
