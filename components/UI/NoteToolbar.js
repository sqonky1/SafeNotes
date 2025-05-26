import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { TextSearch, Calculator, Type } from 'lucide-react-native';
import { theme } from '../../constants/colors';

export default function NoteToolbar({ onSearch, onCalculator, onFormat }) {
    return (
        <View style={styles.toolbar}>
        <TouchableOpacity onPress={onSearch}>
            <TextSearch size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onCalculator}>
            <Calculator size={24} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onFormat}>
            <Type size={24} color={theme.text} />
        </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});
