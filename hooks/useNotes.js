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
      console.log('🔥 [useNotes] raw “saved” from AsyncStorage:', saved);

      let parsed = [];
      if (saved) {
        try {
          const tmp = JSON.parse(saved);
          // DEBUG: log what we got after parse
          console.log('🔥 [useNotes] JSON.parse(saved) →', tmp);

          // Only accept it if it’s actually an array
          if (Array.isArray(tmp)) {
            parsed = tmp;
          } else {
            console.warn(
              '⚠️ [useNotes] Parsed value was not an array—falling back to []'
            );
            parsed = [];
          }
        } catch (e) {
          console.warn('⚠️ [useNotes] JSON.parse failed:', e);
          parsed = [];
        }
      }

      console.log('🔥 [useNotes] Final “parsed” (forced to array):', parsed);
      setNotes(parsed);
    } catch (err) {
      console.error('❌ [useNotes] Failed to load notes:', err);
      setNotes([]); // ensure it’s always an array
    }
  };

  const saveNotes = async (newNotes) => {
    try {
      console.log('💾 [useNotes] Saving “newNotes” array:', newNotes);
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
      setNotes(newNotes);
    } catch (err) {
      console.error('❌ [useNotes] Failed to save notes:', err);
    }
  };

  const addNote = async ({ title, content, timestamp }) => {
    try {
      const newNote = {
        id: uuid.v4(),
        title: title || '',
        content: content || '',
        timestamp: timestamp || Date.now(),
      };
      const updated = [newNote, ...notes];
      await saveNotes(updated);
      return newNote;
    } catch (err) {
      console.error('Add note failed:', err);
      throw err;
    }
  };

  const updateNote = async (id, { title, content, timestamp }) => {
    const current = Array.isArray(notes) ? notes : [];
    console.log('✏️ [useNotes] updateNote(): current notes array is:', current);

    const updated = current.map((note) =>
      note.id === id
        ? {
            ...note,
            title,
            content,
            ...(timestamp !== undefined ? { timestamp } : {}),
          }
        : note
    );
    console.log('✏️ [useNotes] updateNote(): new array will be:', updated);

    await saveNotes(updated);
  };

  const deleteNote = async (id) => {
    const current = Array.isArray(notes) ? notes : [];
    console.log('🗑️ [useNotes] deleteNote(): current notes array is:', current);

    const filtered = current.filter((note) => note.id !== id);
    console.log('🗑️ [useNotes] deleteNote(): filtered array will be:', filtered);

    await saveNotes(filtered);
  };

  const getNoteById = (id) => {
    if (!Array.isArray(notes)) return null;
    return notes.find((note) => note.id === id);
  };

  const getNoteByIdAsync = async (id) => {
    try {
      const saved = await AsyncStorage.getItem(NOTES_KEY);
      let parsed = [];
      if (saved) {
        try {
          const tmp = JSON.parse(saved);
          parsed = Array.isArray(tmp) ? tmp : [];
        } catch {
          parsed = [];
        }
      }
      return parsed.find((note) => note.id === id) ?? null;
    } catch (err) {
      console.error('❌ [useNotes] Failed to read note by ID:', err);
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
