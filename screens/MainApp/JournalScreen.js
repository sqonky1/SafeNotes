import React, { useEffect, useState, useContext, useRef } from 'react';
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
import * as SecureStore from 'expo-secure-store';
import { theme } from '../../constants/colors';
import { SettingsContext } from '../../contexts/SettingsContext';
import { useNavigation } from '@react-navigation/native';
import { AudioLines, ImageIcon, Camera } from 'lucide-react-native';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { saveMediaLocally } from '../../services/saveMediaLocally';
import Constants from 'expo-constants';
import { Audio } from 'expo-av';
import BackButton from '../../components/UI/BackButton';

export default function JournalScreen() {
  const [media, setMedia] = useState([]);
  const stopTimeout = useRef(null);
  const navigation = useNavigation();
  const {
    autoWipeTTL,
    cameraEnabled,
    micEnabled,
    galleryEnabled,
  } = useContext(SettingsContext);
  const [recording, setRecording] = useState(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    const stored = await SecureStore.getItemAsync('journalMedia');
    let parsed = stored ? JSON.parse(stored) : [];

    if (autoWipeTTL !== 'never') {
      const threshold = Date.now() - (autoWipeTTL === '24h' ? 86400000 : 172800000);
      parsed = parsed.filter(item => item.timestamp > threshold);
    }

    parsed.sort((a, b) => b.timestamp - a.timestamp);
    setMedia(parsed);
    await SecureStore.setItemAsync('journalMedia', JSON.stringify(parsed));
  };

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
      showPermissionDialog('Media Gallery', () => {}); // prevents continuation
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const savedPath = await saveMediaLocally(uri);
      const type = uri.includes('video') ? 'video' : uri.includes('image') ? 'image' : 'unknown';
      const entry = {
        id: Date.now().toString(),
        uri: savedPath,
        type,
        timestamp: Date.now(),
      };
      const updated = [entry, ...media];
      setMedia(updated);
      await SecureStore.setItemAsync('journalMedia', JSON.stringify(updated));
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('MediaView', { media, index: media.findIndex(m => m.id === item.id) })}
    >
      {item.type === 'audio' ? (
        <View style={styles.audioPlaceholder}>
          <AudioLines color={theme.text} size={32} />
        </View>
      ) : (
        <Image source={{ uri: item.uri }} style={styles.image} />
      )}
    </TouchableOpacity>
  );

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
              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
              });

              if (!result.canceled) {
                const uri = result.assets[0].uri;
                const savedPath = await saveMediaLocally(uri);
                const entry = {
                  id: Date.now().toString(),
                  uri: savedPath,
                  type: 'image',
                  timestamp: Date.now(),
                };
                const updated = [entry, ...media];
                setMedia(updated);
                await SecureStore.setItemAsync('journalMedia', JSON.stringify(updated));
              }
            },
          },
        ]
      );
      return;
    }

    // ✅ mic + camera both enabled
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      videoMaxDuration: 30,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const savedPath = await saveMediaLocally(uri);
      const type = uri.includes('video') ? 'video' : 'image';
      const entry = {
        id: Date.now().toString(),
        uri: savedPath,
        type,
        timestamp: Date.now(),
      };
      const updated = [entry, ...media];
      setMedia(updated);
      await SecureStore.setItemAsync('journalMedia', JSON.stringify(updated));
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
    } catch (error) {
      console.error('Failed to start recording', error);
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
      await SecureStore.setItemAsync('journalMedia', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to stop recording', error);
      Alert.alert('Error', 'Could not save recording.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton style={styles.backButton} />
        <Text style={styles.title}>Journal</Text>
      </View>

      <Text style={styles.autowipe}>
        Auto-wipe: Every {autoWipeTTL === 'never' ? 'Never' : autoWipeTTL}
      </Text>
      <Text style={styles.subtext}>Audio max 60s • Video max 30s</Text>

      <FlatList
        data={media}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.grid}
      />

      <View style={styles.fabContainer}>
        {/* Mic FAB */}
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
            if (Platform.OS === 'android' && Constants.appOwnership !== 'expo') {
              if (!recording) {
                handleStartRecording();
              } else {
                handleStopRecording();
              }
            } else {
              Alert.alert('Unavailable', 'Audio recording is only supported on Android with a custom build.');
            }
          }}
        >
          <AudioLines color="#fff" size={30} />
        </TouchableOpacity>

        {/* Camera FAB */}
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: cameraEnabled ? theme.accent : '#555' },
          ]}
          onPress={handleCameraCapture}
        >
          <Camera color="#fff" size={30} />
        </TouchableOpacity>

        {/* Gallery FAB */}
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
    paddingTop: 70,   // simulate status bar height + spacing
    paddingBottom: 0,
    position: 'relative',
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    color: theme.text,
    marginLeft: 0, // pushes it slightly right of back button
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
    padding: 4,
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
});
