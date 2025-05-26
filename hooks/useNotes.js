// hooks/useNotes.js

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

const NOTES_KEY = 'safenotes_notes';

export const useNotes = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const saved = await AsyncStorage.getItem(NOTES_KEY);
      const parsed = saved ? JSON.parse(saved) : [];
      setNotes(parsed);
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  const saveNotes = async (newNotes) => {
    try {
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (err) {
      console.error('Failed to save notes:', err);
    }
  };

  const addNote = async ({ title, content }) => {
    const newNote = {
    id: uuid.v4(), // bc it works in React Native
    title,
    content,
    timestamp: Date.now(),
    };
    const updated = [newNote, ...notes];
    await saveNotes(updated);
    return newNote;
  };

  const updateNote = async (id, { title, content, timestamp }) => {
    const updated = notes.map(note =>
      note.id === id
        ? {
            ...note,
            title,
            content,
            ...(timestamp !== undefined ? { timestamp } : {}) // ✅ only update if explicitly passed
          }
        : note
    );
    await saveNotes(updated);
  };

  const deleteNote = async (id) => {
    const filtered = notes.filter(note => note.id !== id);
    await saveNotes(filtered);
  };

  const getNoteById = (id) => {
    return notes.find(note => note.id === id);
  };

  const getNoteByIdAsync = async (id) => {
    try {
        const saved = await AsyncStorage.getItem(NOTES_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        return parsed.find(note => note.id === id);
    } catch (err) {
        console.error('Failed to read note:', err);
        return null;
    }
  };

  return {
    notes,
    addNote,
    updateNote,
    deleteNote,
    getNoteById,
    getNoteByIdAsync,
    reload: loadNotes,
  };
};
