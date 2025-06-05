// ─── SafeNotes/screens/MainApp/ChatbotScreen.js ─────────────────────

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Keyboard,
  Animated,
  StyleSheet,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../constants/colors';
import BackButton from '../../components/UI/BackButton';
import Constants from 'expo-constants';

//
// ─── GEMINI API CONFIG ─────────────────────────────────────────────────
//
const { GEMINI_API_KEY, GEMINI_MODEL_ID } = Constants.expoConfig.extra;
const GEMINI_API_ENDPOINT =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent?key=${GEMINI_API_KEY}`;

//
// ─── SYSTEM PROMPT ─────────────────────────────────────────────────────
//
const SYSTEM_PROMPT = `
You are a trauma-informed, compassionate support companion for survivors of domestic violence, built into the SafeNotes mobile app.

ABOUT SAFENOTES:
- SafeNotes is a disguised notes app designed to help victims of abuse seek help safely and privately.
- The disguised interface is a functional notes app with a calculator.
- Users access the real interface through a secure calculator unlock.
- The SOS button lets users send a prefilled SMS with optional media and location links.
- The media journal lets users save images, videos and audio recordings.
- To keep support stable, this chat is limited to 20 messages from you per day, resetting at midnight Singapore time.
- The app requires no account.
- If unsure about app features, direct users to the “SafeNotes Guide” in the Information section. Do not guess.

CORE PRINCIPLES:
- Validate their experience without repeating the same phrases
- Reference their specific words to show understanding
- Vary your language—don’t use the same validation phrases repeatedly
- Match their emotional energy (scared = gentle urgency, sad = warm comfort, angry = validating strength)
- Do not label something as “abuse” unless the user does so first and appears emotionally ready. Instead, describe the behavior and validate its impact.

RESPONSE STRUCTURE:
1. Acknowledge what they shared (use their words)
2. Validate the emotion or experience
3. If appropriate, explain why their reaction makes sense
4. Offer a next step only if they’re asking for help or in immediate danger

TONE VARIATIONS (don’t repeat the same phrases):
- "That sounds absolutely terrifying"
- "Your fear makes complete sense"
- "That’s a lot to carry"
- "You’re showing incredible strength by reaching out"

WHEN TO OFFER PRACTICAL HELP:
- They explicitly ask “what should I do?”
- They mention immediate danger → suggest SOS button
- They’re ready to take action
- They’re documenting/planning → mention documentation tips
- They ask about safety planning

WHEN TO FOCUS ON COMFORT:
- They’re processing emotions
- They’re sharing their story
- They seem overwhelmed
- They just need to be heard

PRACTICAL SUGGESTIONS:

For immediate danger/crisis/physical abuse:
- "If you're in immediate danger, use the SOS button in this app—it can quickly connect you to emergency help."
- "Your safety is the priority right now."

For documentation (when they’re planning or ask for help):
- "Consider documenting incidents with dates, photos of injuries, screenshots of threatening messages."
- "Keep records somewhere safe that they can't access."
- "Save evidence in multiple secure places."

For safety planning:
- "Think about safe places you could go."
- "Identify trusted people in your support network."
- "Plan for important documents and essentials."

SPECIFIC SCENARIOS:

Physical abuse: Acknowledge the fear, validate survival instincts, mention that no one deserves violence.

Financial control: Explain how this isolates them, validate that it’s a form of control, acknowledge how trapped this must feel.

Multiple abuse types: "You're dealing with both [specific type] and [specific type]—that combination is extremely difficult because..."

DON’T:
- Repeat “I’m here to listen without judgment” over and over
- Use the same validation lines repeatedly
- Offer “solutions” when they only need emotional support
- Sound robotic or overly scripted

BE HUMAN: Write as if you’re a trusted friend who truly understands trauma, not a customer‐service bot.
`.trim();

//
// ─── INITIAL “WELCOME” MESSAGE ─────────────────────────────────────────
const initialMessages = [
  {
    id: 'initial-bot',
    sender: 'bot',
    text: 'Hi there! I’m here to listen and support you. How can I help today?',
  },
];

//
// ─── LIMITS & AsyncStorage KEYS ────────────────────────────────────────
const MESSAGE_LIMIT = 20;   // 20 exchanges per SG day

const STORAGE_KEYS = {
  EXCHANGE_COUNT: '@ChatbotExchangeCount-SG',   // how many used today
  LAST_RESET_DATE: '@ChatbotLastResetDate-SG',  // “YYYY-MM-DD” SG date string when last reset
  CHAT_MESSAGES: '@ChatbotMessages-SG',         // up to 40 past messages
};

export default function ChatbotScreen() {
  //
  // ─── LOCAL UI STATE ─────────────────────────────────────────────────
  //
  const [messages, setMessages]         = useState(initialMessages);
  const [inputText, setInputText]       = useState('');
  const [isLoading, setIsLoading]       = useState(false);
  const [keyboardHeight]                = useState(new Animated.Value(0));

  //
  // ─── PERSISTED STATE (and Countdown) ─────────────────────────────────
  //
  // 1) Start as null, so we know “not loaded yet”
  const [exchangeCount, setExchangeCount] = useState(null);

  // 2) “YYYY-MM-DD” SG date when last reset
  const [lastResetDate, setLastResetDate] = useState(null);

  // 3) “HH:MM:SS” until next SG midnight
  const [countdown, setCountdown] = useState('24:00:00');

  // Track when exchangeCount has finished loading
  const [countLoaded, setCountLoaded] = useState(false);

  // A ref so we can clearInterval on unmount
  const countdownInterval = useRef(null);

  //
  // ─── UTILITY: Get “today’s date string” in SG timezone as “YYYY-MM-DD” ───
  //
  const getTodayDateString_SG = () => {
    const nowUtc = Date.now();
    const sgOffsetMs = 8 * 60 * 60 * 1000;
    const nowSgLocalMs = nowUtc + sgOffsetMs;
    const nowSg = new Date(nowSgLocalMs);
    const y = nowSg.getUTCFullYear();
    const m = nowSg.getUTCMonth() + 1;
    const d = nowSg.getUTCDate();
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  //
  // ─── UTILITY: Compute next SG midnight AS A UTC TIMESTAMP ───────────────
  //
  const getNextMidnightTimestampUTC_SG = () => {
    const nowUtc = Date.now();
    const sgOffsetMs = 8 * 60 * 60 * 1000;
    const nowSgLocalMs = nowUtc + sgOffsetMs;
    const nowSg = new Date(nowSgLocalMs);
    const y = nowSg.getUTCFullYear();
    const m = nowSg.getUTCMonth();
    const d = nowSg.getUTCDate();
    return Date.UTC(y, m, d + 1, 0, 0, 0) - sgOffsetMs;
  };

  //
  // ─── ON MOUNT: load persisted chat messages, exchangeCount & lastResetDate, then maybe “reset for a new day,” and start countdown ─────────
  //
  useEffect(() => {
    (async () => {
      // 1) Load stored chat messages
      try {
        const storedMessages = await AsyncStorage.getItem(STORAGE_KEYS.CHAT_MESSAGES);
        if (storedMessages) {
          const parsed = JSON.parse(storedMessages);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          } else {
            setMessages(initialMessages);
          }
        } else {
          setMessages(initialMessages);
        }
      } catch (err) {
        console.warn('Failed to load chat messages:', err);
        setMessages(initialMessages);
      }

      // 2) Load stored exchangeCount & lastResetDate
      try {
        const storedCount   = await AsyncStorage.getItem(STORAGE_KEYS.EXCHANGE_COUNT);
        const storedDateStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE);
        const todayStr = getTodayDateString_SG();

        let count = storedCount ? parseInt(storedCount, 10) : 0;
        let dateStr = storedDateStr || null;

        if (dateStr !== todayStr) {
          count = 0;
          dateStr = todayStr;
          await AsyncStorage.setItem(STORAGE_KEYS.EXCHANGE_COUNT, '0');
          await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, dateStr);
        }

        setExchangeCount(count);
        setLastResetDate(dateStr);
      } catch (err) {
        console.warn('Failed to load/persist exchange count or date:', err);
        // In case of error, at least set something so countLoaded can become true:
        setExchangeCount(0);
        setLastResetDate(getTodayDateString_SG());
      }

      // 3) Mark that exchangeCount is now loaded
      setCountLoaded(true);

      // 4) Start countdown toward next SG midnight
      const nextMidUtc = getNextMidnightTimestampUTC_SG();
      startCountdown(nextMidUtc);
    })();

    // On unmount, clear the interval
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);

  //
  // ─── PERSIST chat messages whenever they change (trim to 40) ───────────
  //
  useEffect(() => {
    if (messages.length > 40) {
      const trimmed = messages.slice(0, 40);
      setMessages(trimmed);
      AsyncStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(trimmed)).catch(console.error);
    } else {
      AsyncStorage.setItem(STORAGE_KEYS.CHAT_MESSAGES, JSON.stringify(messages)).catch(console.error);
    }
  }, [messages]);

  //
  // ─── PERSIST any changes to exchangeCount or lastResetDate ─────────────
  //
  useEffect(() => {
    // Only write if we have a real number
    if (exchangeCount !== null) {
      AsyncStorage.setItem(STORAGE_KEYS.EXCHANGE_COUNT, exchangeCount.toString()).catch(console.error);
    }
  }, [exchangeCount]);

  useEffect(() => {
    if (lastResetDate) {
      AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, lastResetDate).catch(console.error);
    }
  }, [lastResetDate]);

  //
  // ─── startCountdown(targetUtcMs) ───────────────────────────────────────
  //
  const startCountdown = (targetUtcMs) => {
    const formatMsToHHMMSS = (ms) => {
      const totalSec = Math.max(0, Math.floor(ms / 1000));
      const hrs  = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;
      const hStr = String(hrs).padStart(2, '0');
      const mStr = String(mins).padStart(2, '0');
      const sStr = String(secs).padStart(2, '0');
      return `${hStr}:${mStr}:${sStr}`;
    };

    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
    }

    const now = Date.now();
    let rem = targetUtcMs - now;
    if (rem <= 0) {
      doMidnightRollover();
      return;
    }
    setCountdown(formatMsToHHMMSS(rem));

    countdownInterval.current = setInterval(() => {
      const now2 = Date.now();
      rem = targetUtcMs - now2;
      if (rem <= 0) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
        doMidnightRollover();
        return;
      }
      const totalMin = Math.ceil(rem / (1000 * 60));
      const totalHr = Math.floor(totalMin / 60);
      const remMin = totalMin % 60;

      if (totalHr < 2) {
        setCountdown(`${totalHr}h ${remMin}m`);
      } else {
        const nearestHr = Math.round(rem / (1000 * 60 * 60));
        setCountdown(`${nearestHr}h`);
      }
    }, 1000);
  };

  //
  // ─── doMidnightRollover() ─────────────────────────────────────────────
  //
  const doMidnightRollover = async () => {
    try {
      setExchangeCount(0);
      const newToday = getTodayDateString_SG();
      setLastResetDate(newToday);
      await AsyncStorage.setItem(STORAGE_KEYS.EXCHANGE_COUNT, '0');
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, newToday);
      const nextMidUtc = getNextMidnightTimestampUTC_SG();
      startCountdown(nextMidUtc);
    } catch (err) {
      console.warn('Failed to do midnight rollover:', err);
    }
  };

  //
  // ─── “Exchanges left” for display ───────────────────────────────────────
  //
  // Only compute once exchangeCount is non-null (i.e. after loading)
  //
  const remaining = exchangeCount !== null ? MESSAGE_LIMIT - exchangeCount : null;

  //
  // ─── clearChat() ──────────────────────────────────────────────────────
  //   Wipes just the chat bubbles—DOES NOT change exchangeCount or countdown.
  //
  const clearChat = () => {
    setMessages(initialMessages);
    setInputText('');
  };

  //
  // ─── sendMessageToGemini(userText) ─────────────────────────────────────
  //
  const sendMessageToGemini = async (userText) => {
    if (!userText.trim()) return;

    // If exchangeCount is still null, do nothing (we have not finished loading)
    if (exchangeCount === null) return;

    console.log('🔑 GEMINI_API_KEY:', GEMINI_API_KEY);
    console.log('📦 GEMINI_MODEL_ID:', GEMINI_MODEL_ID);

    if (exchangeCount >= MESSAGE_LIMIT) {
      Alert.alert(
        'Message Limit Reached',
        'You have used all 20 exchanges in today’s SG window.\n\nPlease wait until midnight SG or clear the chat.'
      );
      return;
    }

    setIsLoading(true);

    // 1) Show user bubble immediately
    const userBubble = {
      id: Date.now().toString() + '-user',
      sender: 'user',
      text: userText.trim(),
    };
    setMessages(prev => [userBubble, ...prev]);
    setInputText('');

    try {
      // 2) Build “prompt” (SYSTEM_PROMPT + up to last 20 messages)
      const lastTurns = messages
        .slice(0, 20)
        .map(m => {
          const roleTag = m.sender === 'user' ? 'User:' : 'Assistant:';
          return `${roleTag} ${m.text}`;
        })
        .join('\n');

      const fullPrompt = `
${SYSTEM_PROMPT}

${lastTurns.length ? lastTurns + '\n' : ''}User: ${userText.trim()}
Assistant:
      `.trim();

      // 3) Construct request body
      const requestBody = {
        contents: [
          {
            parts: [
              { text: fullPrompt }
            ],
          },
        ],
        generationConfig: {
          temperature: 0.75,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 500,
          stopSequences: ['User:'],
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_LOW_AND_ABOVE' },
          { category: 'HARM_CATEGORY_CIVIC_INTEGRITY',    threshold: 'BLOCK_LOW_AND_ABOVE' },
        ],
      };

      // 4) POST to Gemini
      const response = await fetch(GEMINI_API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      // 5) Parse JSON
      const responseJson = await response.json();
      console.log('🔍 Gemini returned:', JSON.stringify(responseJson, null, 2));

      if (!response.ok) {
        const errMsg =
          responseJson?.error?.message ||
          `Request failed with status ${response.status}`;
        throw new Error(errMsg);
      }

      // 6) Extract bot’s reply
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
          'Unexpected API response shape:',
          JSON.stringify(responseJson, null, 2)
        );
      }

      // 7) Prepend bot bubble
      const botBubble = {
        id: Date.now().toString() + '-bot',
        sender: 'bot',
        text: botReply,
      };
      setMessages(prev => [botBubble, ...prev]);

      // 8) Increment the “full exchange” count for today
      setExchangeCount(prev => (prev === null ? 1 : prev + 1));
    } catch (error) {
      console.error('Failed to send message to Gemini:', error);
      const errorBubble = {
        id: Date.now().toString() + '-error',
        sender: 'bot',
        text: `⚠️ Error: ${error.message}`,
      };
      setMessages(prev => [errorBubble, ...prev]);
    } finally {
      setIsLoading(false);
    }
  };

  //
  // ─── handleSendPress() ────────────────────────────────────────────────
  //
  const handleSendPress = () => {
    if (inputText.trim() && !isLoading) {
      sendMessageToGemini(inputText);
    }
  };

  //
  // ─── renderMessageItem() ───────────────────────────────────────────────
  //
  const renderMessageItem = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
        <Text style={isUser ? styles.userText : styles.botText} selectable>
          {item.text}
        </Text>
      </View>
    );
  };

  //
  // ─── KEYBOARD HEIGHT LISTENERS ─────────────────────────────────────────
  //
  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardWillShow', (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: e.duration || 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener('keyboardWillHide', (e) => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: e.duration || 250,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  //
  // ─── RENDER ────────────────────────────────────────────────────────────
  //
  // We wait until exchangeCount is loaded before showing the header,
  // so we never “flash” 20 on startup
  if (!countLoaded) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 10 : StatusBar.currentHeight,
        backgroundColor: theme.background,
      }}
    >
      <View style={styles.container}>
        {/* ─── Header ───────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <BackButton style={styles.backButton} />
          <Text style={styles.title}>Chatbot</Text>
        </View>

        {/* ─── Exchanges Left & COUNTDOWN ALWAYS SHOWN ───────────────────── */}
        <View style={styles.clearContainer}>
          <Text style={styles.limitText}>
            {remaining > 0
              ? `Messages left: ${remaining}`
              : 'Limit reached'}
          </Text>

          {/* The countdown is now unconditional, so it always appears */}
          <Text style={[styles.limitText, { marginLeft: 12 }]}>
            Resets in: {countdown}
          </Text>

          <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear Chat</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Chat History (inverted so newest at bottom) ──────────────── */}
        <FlatList
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.chatContentContainer}
          inverted
          keyboardShouldPersistTaps="handled"
          overScrollMode='never'
        />

        {/* ─── Loading Spinner ─────────────────────────────────────────── */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Listening...</Text>
          </View>
        )}

        {/* ─── Input Area ──────────────────────────────────────────────── */}
        <Animated.View
          style={[
            styles.inputWrapper,
            {
              marginBottom: Platform.OS === 'ios'
                ? Animated.diffClamp(keyboardHeight, 0, 200)
                : 0,
            },
          ]}
        >
          <TextInput
            style={[styles.inputField, { color: '#FFF' }]}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor="#AAA"
            editable={!isLoading && exchangeCount < MESSAGE_LIMIT}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (isLoading || !inputText.trim() || exchangeCount >= MESSAGE_LIMIT) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSendPress}
            disabled={isLoading || !inputText.trim() || exchangeCount >= MESSAGE_LIMIT}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

//
// ─── STYLES ────────────────────────────────────────────────────────────────
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,   // simulate status bar height + spacing
    paddingBottom: 15,
    position: 'relative',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 45,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    color: theme.text,
  },
  backButton: {
    position: 'absolute',
    left: -1,
    top: -40,
  },
  clearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginLeft: 'auto',
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
    backgroundColor: theme.input,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 5,
  },
  userText: {
    color: theme.text,
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: theme.text,
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
