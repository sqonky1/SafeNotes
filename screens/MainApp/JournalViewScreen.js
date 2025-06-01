import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../constants/colors';
import { AudioLines, Trash2, ChevronLeft } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import { Video } from 'expo-av';
import Constants from 'expo-constants';
import AudioPlayer from '../../components/audio/AudioPlayer';

const { width, height } = Dimensions.get('window');
const STORAGE_KEY = 'journalMedia';

export default function JournalViewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { media = [], index = 0 } = route.params;

  const [mediaItems, setMediaItems] = useState(media);
  const [currentIndex, setCurrentIndex] = useState(index);
  const isExpoGo = Constants.appOwnership === 'expo';

  useEffect(() => {
    const current = mediaItems[currentIndex];
    if (!current) return;
  }, [currentIndex, mediaItems]);

  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current && currentIndex > 0) {
      setTimeout(() => {
        try {
          flatListRef.current.scrollToIndex({ index: currentIndex, animated: false });
        } catch (e) {
          console.warn('ScrollToIndex failed:', e);
        }
      }, 200);
    }
  }, [currentIndex]);

  const handleDelete = () => {
    const current = mediaItems[currentIndex];
    Alert.alert(
      'Delete media?',
      'This will permanently remove the item from your journal.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await FileSystem.deleteAsync(current.uri, { idempotent: true });
              const updated = mediaItems.filter((_, i) => i !== currentIndex);
              setMediaItems(updated);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

              if (updated.length === 0) {
                navigation.goBack();
                return;
              }
              if (currentIndex >= updated.length) {
                const newIndex = updated.length - 1;
                setCurrentIndex(newIndex);
              }
            } catch (e) {
              console.error('Delete failed:', e);
              Alert.alert('Error', 'Could not delete media.');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => {
    try {
      let displayUri = item.uri.replace(/^file:\/\//, '');
      if (!displayUri.startsWith('file://')) {
        displayUri = 'file://' + displayUri;
      }

      return (
        <View style={styles.mediaContainer}>
          {item.type === 'image' && (
            <Image source={{ uri: displayUri }} style={styles.media} />
          )}
          {item.type === 'video' && (
            <Video
              source={{ uri: displayUri }}
              style={styles.media}
              useNativeControls
              resizeMode="contain"
              shouldPlay={false}
              isLooping={false}
            />
          )}
          {item.type === 'audio' && <AudioPlayer uri={displayUri} />}
          {!['image', 'video', 'audio'].includes(item.type) && (
            <Text style={styles.text}>Unknown media type</Text>
          )}
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
      );
    } catch (err) {
      return (
        <View style={styles.mediaContainer}>
          <Text style={styles.text}>Render error: {err.message}</Text>
        </View>
      );
    }
  };

  if (
    !Array.isArray(mediaItems) ||
    typeof currentIndex !== 'number' ||
    currentIndex < 0 ||
    currentIndex >= mediaItems.length
  ) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Media not found</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ChevronLeft color={theme.text} size={36} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <ChevronLeft color={theme.text} size={36} />
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={mediaItems}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        renderItem={renderItem}
        style={{ flex: 1 }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Trash2 color="#fff" size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  text: {
    color: theme.text,
    fontFamily: 'Inter',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  mediaContainer: {
    width: width,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: width,
    height: height * 0.7,
    resizeMode: 'contain',
  },
  audioPlaceholder: {
    width: width,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.card,
  },
  timestamp: {
    position: 'absolute',
    bottom: 50,
    color: theme.muted,
    fontSize: 15,
    fontFamily: 'Inter',
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  deleteButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    backgroundColor: '#E53935',
    padding: 14,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  galleryNote: {
    marginTop: 12,
    color: theme.muted,
    fontSize: 16,
    fontStyle: 'italic',
    paddingHorizontal: 30,
    textAlign: 'center',
    lineHeight: 20,
  },
});
