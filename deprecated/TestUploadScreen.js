import React, { useState } from 'react';
import { View, Text, Button, Image, Alert, ScrollView, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { saveMediaLocally } from '../services/saveMediaLocally';
import { uploadMediaFromLocal } from '../services/uploadMediaFromLocal';

export default function TestUploadScreen() {
  const [localUri, setLocalUri] = useState(null);
  const [publicUrl, setPublicUrl] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const selected = result.assets[0];
      try {
        const savedPath = await saveMediaLocally(selected.uri);
        setLocalUri(savedPath);
        setPublicUrl(null);
        Alert.alert('Saved locally!', savedPath);
      } catch (err) {
        Alert.alert('Save failed', err.message);
      }
    }
  };

  const uploadToSupabase = async () => {
    if (!localUri) {
      Alert.alert('No media', 'Pick media first.');
      return;
    }

    try {
      const info = await FileSystem.getInfoAsync(localUri);
      const mimeType = info.uri.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg';
      const url = await uploadMediaFromLocalAndGetPublicUrl(localUri, mimeType);
      setPublicUrl(url);
      Alert.alert('Uploaded to Supabase!', url);
    } catch (err) {
      Alert.alert('Upload failed', err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Test Media Upload</Text>

      <Button title="Pick Media (Gallery)" onPress={pickImage} />
      {localUri && (
        <Image source={{ uri: localUri }} style={styles.imagePreview} />
      )}
      <Button title="Upload to Supabase (SOS)" onPress={uploadToSupabase} />
      {publicUrl && (
        <Text selectable style={styles.link}>
          {publicUrl}
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  imagePreview: {
    width: '100%',
    height: 250,
    marginVertical: 16,
    borderRadius: 10,
  },
  link: {
    color: '#4181D4',
    marginTop: 12,
    textAlign: 'center',
  },
});
