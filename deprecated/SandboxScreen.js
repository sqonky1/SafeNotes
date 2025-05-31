import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native'

export default function SandboxScreen() {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('Hello World')

  useEffect(() => {
    if (name.length > 0) {
      setMessage(`Hello, ${name}!`)
    } else {
      setMessage('Hello World')
    }
  }, [name])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculator</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter a fruit"
        placeholderTextColor="rgba(255, 255, 255, 0.6)"
        value={name}
        onChangeText={setName}
      />

      <TouchableOpacity style={styles.button} onPress={() => setName('')}>
        <Text style={styles.buttonText}>Clear</Text>
      </TouchableOpacity>

      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  title: {
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#fff',
    borderWidth: 1,
    textAlign: 'center',
    borderColor: '#999',
    borderRadius: 8,
    padding: 50,
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  message: {
    fontFamily: 'Inter',
    fontWeight: '400',
    fontSize: 18,
    color: '#fff',
  },
})
