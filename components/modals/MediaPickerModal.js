import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { theme } from '../../constants/colors';

export default function MediaPickerModal({ visible, onClose, onConfirm }) {
  const [media, setMedia] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (visible) loadMedia();
  }, [visible]);

  const loadMedia = async () => {
    try {
      const stored = await AsyncStorage.getItem('journalMedia');
      const parsed = stored ? JSON.parse(stored) : [];
      const valid = [];
      for (const item of parsed) {
        const info = await FileSystem.getInfoAsync(item.uri);
        if (info.exists) valid.push(item);
      }
      setMedia(valid);
      setSelected([]);
    } catch (e) {
      Alert.alert('Error', 'Could not load media.');
    }
  };

  const toggleSelect = (item) => {
    const isSelected = selected.find((s) => s.uri === item.uri);
    if (isSelected) {
      setSelected((prev) => prev.filter((s) => s.uri !== item.uri));
    } else {
      const isVideo = item.type === 'video';
      const alreadyHasVideo = selected.some((s) => s.type === 'video');

      if (selected.length >= 5) {
        Alert.alert('Limit reached', 'You can select up to 5 media items.');
        return;
      }
      if (isVideo && alreadyHasVideo) {
        Alert.alert('Video limit', 'Only one video can be selected.');
        return;
      }
      setSelected((prev) => [...prev, item]);
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selected.find((s) => s.uri === item.uri);

    return (
      <TouchableOpacity
        onPress={() => toggleSelect(item)}
        style={styles.itemContainer}
      >
        {item.type === 'image' && (
          <Image source={{ uri: item.uri }} style={styles.media} />
        )}
        {item.type === 'video' && (
          <Video
            source={{ uri: item.uri }}
            style={styles.media}
            resizeMode="cover"
            isMuted
            shouldPlay={false}
          />
        )}
        {item.type === 'audio' && (
          <View style={styles.audioBox}>
            <Ionicons name="musical-notes" size={28} color={theme.text} />
          </View>
        )}
        {isSelected && (
          <View style={styles.checkOverlay}>
            <Ionicons name="checkmark-circle" size={24} color={theme.accent} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Text style={styles.title}>Select Media (Max 5)</Text>
          <FlatList
            data={media}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.grid}
          />
          <TouchableOpacity style={styles.doneBtn} onPress={() => onConfirm(selected.map((i) => i.uri))}>
            <Text style={styles.doneText}>Done ({selected.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: theme.card,
    width: '90%',
    maxHeight: '85%',
    borderRadius: 16,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Inter',
    color: theme.text,
    marginBottom: 10,
  },
  grid: {
    paddingBottom: 16,
  },
  itemContainer: {
    flex: 1 / 3,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.input,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  audioBox: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.input,
  },
  checkOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: 2,
  },
  doneBtn: {
    backgroundColor: theme.accent,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  doneText: {
    color: 'white',
    fontFamily: 'Inter',
    fontSize: 16,
  },
  cancelText: {
    color: theme.muted,
    fontFamily: 'Inter',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});
