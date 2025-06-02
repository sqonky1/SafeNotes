// JournalScreen.js
import React, { useRef, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../constants/colors';
import { SettingsContext } from '../../contexts/SettingsContext';
import { useNavigation } from '@react-navigation/native';
import { AudioLines, ImageIcon, Camera } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { saveMediaLocally } from '../../services/saveMediaLocally';
import Constants from 'expo-constants';
import { Audio, Video } from 'expo-av';
import BackButton from '../../components/UI/BackButton';
import AudioRecordModal from '../../components/audio/AudioRecordModal';

export default function JournalScreen() {
  const [media, setMedia] = React.useState([]);
  const stopTimeout = useRef(null);
  const navigation = useNavigation();
  const {
    autoWipeTTL,
    cameraEnabled,
    micEnabled,
    galleryEnabled,
    setIsUnlocked,
  } = useContext(SettingsContext);
  const [recording, setRecording] = React.useState(null);
  const isExpoGo = Constants.appOwnership === 'expo';
  const [showMicModal, setShowMicModal] = React.useState(false);

  const STORAGE_KEY = 'journalMedia';

  useFocusEffect(
    React.useCallback(() => {
      loadMediaFromAsyncStorage();
    }, [autoWipeTTL])
  );

  function resolveMediaType(uri, fallback = 'unknown') {
    if (uri.endsWith('.mp4')) return 'video';
    if (uri.endsWith('.jpg') || uri.endsWith('.jpeg') || uri.endsWith('.png')) return 'image';
    if (uri.endsWith('.m4a') || uri.endsWith('.mp3') || uri.endsWith('.aac')) return 'audio';
    return fallback;
  }

  async function loadMediaFromAsyncStorage() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      let parsed = stored ? JSON.parse(stored) : [];

      if (autoWipeTTL !== 'never') {
        const threshold =
          Date.now() - (autoWipeTTL === '24h' ? 86400000 : 172800000);
        const fresh = [];
        for (const item of parsed) {
          if (item.timestamp > threshold) {
            fresh.push(item);
          } else {
            try {
              await FileSystem.deleteAsync(item.uri, { idempotent: true });
            } catch (e) {
              console.warn('Failed to delete expired media:', item.uri);
            }
          }
        }
        parsed = fresh;
      }

      parsed.sort((a, b) => b.timestamp - a.timestamp);
      setMedia(parsed);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {
      console.warn('Failed to load Journal from AsyncStorage:', e);
    }
  }

  const showPermissionDialog = (type, onCancel) => {
    Alert.alert(
      `${type} Disabled`,
      `You’ve disabled ${type.toLowerCase()} access in settings. To use this feature, enable it in Settings.`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => onCancel?.() },
        {
          text: 'Go to Settings',
          onPress: () => navigation.navigate('Settings'),
        },
      ]
    );
  };

  const handleGalleryUpload = async () => {
    if (!galleryEnabled) {
      showPermissionDialog('Media Gallery', () => {});
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
      });
      if (result.canceled) return;

      const asset = result.assets[0];
      const uri = asset.uri;
      const savedPath = await saveMediaLocally(uri);
      const type = resolveMediaType(savedPath, asset?.type ?? 'unknown');

      const info = await FileSystem.getInfoAsync(savedPath);
      if (!info.exists) {
        Alert.alert('Save failed', 'Could not save selected media.');
        return;
      }

      const entry = {
        id: Date.now().toString(),
        uri: savedPath,
        type,
        timestamp: Date.now(),
      };

      setMedia((prev) => [entry, ...prev]);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...media]));

      setTimeout(() => {
        setIsUnlocked(true);
      }, 500);
      setTimeout(() => {
        navigation.navigate('Journal');
      }, 500);
    } catch (e) {
      Alert.alert('Upload Error', 'Something went wrong while uploading media.');
    }
  };

  const renderItem = ({ item }) => {
    try {
      if (!item || !item.uri || !item.type) return null;

      const openMedia = () => {
        const mediaIndex = media.findIndex((m) => m.id === item.id);
        if (mediaIndex === -1) {
          Alert.alert('Error', 'Media not found.');
          return;
        }
        navigation.navigate('MediaView', {
          media,
          index: mediaIndex,
        });
      };

      if (item.type === 'audio') {
        return (
          <TouchableOpacity style={styles.itemContainer} onPress={openMedia}>
            <View style={styles.audioPlaceholder}>
              <AudioLines color={theme.text} size={32} />
            </View>
          </TouchableOpacity>
        );
      }

      if (item.type === 'video') {
        return (
          <TouchableOpacity style={styles.itemContainer} onPress={openMedia}>
            <View style={styles.videoWrapper}>
              <Video
                source={{ uri: item.uri }}
                style={styles.videoThumbnail}
                useNativeControls={false}
                resizeMode="cover"
                shouldPlay={false}
                isLooping={false}
              />
              <View style={styles.playIcon}>
                <Ionicons name="play" size={36} color="#fff" style={{ transform: [{ translateY: -6 }, { translateX: -5 }] }} />
              </View>
            </View>
          </TouchableOpacity>
        );
      }

      if (item.type === 'image') {
        return (
          <TouchableOpacity style={styles.itemContainer} onPress={openMedia}>
            <Image source={{ uri: item.uri }} style={styles.image} />
          </TouchableOpacity>
        );
      }

      return null;
    } catch (err) {
      console.warn('🛠️ Failed to render media item:', err);
      return null;
    }
  };

  function openMedia(item) {
    const mediaIndex = media.findIndex((m) => m.id === item.id);
    if (mediaIndex === -1) {
      Alert.alert('Error', 'Media not found.');
      return;
    }
    navigation.navigate('MediaView', {
      media,
      index: mediaIndex,
    });
  }

  const handleCameraCapture = async () => {
    if (!cameraEnabled) {
      showPermissionDialog('Camera');
      return;
    }

    if (!micEnabled) {
      Alert.alert(
        'Microphone Disabled',
        'You’ve disabled microphone access, so video recording is unavailable.\n\nTo record video, enable microphone access in settings.',
        [
          {
            text: 'Go to Settings',
            onPress: () => navigation.navigate('Settings'),
          },
          {
            text: 'Continue with Photo Only',
            onPress: async () => {
              try {
                const result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                });
                if (!result.canceled) {
                  const asset = result.assets[0];
                  const uri = asset.uri;
                  const entry = {
                    id: Date.now().toString(),
                    uri,
                    type: 'image',
                    timestamp: Date.now(),
                  };
                  const updated = [entry, ...media];
                  setMedia(updated);
                  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

                  setIsUnlocked(true);
                  navigation.navigate('Journal');
                }
              } catch {
                Alert.alert('Error', 'Could not take photo.');
              }
            },
          },
        ]
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        videoMaxDuration: 30,
      });
      if (!result.canceled) {
        const asset = result.assets[0];
        const mediaType = asset.type ?? result.type;
        const uri = asset.uri;
        const entry = {
          id: Date.now().toString(),
          uri,
          type: mediaType,
          timestamp: Date.now(),
        };
        const updated = [entry, ...media];
        setMedia(updated);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        setIsUnlocked(true);
        navigation.navigate('Journal');
      }
    } catch {
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const handleStartRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission denied', 'Cannot access microphone.');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(recording);
      stopTimeout.current = setTimeout(() => {
        handleStopRecording();
      }, 60000);
    } catch {
      Alert.alert('Error', 'Could not start recording.');
    }
  };

  const handleStopRecording = async () => {
    if (stopTimeout.current) {
      clearTimeout(stopTimeout.current);
      stopTimeout.current = null;
    }
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      const savedPath = await saveMediaLocally(uri);
      const entry = {
        id: Date.now().toString(),
        uri: savedPath,
        type: 'audio',
        timestamp: Date.now(),
      };
      const updated = [entry, ...media];
      setMedia(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      Alert.alert('Error', 'Could not save recording.');
    }
  };

  const handleDeleteAll = () => {
    if (media.length === 0) {
      Alert.alert('Nothing to delete', 'Your journal is already empty.');
      return;
    }

    Alert.alert(
      'Delete all media?',
      'This will permanently delete all journal entries. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              for (const item of media) {
                await FileSystem.deleteAsync(item.uri, { idempotent: true });
              }
              setMedia([]);
              await AsyncStorage.removeItem(STORAGE_KEY);
            } catch (e) {
              Alert.alert('Error', 'Failed to delete all media.');
              console.warn('Failed bulk delete:', e);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <Text style={styles.title}>Journal</Text>
      </View>

      <Text style={styles.autowipe}>
        Auto-wipe: {autoWipeTTL === 'never' ? 'Never' : 'Every ' + autoWipeTTL}
      </Text>

      <View style={styles.subRow}>
        <Text style={styles.subtext}>Audio max 60s • Video max 30s</Text>
        <TouchableOpacity onPress={handleDeleteAll}>
          <Text style={styles.deleteAllText}>Delete All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={media}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.grid}
        overScrollMode="never" // 👈 PREVENTS BOUNCE-CRASH on Android
      />

      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: micEnabled ? theme.accent : '#555' },
          ]}
          onPress={() => {
            if (!micEnabled) {
              showPermissionDialog('Microphone');
              return;
            }

            if (isExpoGo) {
              Alert.alert(
                'Notice',
                'Expo Go cannot record audio.\nUse a custom dev build/emulator to test this feature.'
              );
              return;
            }

            setShowMicModal(true);
          }}
        >
          <AudioLines color="#fff" size={30} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: cameraEnabled ? theme.accent : '#555' },
          ]}
          onPress={handleCameraCapture}
        >
          <Camera color="#fff" size={30} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: galleryEnabled ? theme.accent : '#555' },
          ]}
          onPress={handleGalleryUpload}
        >
          <ImageIcon color="#fff" size={30} />
        </TouchableOpacity>
      </View>

      <AudioRecordModal
        visible={showMicModal}
        onClose={() => setShowMicModal(false)}
        onSave={async (uri) => {
          const savedPath = await saveMediaLocally(uri);
          const entry = {
            id: Date.now().toString(),
            uri: savedPath,
            type: 'audio',
            timestamp: Date.now(),
          };
          const updated = [entry, ...media];
          setMedia(updated);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 0,
    position: 'relative',
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    color: theme.text,
    marginLeft: 0,
  },
  autowipe: {
    color: theme.text,
    fontSize: 20,
    fontFamily: 'Inter',
    paddingHorizontal: 5,
    marginTop: 11,
    marginBottom: 11,
  },
  subtext: {
    color: theme.muted,
    fontSize: 16,
    fontFamily: 'Inter',
    paddingHorizontal: 5,
    marginTop: 0,
    marginBottom: 11,
  },
  grid: {
    padding: 0,
    paddingBottom: 120,
  },
  itemContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 4,
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  audioPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: theme.input,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    flexDirection: 'row',
    gap: 16,
  },
  fab: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    position: 'absolute',
    left: -25,
    top: 10,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    backgroundColor: 'rgba(0,0,0,0)',
    borderRadius: 20,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 5,
    marginBottom: 11,
  },
  deleteAllText: {
    color: theme.danger,
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '500',
  },
});
