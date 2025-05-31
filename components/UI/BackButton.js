import React, { useContext } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { TabHistoryContext } from '../../contexts/TabHistoryContext'; // adjust if you move the file

const BackButton = ({ color = 'white', size = 40, style }) => {
  const navigation = useNavigation();
  const { popTab } = useContext(TabHistoryContext);

  const handleBack = () => {
    const lastTab = popTab();
    if (lastTab) {
      navigation.navigate(lastTab);
    }
  };

  return (
    <Pressable onPress={handleBack} style={[styles.button, style]}>
      <ChevronLeft color={color} size={size} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 50,
    left: 5,
    padding: 16,
    zIndex: 1,
  },
});

export default BackButton;
