// components/Audio/AudioRecordModal.js
import React, { useState, useRef } from 'react';
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { theme } from '../../constants/colors';
import { Mic, Square, Save, X } from 'lucide-react-native';

export default function AudioRecordModal({ visible, onClose, onSave }) {
  const [recording, setRecording] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const stopTimeout = useRef(null);

  const startRecording = async () => {
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

      stopTimeout.current = setTimeout(() => stopRecording(), 60000);
    } catch (e) {
      console.error('Recording error:', e);
      Alert.alert('Error', 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;
      clearTimeout(stopTimeout.current);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsSaving(true);
      await onSave(uri);
      setIsSaving(false);
      onClose();
    } catch (e) {
      console.error('Stop error:', e);
      Alert.alert('Error', 'Could not save recording.');
      setIsSaving(false);
    }
  };

  const handleCancel = async () => {
    try {
      if (recording) {
        clearTimeout(stopTimeout.current);
        await recording.stopAndUnloadAsync();
        await recording.createNewLoadedSoundAsync(); // Release resources
      }
    } catch (e) {
      console.warn('Cancel recording error:', e);
    } finally {
      setRecording(null);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Audio Recorder</Text>
          <Text style={styles.subtitle}>Max 60s • Press to start and stop</Text>

          {isSaving ? (
            <ActivityIndicator size="large" color={theme.accent} />
          ) : (
            <>
              <TouchableOpacity
                style={styles.recordButton}
                onPress={recording ? stopRecording : startRecording}
              >
                {recording ? (
                  <Square color="#fff" size={32} />
                ) : (
                  <Mic color="#fff" size={32} />
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCancel} style={styles.cancel}>
                <X color={theme.text} size={28} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    padding: 24,
    backgroundColor: theme.card,
    borderRadius: 16,
    alignItems: 'center',
  },
  title: {
    color: theme.text,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    color: theme.muted,
    fontSize: 16,
    marginBottom: 20,
  },
  recordButton: {
    backgroundColor: theme.accent,
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  cancel: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
});
