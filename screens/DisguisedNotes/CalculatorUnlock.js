import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { theme } from '../../constants/colors';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

export default function CalculatorUnlock() {
  const navigation = useNavigation();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [justEvaluated, setJustEvaluated] = useState(false);

  const handlePress = (value) => {
    const operators = ['+', '-', '*', '/', '%', '.'];
    const lastChar = expression.slice(-1);

    // Prevent double operators
    if (operators.includes(lastChar) && operators.includes(value)) {
      return;
    }

    // Clear if last was "=" and user starts fresh
    if (justEvaluated && !operators.includes(value)) {
      setExpression(value);
      setJustEvaluated(false);
      return;
    }

    // Continue from last result if starting with an operator
    if (justEvaluated && operators.includes(value)) {
      setExpression(String(lastResult) + value);
      setJustEvaluated(false);
      return;
    }

    setExpression(prev => prev + value);
  };

  const handleClear = () => {
    setExpression('');
    setResult('');
  };

  const handleDelete = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleEvaluate = () => {
    const cleaned = expression.trim();

    // Check for unlock PIN directly entered
    if (cleaned === '1234') {
      // ✅ trigger unlock logic here
      return;
    }

    try {
      const evalResult = eval(cleaned.replace(/%/g, '/100'));
      setResult(String(evalResult));
      setLastResult(evalResult);
      setJustEvaluated(true);
    } catch (err) {
      setResult('Error');
      setJustEvaluated(true);
    }
  };

  const renderButton = (label, onPress, key) => (
    <TouchableOpacity key={key} style={[
      styles.button,
      label === '=' || label === '+' || label === '−' || label === '×' || label === '÷' ? styles.operator : null,
      label === 'AC' || label === '⌫' ? styles.functionButton : null,
    ]} onPress={onPress}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );

  const buttons = [
    ['AC', '⌫', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  return (
    <View style={styles.container}>
      {/* Header with back icon */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Calculator</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Display */}
      <View style={styles.display}>
        <Text style={styles.expression}>{expression}</Text>
        {result !== '' && <Text style={styles.result}>= {result}</Text>}
      </View>

      {/* Buttons */}
      <View style={styles.buttonGrid}>
        {buttons.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((label, i) =>
              renderButton(label, () => {
                if (label === 'AC') handleClear();
                else if (label === '⌫') handleDelete();
                else if (label === '=') handleEvaluate();
                else if (label === '÷') handlePress('/');
                else if (label === '×') handlePress('*');
                else if (label === '−') handlePress('-');
                else handlePress(label);
              }, `${rowIndex}-${i}`)
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 50, // add this!
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    color: theme.text,
    fontFamily: 'Inter',
  },
  display: {
    backgroundColor: theme.input,
    borderRadius: 10,
    padding: 16,
    minHeight: 100,
    justifyContent: 'center',
    marginBottom: 20,
  },
  expression: {
    fontSize: 24,
    color: theme.text,
    fontFamily: 'Inter',
  },
  result: {
    fontSize: 18,
    color: theme.muted,
    fontFamily: 'Inter',
    marginTop: 4,
  },
  buttonGrid: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: theme.card,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  functionButton: {
    backgroundColor: '#4a4a4a',
  },
  buttonText: {
    fontSize: 24,
    color: theme.text,
    fontFamily: 'Inter',
  },
  operator: {
    backgroundColor: theme.accent,
  },
});
