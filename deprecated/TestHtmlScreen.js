// screens/TestHtmlScreen.js

import React, { useState } from 'react';
import { View, Text, Button, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as Audio from 'expo-av';
import { Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { WebView } from 'react-native-webview';

import { saveMediaLocally } from '../services/saveMediaLocally';
import { uploadMediaFromLocal } from '../services/uploadMediaFromLocal';

export default function TestHtmlScreen() {
  const [mediaList, setMediaList] = useState([]);
  const [htmlUrl, setHtmlUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickMedia = async () => {
    if (mediaList.length >= 5) return Alert.alert('Limit reached', 'Max 5 media allowed.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All });
    if (!result.canceled) {
      handleMedia(result.assets[0].uri, result.assets[0].type);
    }
  };

  const captureCamera = async () => {
    if (mediaList.length >= 5) return Alert.alert('Limit reached', 'Max 5 media allowed.');

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
    Alert.alert("Camera permission is required.");
    return;
    }

    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All });
    if (!result.canceled) {
      handleMedia(result.assets[0].uri, result.assets[0].type);
    }
  };

  const recordAudio = async () => {
    if (mediaList.length >= 5) return Alert.alert('Limit reached', 'Max 5 media allowed.');
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) return;

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    Alert.alert('Recording...', 'Tap OK to stop.', [
      {
        text: 'OK',
        onPress: async () => {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          handleMedia(uri, 'audio');
        }
      }
    ]);
  };

  const handleMedia = async (uri, type) => {
    console.log('media type:', type, 'uri:', uri);
    try {
        let mimeType = 'application/octet-stream';

        if (type === 'image') {
        mimeType = 'image/jpeg';
        } else if (type === 'video') {
        mimeType = 'video/mp4';
        } else if (type === 'audio') {
        mimeType = 'audio/m4a';
        }
      const localPath = await saveMediaLocally(uri);
      const publicUrl = await uploadMediaFromLocal(localPath, mimeType);
      setMediaList(prev => [...prev, publicUrl]);
      console.log('Uploaded media URL:', publicUrl);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  const generateHTML = async () => {
    try {
      if (mediaList.length === 0) return Alert.alert('No media', 'Add at least one media.');
      setLoading(true);
      const res = await fetch('https://safenotes-sos-html.safenotes-sos.workers.dev/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ media: mediaList })
      });
    const { html_url } = await res.json();
    console.log('Generated HTML URL:', html_url);
    setHtmlUrl(html_url);
    } catch (err) {
      Alert.alert('Error generating HTML', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Test SOS HTML Generator</Text>

      <Button title="Pick from Gallery" onPress={pickMedia} />
      <Button title="Open Camera" onPress={captureCamera} />
      <Button title="Record Audio" onPress={recordAudio} />
      <Button title="Generate HTML" onPress={generateHTML} disabled={loading} />

      {loading && <ActivityIndicator size="large" style={{ marginVertical: 20 }} />}

      {htmlUrl && (
        <View style={{ marginTop: 20 }}>
          <Text selectable style={{ color: 'blue' }}>{htmlUrl}</Text>
          <View style={{ height: 400, marginTop: 10 }}>
            <WebView source={{ uri: htmlUrl }} />
          </View>
        </View>
      )}
        <View style={{ marginTop: 16 }}>
        {mediaList.map((url, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
                {url.endsWith('.mp4') || url.endsWith('.mov') ? (
                <Video
                source={{ uri: url }}
                style={{ width: '100%', height: 200, borderRadius: 8 }}
                useNativeControls
                resizeMode="contain"
                isLooping
                shouldPlay={false}
                />
                ) : url.endsWith('.m4a') ? (
                <Text>{`[Audio ${index + 1}]`}</Text>
                ) : (
                <Image source={{ uri: url }} style={{ width: '100%', height: 200, borderRadius: 8 }} />
                )}
            </View>
        ))}
        </View>
    </ScrollView>
  );
}
