import React, { useState, useContext, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { theme } from '../../constants/colors';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SettingsContext } from '../../contexts/SettingsContext';
import * as Haptics from 'expo-haptics';

export default function CalculatorUnlock() {
  const navigation = useNavigation();
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [lastResult, setLastResult] = useState(null);
  const [justEvaluated, setJustEvaluated] = useState(false);
  const { accessPin } = useContext(SettingsContext);
  const scrollRef = useRef();

  // PIN unlock logic
  const { setIsUnlocked } = useContext(SettingsContext);

  const handlePress = (value) => {
    const operators = ['+', '-', '*', '/', '%'];
    const lastChar = expression.slice(-1);
  
    if (expression === '' && (operators.includes(value) || value === '%')) {
      setExpression('0' + value);
      return;
    }

    // Handle '.'
    if (value === '.') {
      // If empty, insert 0.
      if (expression === '') {
        setExpression('0.');
        return;
      }

      // If last character is an operator, insert 0.
      if (operators.includes(lastChar)) {
        setExpression(expression + '0.');
        return;
      }

      // Prevent multiple dots in the same number
      const parts = expression.split(/[\+\-\×\/%]/); // split by operator
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('.')) {
        return; // already has a dot
      }
    }

    // Prevent double operators
    if (operators.includes(lastChar) && operators.includes(value)) {
      return;
    }

    // Reset after evaluation
    if (justEvaluated && !operators.includes(value)) {
      setExpression(value);
      setJustEvaluated(false);
      return;
    }

    if (justEvaluated && operators.includes(value)) {
      setExpression(String(lastResult) + value);
      setJustEvaluated(false);
      return;
    }
  
    // Prevent leading zero chaining (e.g. 01, 00, 012)
    if (
      value >= '0' && value <= '9' && // current input is a digit
      expression.length > 0
    ) {
      const parts = expression.split(/[\+\-\*\/%]/); // split by operators
      const lastPart = parts[parts.length - 1];

      if (lastPart === '0') {
        return; // stop if trying to chain after a leading 0
      }
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

    if (cleaned === '') return;

    const lastChar = cleaned.slice(-1);

    // Check for unlock PIN directly entered
    if (cleaned === accessPin) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsUnlocked(true);
      return;
    }

    const binaryOperators = ['+', '-', '*', '/'];
    if (binaryOperators.includes(lastChar)) {
      return;
    }

    try {
      let evalResult = eval(cleaned.replace(/%/g, '/100'));

      if (typeof evalResult === 'number' && isFinite(evalResult)) {
        evalResult = Number(evalResult.toPrecision(10));
      }

      setResult(String(evalResult));
      setLastResult(evalResult);
      setJustEvaluated(true);
    } catch (err) {
      setResult('Error');
      setJustEvaluated(true);
    }
  };

  const renderButton = (label, onPress, key) => (
    <TouchableOpacity
      key={key}
      style={[
        label === 'zero' ? styles.longButton : styles.button,
        label === '=' || label === '+' || label === '−' || label === '×' || label === '÷' ? styles.operator : null,
        label === 'AC' || label === '⌫' ? styles.functionButton : null,
      ]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{label === 'zero' ? '0' : label}</Text>
    </TouchableOpacity>
  );

  const buttons = [
    ['AC', '⌫', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['zero', '.', '='],
  ];

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, [expression]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 10 : StatusBar.currentHeight,
        backgroundColor: theme.background,
      }}
    >
      <View style={styles.container}>
        {/* Header with back icon */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ChevronLeft size={32} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Calculator</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Display */}
        <View style={styles.display}>
          <View style={styles.expressionContainer}>
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            >
              <Text style={styles.expressionText}>
                {expression
                  .replace(/\*/g, '×')
                  .replace(/\//g, '÷')
                  .replace(/-/g, '−')}
              </Text>
            </ScrollView>
          </View>
          {result !== '' && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
            >
              <Text style={styles.result} numberOfLines={1}>
                = {result}
              </Text>
            </ScrollView>
          )}
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
                  else if (label === 'zero') handlePress('0');
                  else handlePress(label);
                }, `${rowIndex}-${i}`)
              )}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
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
    fontSize: 28,
    color: theme.text,
    fontFamily: 'Inter',
  },
  display: {
    backgroundColor: theme.background,
    borderRadius: 10,
    padding: 16,
    minHeight: 150,
    justifyContent: 'center',
    marginBottom: 10,
  },
  expression: {
    fontSize: 50,
    color: theme.text,
    textAlign: 'right',
    fontFamily: 'Inter',
  },
  result: {
    fontSize: 35,
    textAlign: 'right',
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
  longButton: {
    flex: 2,                    // ⬅️ take up double width
    aspectRatio: 2,            // ⬅️ same shape as 2 buttons
    marginHorizontal: 4,
    aspectRatio: undefined,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 16,
  },
  expressionContainer: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'flex-end',
  },
  expressionText: {
    fontSize: 50,
    color: theme.text,
    textAlign: 'right',
    fontFamily: 'Inter',
  },
});
