import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export default function FadeTransitionWrapper({ children, visible }) {
  const opacity = useRef(new Animated.Value(visible ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Animated.View style={{ flex: 1, position: 'absolute', width: '100%', height: '100%' }}>
      {children}
    </Animated.View>
  );
}
