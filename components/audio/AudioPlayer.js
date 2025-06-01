import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { Play, Pause } from 'lucide-react-native';
import { theme } from '../../constants/colors';

export default function AudioPlayer({ uri }) {
  const soundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadSound = async () => {
      try {
        const { sound, status } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );
        if (!isMounted) return;
        soundRef.current = sound;
        setDuration(status.durationMillis || 1);
        setIsLoaded(true);
      } catch (e) {
        console.error('Failed to load sound:', e);
      }
    };

    loadSound();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch((e) => {
          console.warn('🧹 Failed to unload sound cleanly:', e);
        });
      }
    };
  }, []);

  const loadSound = async () => {
    try {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
      setDuration(status.durationMillis || 1);
      setIsLoaded(true);
    } catch (e) {
      console.error('Failed to load sound:', e);
    }
  };

  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) return;

    if (!isSeeking) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 1);
    }

    if (status.didJustFinish) {
      setIsPlaying(false);
      soundRef.current.setPositionAsync(0).catch(() => {});
    }
  };

  const togglePlayback = async () => {
    if (!isLoaded || !soundRef.current) return;

    if (isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  };

  const handleSlidingStart = () => {
    setIsSeeking(true);
  };

  const handleSlidingComplete = async (value) => {
    if (!soundRef.current) return;
    await soundRef.current.setPositionAsync(value);
    setIsSeeking(false);
  };

  const formatTime = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={togglePlayback} style={styles.button}>
        {isPlaying ? (
          <Pause color="#fff" size={28} />
        ) : (
          <Play color="#fff" size={28} />
        )}
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.timestamp}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>

        <Slider
          style={{ width: '90%', height: 40 }}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingStart={handleSlidingStart}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={theme.accent}
          maximumTrackTintColor="#888"
          thumbTintColor={theme.accent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    width: '100%',
    backgroundColor: theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: theme.accent,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  timestamp: {
    color: theme.text,
    fontSize: 14,
    marginBottom: 6,
  },
});
