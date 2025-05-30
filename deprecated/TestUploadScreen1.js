import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, StyleSheet, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { uploadMediaAndGetPublicUrl } from '../services/uploadMediaAndGetPublicUrl';

export default function TestPickerOnly() {
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [url, setUrl]   = useState(null);

  // Ask for permission on load
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Allow camera roll access to pick media.');
      }
    })();
  }, []);

  const pickMedia = async () => {
    console.log("Launching media picker...");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });

    console.log("Picker result:", result);
    Alert.alert("Picker Result", JSON.stringify(result, null, 2));

    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      setImageUri(asset.uri);

      try {
        setLoading(true);
        const publicUrl = await uploadMediaAndGetPublicUrl(asset.uri, asset.mimeType);
        setUrl(publicUrl);
        Alert.alert("Upload Success", "Media uploaded and public URL generated.");
      } catch (err) {
        console.error("Upload Failed", err);
        Alert.alert("Upload Failed", err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Media Picker Test</Text>
      <Button title="Pick from Gallery" onPress={pickMedia} />
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 20,
  },
  preview: {
    width: 300,
    height: 300,
    marginTop: 24,
  },
});