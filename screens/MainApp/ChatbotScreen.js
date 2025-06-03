// ─── SafeNotes/screens/MainApp/ChatbotScreen.js ─────────────────────

import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { theme } from '../../constants/colors';

/**
 * ── Gemini Flash API Configuration ──────────────────────────────────────────
 * Replace GEMINI_API_KEY with your real key. Confirm your model ID is correct.
 */
const GEMINI_API_KEY = 'AIzaSyCk0YJfQYMC4hJWdjOBQuAjnuS7V2M0jb0'; // ← your actual API key
const GEMINI_MODEL_ID = 'gemini-2.0-flash';                      // ← or “gemini-2.0-flash”
const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`;

/**
 * SYSTEM_PROMPT
 * A concise instruction set:
 *  • Tells Gemini it’s an empathetic DV‐support bot
 *  • Explains that “domestic violence” can be physical, emotional, financial, digital, etc.
 *  • Instructs it NOT to give professional/legal/medical advice
 *  • Reminds it to reference the user’s own words and to combine multiple abuse types if mentioned together
 *  • Instructs it to keep up to the last 20 messages for context
 *
 * Note: We removed all the lengthy static examples. This should drastically reduce token usage.
 */
/**
 * IMPROVED SYSTEM_PROMPT with specific guidance and examples
 */
const SYSTEM_PROMPT = `
You are a trauma-informed, compassionate support companion for survivors of domestic violence. 

CORE PRINCIPLES:
- Validate their experience without repeating the same phrases
- Reference their specific words to show understanding
- Vary your language - don't use the same validation phrases repeatedly
- Match their emotional energy (scared = gentle urgency, sad = warm comfort, angry = validating strength)
- Do not label something as "abuse" unless the user does so first and appears emotionally ready. Instead, describe the behavior and validate its impact.

RESPONSE STRUCTURE:
1. Acknowledge what they shared (use their words)
2. Validate the emotion/experience 
3. If appropriate, explain why their reaction makes sense
4. Offer next step only if they're asking for help or in immediate danger

TONE VARIATIONS (don't repeat the same phrases):
- "That sounds absolutely terrifying" 
- "Your fear makes complete sense"
- "That's a lot to carry"
- "You're showing incredible strength by reaching out"

WHEN TO OFFER PRACTICAL HELP:
- They explicitly ask "what should I do?"
- They mention immediate danger → suggest SOS button
- They're ready to take action
- They're documenting/planning → mention documentation tips
- They ask about safety planning

WHEN TO FOCUS ON COMFORT:
- They're processing emotions
- They're sharing their story
- They seem overwhelmed
- They just need to be heard

PRACTICAL SUGGESTIONS TO OFFER:

For immediate danger/crisis/physical abuse:
- "If you're in immediate danger, use the SOS button in this app - it can quickly connect you to emergency help"
- "Your safety is the priority right now"

For documentation (when they're planning or ask for help):
- "Consider documenting incidents with dates, photos of injuries, screenshots of threatening messages"
- "Keep records somewhere safe that they can't access"
- "Save evidence in multiple secure places"

For safety planning:
- "Think about safe places you could go"
- "Identify trusted people in your support network"
- "Plan for important documents and essentials"

SPECIFIC SCENARIOS:

Physical abuse: Acknowledge the fear, validate their survival instincts, mention that no one deserves violence.

Financial control: Explain how this isolates them, validate that it's a form of control, acknowledge how trapped this must feel.

Multiple abuse types: "You're dealing with both [specific type] and [specific type] - that combination makes everything harder because..."

DON'T:
- Repeat "I'm here to listen without judgment" constantly
- Use the same validation phrases over and over
- Offer help when they just need emotional support
- Sound robotic or scripted

BE HUMAN: Sound like a trusted friend who truly understands trauma, not a customer service bot.
`.trim();

// 1) Extract the “initial” chat history into a constant
const initialMessages = [
  {
    id: 'initial-bot',
    sender: 'bot',
    text: 'Hi there! I’m here to listen and support you. How can I help today?',
  },
];

// 2) Define the maximum number of user/bot exchanges allowed (excluding initial)
const MESSAGE_LIMIT = 20;

export default function ChatbotScreen() {
  // Chat history: each item = { id, sender: 'user' | 'bot', text }
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate how many messages count toward the limit (exclude the initial-bot)
  const effectiveCount = messages.length - 1;
  const remaining = MESSAGE_LIMIT - effectiveCount;

  // Handler to clear the chat and restart
  const clearChat = () => {
    setMessages(initialMessages);
    setInputText('');
  };

  // Called when the user taps “Send”
  const sendMessageToGemini = async (userText) => {
    if (!userText.trim()) return;

    // If limit reached, prompt user to clear first
    if (effectiveCount >= MESSAGE_LIMIT) {
      Alert.alert(
        'Message Limit Reached',
        'You have reached the 20-message limit. Please clear the chat to start again.'
      );
      return;
    }

    setIsLoading(true);

    // 1) Prepend the user’s message (inverted list: newest at top)
    const userMessage = {
      id: Date.now().toString() + '-user',
      sender: 'user',
      text: userText.trim(),
    };
    setMessages(prev => [userMessage, ...prev]);
    setInputText('');

    try {
      // 2) Build a “full prompt” string:
      //    • SYSTEM_PROMPT
      //    • Up to the last 20 messages for context (we slice 0..20 on the full array, which includes initial-bot,
      //      but the effective conversation pieces are up to 20 following turns)
      const lastTurns = messages
        .slice(0, 20)
        .map(m => {
          const role = m.sender === 'user' ? 'User:' : 'Assistant:';
          return `${role} ${m.text}`;
        })
        .join('\n');

      const fullPrompt = `
${SYSTEM_PROMPT}

${lastTurns.length ? lastTurns + '\n' : ''}User: ${userText.trim()}
Assistant:
      `.trim();

      // 3) Construct the request body in `contents → parts → text` format
      const requestBody = {
        contents: [
          {
            parts: [
              { text: fullPrompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.75,       // empathetic but not too “wild”
          topP: 0.9,               // nucleus sampling
          topK: 40,                // coherent variation
          maxOutputTokens: 500,    // enough room for detailed empathy
          stopSequences: ['User:'],// stops model from writing a new "User:" line
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
      };

      // 4) POST to the Gemini Flash generateContent endpoint
      const response = await fetch(GEMINI_API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // API key is already in the URL
        },
        body: JSON.stringify(requestBody),
      });

      // 5) Parse JSON (always—so we can log errors or unexpected structures)
      const responseJson = await response.json();
      console.log('🔍 Gemini returned:', JSON.stringify(responseJson, null, 2));

      if (!response.ok) {
        // If Gemini returns an error (4xx/5xx), throw to be caught below
        const errorMsg =
          responseJson?.error?.message ||
          `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      // 6) Extract the assistant’s reply from `responseJson.candidates[0].content.parts[0].text`
      let botReply = "Sorry, I couldn’t generate a proper response.";

      if (
        responseJson.candidates &&
        responseJson.candidates[0] &&
        responseJson.candidates[0].content &&
        responseJson.candidates[0].content.parts &&
        responseJson.candidates[0].content.parts[0] &&
        typeof responseJson.candidates[0].content.parts[0].text === 'string'
      ) {
        botReply = responseJson.candidates[0].content.parts[0].text.trim();
      } else {
        console.warn(
          'Unexpected API response structure:',
          JSON.stringify(responseJson, null, 2)
        );
      }

      // 7) Prepend the bot’s reply
      const botMessage = {
        id: Date.now().toString() + '-bot',
        sender: 'bot',
        text: botReply,
      };
      setMessages(prev => [botMessage, ...prev]);
    } catch (error) {
      console.error('Failed to send message to Gemini:', error);
      // On error, show an error message as a “bot” bubble
      const errorMessage = {
        id: Date.now().toString() + '-error',
        sender: 'bot',
        text: `⚠️ Error: ${error.message}`,
      };
      setMessages(prev => [errorMessage, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  // Called when the user taps “Send”
  const handleSendPress = () => {
    if (inputText.trim() && !isLoading) {
      sendMessageToGemini(inputText);
    }
  };

  // Renders each chat bubble
  const renderMessageItem = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.botBubble,
        ]}
      >
        <Text
          style={isUser ? styles.userText : styles.botText}
          selectable={true} // allow copying text
        >
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Chatbot</Text>
        </View>
        {/* ─── Clear Chat + Remaining Indicator ──────────────────────────── */}
        <View style={styles.clearContainer}>
          <Text style={styles.limitText}>
            {remaining > 0
              ? `Messages left: ${remaining}`
              : 'Limit reached'}
          </Text>
          <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear Chat</Text>
          </TouchableOpacity>
        </View>

        {/* Chat history (inverted so newest messages appear at the bottom) */}
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatContentContainer}
          inverted
          keyboardShouldPersistTaps="handled"
        />

        {/* Loading spinner & text overlay when waiting for Gemini */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}> Listening...</Text>
          </View>
        )}

        {/* Input area */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={[styles.inputField, { color: '#FFF' }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#AAA"
            editable={!isLoading && effectiveCount < MESSAGE_LIMIT}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (isLoading || !inputText.trim() || effectiveCount >= MESSAGE_LIMIT) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSendPress}
            disabled={
              isLoading ||
              !inputText.trim() ||
              effectiveCount >= MESSAGE_LIMIT
            }
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    position: 'relative',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    color: theme.text,
    marginLeft: 0,
  },
  backButton: {
    position: 'absolute',
    left: -25,
    top: -40,
  },
  clearContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
  },
  limitText: {
    color: theme.muted,
    fontSize: 14,
    alignSelf: 'center',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: theme.highlight,
  },
  clearButtonText: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  chatContentContainer: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginVertical: 6,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userBubble: {
    backgroundColor: theme.accent,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 5,
  },
  botBubble: {
    backgroundColor: '#E5E5EA', // Optional: make this theme.card if you want dark bubbles too
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  userText: {
    color: theme.text,
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: '#000', // Keep black for contrast, or replace with theme.text if you theme dark bubbles too
    fontSize: 16,
    lineHeight: 22,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
  },
  inputField: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: theme.input,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 8,
    color: theme.text,
  },
  sendButton: {
    backgroundColor: theme.accent,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.highlight,
  },
  sendButtonText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  loadingText: {
    marginLeft: 10,
    color: theme.text,
    fontSize: 14,
  },
});

