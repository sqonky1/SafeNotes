import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextSearch, Calculator, Type } from 'lucide-react-native';
import { theme } from '../../constants/colors';
import * as Haptics from 'expo-haptics';

export default function NoteToolbar({ onSearch, onCalculator, onFormat }) {
    return (
        <View style={styles.toolbar}>
        <TouchableOpacity onPress={onSearch}>
            <TextSearch size={28} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onCalculator}>
            <Calculator size={28} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onFormat}>
            <Type size={28} color={theme.text} />
        </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});
