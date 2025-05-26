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
  const navigation = useNavigation();
  const route = useRoute();
  const { noteId } = route.params;

  // Custom hook to manage notes
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

  const injectHighlights = (html, keyword) => {
    if (!keyword || !html) return html;

    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');

    const dom = parseDocument(html);

    const walk = (node) => {
      if (!node) return;

      if (node.type === 'text') {
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

  const injectHighlightsSafely = (html, keyword) => {
    if (!keyword) return html;

    // Only inject inside paragraph/body text nodes
    return html.replace(/>([^<]+)</g, (match, text) => {
      const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const highlighted = text.replace(regex, `<span style="background-color:${theme.highlight}; border-radius:4px;">$1</span>`);
      return `>${highlighted}<`;
    });
  };

  // 🔄 Load note
  useEffect(() => {
    const loadNote = async () => {
      if (noteId) {
        const note = await getNoteByIdAsync(noteId); // ✅ no more red squiggles

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
      }
    };

    loadNote();
  }, [noteId]);

  // 🔍 Highlight search
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

  // ✅ Save note
  const handleSave = async () => {
    const trimmedTitle = title.trim();
    const trimmedContent = htmlContent.trim();

    if (!trimmedTitle && !trimmedContent) {
      navigation.goBack();
      return;
    }

    const hasChanged =
      trimmedTitle !== originalTitleRef.current ||
      trimmedContent !== originalContentRef.current;

    try {
      if (noteId) {
        await updateNote(noteId, {
          title: trimmedTitle,
          content: trimmedContent,
          ...(hasChanged && { timestamp: Date.now() }) // ← only add timestamp if changed
        });
      } else {
        await addNote({
          title: trimmedTitle,
          content: trimmedContent,
          timestamp: Date.now()
        });
      }

      await reload();
      navigation.goBack();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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

          {/* Title */}
          <TextInput
            placeholder="Title"
            placeholderTextColor={theme.muted}
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
          />

          {/* Editor */}
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

          {/* Built-in formatting toolbar */}
          {showRichToolbar && (
            <RichToolbar
              editor={editorRef}
              actions={[actions.setBold, actions.setItalic, actions.insertBulletsList]}
              iconTint={theme.text}
              selectedIconTint={theme.accent}
              style={{ backgroundColor: theme.card, borderTopWidth: 1, borderTopColor: theme.border }}
            />
          )}

          {/* Search bar */}
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

          {/* Custom toolbar buttons */}
          <NoteToolbar
            onSearch={() => setShowSearchBar(prev => !prev)}
            onCalculator={() => navigation.navigate('CalculatorUnlock')}
            onFormat={() => setShowRichToolbar(prev => !prev)}
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
});
