// screens/DisguisedNotes/NoteDetailScreen.js
import * as Font from 'expo-font';
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
  StatusBar,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useNotes } from '../../hooks/useNotes';
import { theme } from '../../constants/colors';
import { ChevronLeft } from 'lucide-react-native';
import NoteToolbar from '../../components/UI/NoteToolbar';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { parseDocument } from 'htmlparser2';
import { DomHandler, ElementType } from 'domhandler';
import { default as serialize } from 'dom-serializer';

export default function NoteDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { noteId } = route.params;

  const { addNote, updateNote, getNoteById, reload, getNoteByIdAsync } = useNotes();

  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRichToolbar, setShowRichToolbar] = useState(false);
  const [keyboardHeight] = useState(new Animated.Value(0));

  const editorRef = useRef();
  const cleanHTMLRef = useRef(''); 

  // track the title and content before any changes
  const originalTitleRef = useRef('');
  const originalContentRef = useRef('');
  const TOOLBAR_HEIGHT = 68;

  const stripInlineFontSizes = (html) => {
    return html.replace(/style="[^"]*font-size:\s*[^";]+;?[^"]*"/gi, '');
  };

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

  useEffect(() => {
    console.log('showRichToolbar:', showRichToolbar);
  }, [showRichToolbar]);

  // 🔄 Load note on mount or when noteId changes
  useEffect(() => {
    const loadNote = async () => {
      if (noteId) {
        const note = await getNoteByIdAsync(noteId);
        if (note) {
          setTitle(note.title || '');
          setHtmlContent((note.content || ''));
          originalTitleRef.current = note.title || '';
          originalContentRef.current = note.content || '';
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.setContentHTML((note.content || ''));
            }
          }, 0);
        }
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


  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: e.duration || 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener('keyboardWillHide', (e) => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: e.duration || 250,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 10 : StatusBar.currentHeight,
        backgroundColor: theme.background,
      }}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.inner}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleSave}>
                <ChevronLeft size={30} color={theme.text} />
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

            {/* RichEditor (inside scrollable container) */}
            <View style={{ flex: 1 }}>
              <ScrollView 
                contentContainerStyle={{ 
                  flexGrow: 1,
                  paddingBottom: 50,
                }}
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="handled"   
              >
                <RichEditor
                  ref={editorRef}
                  placeholder="Write something..."
                  initialContentHTML={htmlContent}
                  style={styles.richEditor}
                  onChange={(html) => {
                    const cleaned = stripInlineFontSizes(html);
                    setHtmlContent(cleaned);
                    cleanHTMLRef.current = cleaned;
                  }}
                  editorStyle={{
                    backgroundColor: theme.background,
                    color: theme.text,
                    contentCSSText: `
                      body {
                        font-family: Inter;
                        font-size: 16px;
                        padding: 0 8px;
                        padding-bottom: 18px;
                        min-height: 100%;
                      }
                    `,
                  }}
                />
                <View style={{ height: 300 }} /> 
              </ScrollView>
            </View>



            {/* RichToolbar (floating above NoteToolbar) */}
            {Platform.OS === 'ios' && showRichToolbar && (
              <View style={{
                position: 'absolute',
                bottom: 60,
                left: 0,
                right: 0,
                zIndex: 99,
              }}>
                <RichToolbar
                  editor={editorRef}
                  actions={[actions.setBold, actions.setItalic, actions.insertBulletsList]}
                  iconTint={theme.text}
                  selectedIconTint={theme.accent}
                  iconSize={24}
                  style={{
                    backgroundColor: theme.card,        // moved here ✅
                    borderTopWidth: 1,
                    borderTopColor: theme.border,
                    height: 50,
                    paddingVertical: 14,
                  }}
                  iconStyle={{ marginHorizontal: 12 }}
                />
              </View>
            )}

            {/* NoteToolbar (fixed at bottom) */}
            <View style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: theme.card,
              zIndex: 98,
            }}>
              <NoteToolbar
                onSearch={() => {
                  setShowSearchBar((prev) => {
                    if (!prev) setShowRichToolbar(false);
                    return !prev;
                  });
                }}
                onCalculator={() => navigation.navigate('CalculatorUnlock')}
                onFormat={() => {
                  setShowRichToolbar((prev) => {
                    if (!prev) setShowSearchBar(false);
                    return !prev;
                  });
                }}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  inner: {
    flex: 1,
    paddingTop:10,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    color: theme.text,
    fontFamily: 'Inter',
  },
  titleInput: {
    fontSize: 28,
    color: theme.text,
    fontWeight: '600',
    fontFamily: 'Inter',
    marginVertical: 0,
    marginHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.input,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  richEditor: {
    flex: 1,
    backgroundColor: theme.background,
    borderRadius: 10,
    padding: 0,
    marginBottom: 8,
    paddingHorizontal: 10,
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
    fontSize: 16,
    marginHorizontal: 20,
  },
  plainEditor: {
    flex: 1,
    backgroundColor: theme.background,
    borderRadius: 10,
    marginBottom: 8,
    color: theme.text,
    fontSize: 20,
    paddingHorizontal: 30,
    fontFamily: 'Inter',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.card,
    paddingVertical: 0,
  },
  floatingToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    height: 50,
    paddingVertical: 14,
    zIndex: 10,
  },
  editorWrapper: {
    flex: 1,
    paddingHorizontal: 10,
    backgroundColor: theme.background,
  },
  toolbarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  }
});
