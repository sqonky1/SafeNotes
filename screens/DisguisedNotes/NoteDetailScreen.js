// screens/DisguisedNotes/NoteDetailScreen.js

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useNotes } from '../../hooks/useNotes';
import { theme } from '../../constants/colors';
import { ArrowLeft } from 'lucide-react-native';
import NoteToolbar from '../../components/UI/NoteToolbar';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { parseDocument } from 'htmlparser2';
import { DomHandler, ElementType } from 'domhandler';
import { default as serialize } from 'dom-serializer';

export default function NoteDetailScreen() {
  console.log("🚀 NoteDetailScreen mounted");

  const navigation = useNavigation();
  const route = useRoute();
  const { noteId } = route.params;

  const { addNote, updateNote, getNoteById, reload, getNoteByIdAsync } = useNotes();

  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRichToolbar, setShowRichToolbar] = useState(false);

  const editorRef = useRef();
  const cleanHTMLRef = useRef(''); 

  // track the title and content before any changes
  const originalTitleRef = useRef('');
  const originalContentRef = useRef('');

  // Inject <span> tags into the HTML string (safe template‐string usage)
  const injectHighlights = (html, keyword) => {
    if (!keyword || !html) return html;

    // Escape special regex chars in keyword
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');

    const dom = parseDocument(html);

    const walk = (node) => {
      if (!node) return;

      if (node.type === 'text') {
        // IMPORTANT: the <span> below is inside backticks (string!), not raw JSX:
        node.data = node.data.replace(regex, match =>
          `<span style="background-color: ${theme.highlight}; border-radius: 4px;">${match}</span>`
        );
      }

      if (node.children) {
        node.children.forEach(walk);
      }
    };

    dom.children.forEach(walk);
    return serialize(dom);
  };

  // A simpler, regex‐based highlighter (also using backtick strings)
  const injectHighlightsSafely = (html, keyword) => {
    if (!keyword) return html;

    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');

    return html.replace(/>([^<]+)</g, (wholeMatch, text) => {
      const highlighted = text.replace(regex, `<span style="background-color:${theme.highlight}; border-radius:4px;">$1</span>`);
      return `>${highlighted}<`;
    });
  };

  // 🔄 Load note on mount or when noteId changes
  useEffect(() => {
    console.log("📄 useEffect triggered. noteId =", noteId); // 👈 ADD THIS
    const loadNote = async () => {
      if (noteId) {
        const note = await getNoteByIdAsync(noteId);
        console.log("📄 Loaded existing note:", note); // 👈 ADD THIS
        if (note) {
          setTitle(note.title || '');
          setHtmlContent(note.content || '');
          originalTitleRef.current = note.title || '';
          originalContentRef.current = note.content || '';
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.setContentHTML(note.content || '');
            }
          }, 0);
        }
      } else {
        console.log("📄 Creating new note"); // 👈 ADD THIS
      }
    };
    loadNote();
  }, [noteId]);

  // 🔍 Whenever searchQuery changes, update the editor’s HTML
  useEffect(() => {
    if (!editorRef.current) return;
    const clean = cleanHTMLRef.current;
    if (searchQuery.trim()) {
      const highlighted = injectHighlightsSafely(clean, searchQuery);
      editorRef.current.setContentHTML(highlighted);
    } else {
      editorRef.current.setContentHTML(clean);
    }
  }, [searchQuery]);

  // ✅ Save or update note
  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = htmlContent.trim();

    // If completely empty, just go back
    if (!trimmedTitle && !trimmedContent) {
      navigation.goBack();
      return;
    }

    const hasChanged =
      trimmedTitle !== originalTitleRef.current ||
      trimmedContent !== originalContentRef.current;

    try {
      if (noteId) {
        // Only add a new timestamp if content/title changed
        await updateNote(noteId, {
          title: trimmedTitle,
          content: trimmedContent,
          ...(hasChanged && { timestamp: Date.now() }),
        });
      } else {
        await addNote({
          title: trimmedTitle,
          content: trimmedContent,
        });
      }
      await reload();
      navigation.goBack();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleSave}>
              <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.title}>{noteId ? 'Edit Note' : 'New Note'}</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Title Input */}
          <TextInput
            placeholder="Title"
            placeholderTextColor={theme.muted}
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
          />

          {/* RichEditor for content */}
          {Platform.OS === 'android' ? (
            <TextInput
              placeholder="Write something..."
              placeholderTextColor={theme.muted}
              style={styles.plainEditor}
              value={htmlContent}
              onChangeText={setHtmlContent}
              multiline
              textAlignVertical="top"
            />
          ) : (
            <RichEditor
              ref={editorRef}
              placeholder="Write something..."
              style={styles.richEditor}
              initialContentHTML={htmlContent}
              onChange={(html) => {
                setHtmlContent(html);
                cleanHTMLRef.current = html;
              }}
              editorStyle={{
                backgroundColor: theme.input,
                color: theme.text,
                contentCSSText: `body { font-family: Inter; font-size: 16px; padding: 0 8px; }`,
              }}
            />
          )}

          {/* Built‐in formatting toolbar (bold, italic, bullets) */}
          {Platform.OS === 'ios' && showRichToolbar && (
            <RichToolbar
              editor={editorRef}
              actions={[actions.setBold, actions.setItalic, actions.insertBulletsList]}
              iconTint={theme.text}
              selectedIconTint={theme.accent}
              style={{
                backgroundColor: theme.card,
                borderTopWidth: 1,
                borderTopColor: theme.border,
              }}
            />
          )}

          {/* Search bar (only visible if showSearchBar === true) */}
          {showSearchBar && (
            <View style={styles.searchBar}>
              <TextInput
                placeholder="Search"
                placeholderTextColor={theme.muted}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          )}

          {/* Bottom toolbar: toggle search, toggle format, open calculator */}
          <NoteToolbar
            onSearch={() => setShowSearchBar((prev) => !prev)}
            onCalculator={() => navigation.navigate('CalculatorUnlock')}
            onFormat={() => setShowRichToolbar((prev) => !prev)}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  inner: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    color: theme.text,
    fontFamily: 'Inter',
  },
  titleInput: {
    fontSize: 20,
    color: theme.text,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: 4,
  },
  richEditor: {
    flex: 1,
    backgroundColor: theme.input,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  searchBar: {
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 10,
    color: theme.text,
    fontFamily: 'Inter',
    fontSize: 14,
  },
  plainEditor: {
    flex: 1,
    backgroundColor: theme.input,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    color: theme.text,
    fontSize: 16,
    fontFamily: 'Inter',
  },
});
