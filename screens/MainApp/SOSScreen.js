import React, { useState, useContext, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  BackHandler,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SettingsContext } from '../../contexts/SettingsContext';
import { theme } from '../../constants/colors';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { uploadMediaFromLocal } from '../../services/uploadMediaFromLocal';
import EditContactModal from '../../components/modals/EditContactModal';

// Select media from Journal
import AsyncStorage from '@react-native-async-storage/async-storage';
import MediaPickerModal from '../../components/modals/MediaPickerModal';

export default function SOSScreen() {
  const navigation = useNavigation();
  const {
    emergencyMessage,
    setEmergencyMessage,
    emergencyContact,
    setEmergencyContact,
    locationEnabled,
    setLocationEnabled,
    setIsUnlocked
  } = useContext(SettingsContext);

  const [message, setMessage] = useState(emergencyMessage);
  const [includeLocation, setIncludeLocation] = useState(locationEnabled);
  const [mediaSelected, setMediaSelected] = useState([]);
  const [recipient, setRecipient] = useState('emergency');
  const [confirmSPF, setConfirmSPF] = useState(false);
  const [showDeleteHelpModal, setShowDeleteHelpModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPostSendReminder, setShowPostSendReminder] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showDeleteReminder, setShowDeleteReminder] = useState(false);
  const [showSentConfirmation, setShowSentConfirmation] = useState(false);

  const handleSendSOS = async () => {
    if (!recipient) {
      Alert.alert(
        'No Recipient Selected',
        'Please select who you want to send your SOS to before proceeding.'
      );
      return;
    }

    if (recipient === 'spf') {
      if (!message.trim()) {
        Alert.alert(
          'Message Required',
          'To send an SOS to the police (70999), your message must include a description and location. Please write a brief message before proceeding.'
        );
        return;
      }

      if (!confirmSPF) {
        Alert.alert(
          'Disclaimer Required',
          'You must confirm that you understand 70999 is for emergencies only before sending to the police.'
        );
        return;
      }

      // MVP block — no send allowed to SPF anyway
      Alert.alert(
        'SPF SMS Disabled',
        'For MVP safety purposes, SMS to the Singapore Police Force (70999) is disabled.\n\nPlease select your emergency contact to send your SOS.'
      );
      return;
    }

    if (recipient === 'emergency' && !message.trim()) {
      Alert.alert(
        'Empty Message',
        'Are you sure you want to send an SOS without a message?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Send Anyway',
            onPress: () => proceedToSend(),
          },
        ]
      );
      return;
    }
    Alert.alert(
      'Send SOS?',
      'Are you sure you want to send this SOS message now?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Send Now',
          onPress: () => proceedToSend(),
        },
      ]
    );
  };

  const proceedToSend = async () => {
    let msg = message;

    if (includeLocation) {
      try {
        const loc = await Location.getCurrentPositionAsync({});
        const mapsLink = `https://maps.google.com/?q=${loc.coords.latitude},${loc.coords.longitude}`;
        msg += `\n\nMy location: ${mapsLink}`;
      } catch (err) {
        console.warn('[SOS] Location error:', err);
        msg += `\n\n[Location could not be retrieved]`;
      }
    }

    if (mediaSelected.length > 0) {
      const publicUrls = [];
      let mediaUploadFailed = false;
      
      for (const uri of mediaSelected) {
        const ext = uri.split('.').pop().toLowerCase();
        console.log('[SOS] uploadMediaFromLocal got URI:', uri);
        
        const mime =
          ext === 'mp4' ? 'video/mp4' :
          ext === 'mov' ? 'video/quicktime' :
          ext === 'm4a' || ext === 'aac' ? 'audio/mp4' :
          ext === 'mp3' ? 'audio/mpeg' :
          ext === 'wav' ? 'audio/wav' :
          ext === 'ogg' ? 'audio/ogg' :
          ext === 'amr' ? 'audio/amr' :
          ext === '3gp' ? 'audio/3gpp' :
          ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' :
          ext === 'png' ? 'image/png' :
          'application/octet-stream';
          
          try {
            const url = await uploadMediaFromLocal(uri, mime);
            publicUrls.push(url);
          } catch (err) {
            console.warn('[SOS] Media upload failed:', err);
            mediaUploadFailed = true;
          }
      }

      if (mediaUploadFailed) {
        msg += `\n\n[One or more media files failed to upload]`;
      }

      if (publicUrls.length > 0) {
        try {
          const response = await fetch('https://safenotes-sos-html.safenotes-sos.workers.dev/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ media: publicUrls }),
          });
          const data = await response.json();
          if (data.html_url) {
            msg += `\n\nMedia evidence: ${data.html_url}`;
          } else {
            msg += `\n\n[Media link could not be generated]`;
          }
        } catch (err) {
          console.warn('[SOS] HTML link generation failed:', err);
          msg += `\n\n[Media link could not be generated]`;
        }
      }
    }

    if (emergencyContact?.number) {
      Alert.alert(
        'Reminder',
        'After sending your SOS via SMS, please return to SafeNotes to confirm.',
        [
          {
            text: 'Continue',
            onPress: () => {
              Linking.openURL(`sms:${emergencyContact.number}?body=${encodeURIComponent(msg)}`);
              setTimeout(() => setShowDeleteReminder(true), 3000);
            },
          },
        ]
      );
    } else {
      Alert.alert('No Contact', 'Please add an emergency contact first.');
    }
  };

  const handleLocationToggle = async () => {
    if (!locationEnabled) {
      Alert.alert(
        'Location Services Disabled',
        'Turn on location tracking in Settings to enable sharing.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Turn On',
            onPress: async () => {
              await setLocationEnabled(true);
              setIncludeLocation(true);
            },
          },
        ]
      );
    } else {
      setIncludeLocation(!includeLocation);
    }
  };

  useEffect(() => {
    if (recipient === 'spf' && !includeLocation) {
      setRecipient(null); // or setRecipient('emergency') if fallback is preferred
    }
  }, [includeLocation]);

  useEffect(() => {
    if (recipient !== 'spf' && confirmSPF) {
      setConfirmSPF(false);
    }
  }, [recipient]);

  useFocusEffect(
    React.useCallback(() => {
      // Screen gained focus – nothing to do
      return () => {
        // Screen is being blurred (navigated away)
        // Save settings here
        setEmergencyMessage(message);

        // Only persist if user turned ON sharing in SOS while global was OFF
        if (includeLocation && !locationEnabled) {
          setLocationEnabled(true);
        }
      };
    }, [message, includeLocation])
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 10 : StatusBar.currentHeight,
        backgroundColor: theme.background,
      }}
    >
        <ScrollView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.leftColumn}>
              <TouchableOpacity
                onPress={async () => {
                  await setEmergencyMessage(message);
                  navigation.goBack();
                }}
                style={styles.backButton}
              >
                <Ionicons name="chevron-back" size={32} color={theme.text} />
              </TouchableOpacity>
              <Text style={styles.title}>SOS</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Message</Text>
          <TextInput
            style={styles.textInput}
            multiline
            value={message}
            onChangeText={(val) => {
              setMessage(val);
            }}
          />

          <Text style={styles.sectionTitle}>Location</Text>
          <TouchableOpacity onPress={handleLocationToggle} style={styles.row}>
            {includeLocation ? (
              <Ionicons name="checkbox" size={20} color={theme.accent} />
            ) : (
              <View style={styles.emptyBox} />
            )}
            <Text style={styles.rowText}>  Share my current location</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Share Media</Text>

          <TouchableOpacity onPress={() => setShowMediaPicker(true)} style={styles.selectBtn}>
            <Text style={styles.rowText}>Select media from Journal        {mediaSelected.length} selected</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Choose Recipients</Text>
          <Text style={styles.subText}>Disclaimer: This app is not affiliated with SPF.</Text>

          <TouchableOpacity onPress={() => setRecipient('emergency')} style={styles.row}>
            <Ionicons name={recipient === 'emergency' ? 'radio-button-on' : 'radio-button-off'} size={22} color={theme.text} />
              <Text style={styles.rowText}>
                {'  '}Emergency Contact ({emergencyContact?.name || 'Not Set'})
              </Text>
            <TouchableOpacity
              onPress={() => setShowContactModal(true)}
              style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6 }}
            >
              <Text style={{ color: theme.accent, marginLeft: 4, fontFamily: 'Inter', fontSize: 16 }}>[Edit]</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!includeLocation) {
                Alert.alert(
                  'Location Required',
                  'IMPORTANT: Location sharing MUST be on to comply with SPF regulations.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Share my location',
                      onPress: () => {
                        if (!locationEnabled) {
                          Alert.alert(
                            'Location Services Disabled',
                            'Location tracking is off in Settings. Enable it to share your current location.',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Turn On',
                                onPress: async () => {
                                  await setLocationEnabled(true);
                                  setIncludeLocation(true);
                                  setRecipient('spf');
                                },
                              },
                            ]
                          );
                        } else {
                          setIncludeLocation(true);
                          setRecipient('spf');
                        }
                      },
                    },
                  ]
                );
              } else {
                setRecipient('spf');
              }
            }}
            style={styles.row}
          >
            <Ionicons
              name={recipient === 'spf' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={includeLocation ? theme.text : theme.muted}
            />
            <Text style={[styles.rowText, { color: includeLocation ? theme.text : theme.muted }]}>
              {'  '}Singapore Police Force (70999)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (recipient === 'spf') {
                setConfirmSPF(!confirmSPF);
              }
            }}
            style={[styles.row, styles.spfCheckboxRow]}
            activeOpacity={recipient === 'spf' ? 0.8 : 1} // no feedback unless SPF
          >
            <View style={styles.checkboxWrapper}>
              {confirmSPF ? (
                <Ionicons
                  name="checkbox"
                  size={18}
                  color={recipient === 'spf' ? theme.accent : theme.muted}
                />
              ) : (
                <View
                  style={[
                    styles.emptyBoxSPF,
                    { borderColor: recipient === 'spf' ? theme.text : theme.muted }
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                styles.confirmText,
                { color: recipient === 'spf' ? theme.text : theme.muted }
              ]}
            >
              <Text style={{ fontWeight: 'bold' }}>
                I understand that 70999 is for EMERGENCIES only,
              </Text>{' '}
              when calling ‘999’ is unsafe or not possible.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sendBtn, { opacity: recipient ? 1 : 0.6 }]}
            onPress={handleSendSOS}
            disabled={!recipient}
          >
            <Text style={styles.sendText}>Send SOS</Text>
          </TouchableOpacity>

          <Text style={styles.subText}>Your SOS will be sent via SMS.
            {' '}
            Location and media are shared as links. 
            {' '}
            The media link expires in about 24h.</Text>
          <TouchableOpacity onPress={() => setShowDeleteHelpModal(true)}>
            <Text style={styles.linkText}>How to delete an SMS message for yourself</Text>
          </TouchableOpacity>

          <EditContactModal
            visible={showContactModal}
            onClose={() => setShowContactModal(false)}
            currentContact={emergencyContact}
            onSave={(updatedContact) => {
              setEmergencyContact(updatedContact); // ✅ this updates the display
              setShowContactModal(false);
            }}
          />
          <Modal visible={showDeleteHelpModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <ScrollView style={{ maxHeight: 300 }}>
                  <View>
                    <Text style={styles.modalText}>
                      To delete the SOS SMS (text message) from your phone to evade detection, follow these steps. This only removes the message from <Text style={[styles.modalText, { fontWeight: 'bold' }]}>your device</Text>.
                    </Text>

                    {Platform.OS === 'android' ? (
                      <>
                        <Text style={styles.modalText}>{'\n'}1. Open the Messages app.</Text>
                        <Text style={styles.modalText}>2. Find and open the conversation.</Text>
                        <Text style={styles.modalText}>3. Press and hold the message you want to delete.</Text>
                        <Text style={styles.modalText}>4. Tap the trash can icon or "Delete" option.</Text>
                        <Text style={styles.modalText}>5. Confirm deletion if prompted.</Text>
                      </>
                    ) : (
                      <>
                        <Text style={styles.modalText}>{'\n'}1. Open the Messages app.</Text>
                        <Text style={styles.modalText}>2. Open the conversation.</Text>
                        <Text style={styles.modalText}>3. Press and hold the message bubble.</Text>
                        <Text style={styles.modalText}>4. Tap "More…".</Text>
                        <Text style={styles.modalText}>5. Select the message(s) you want to delete.</Text>
                        <Text style={styles.modalText}>6. Tap the trash can icon and confirm.</Text>
                      </>
                    )}

                    <Text style={styles.modalText}>{'\n\n'}SMS does <Text style={[styles.modalText, { fontWeight: 'bold' }]}>not</Text> support “unsend” or delete-for-everyone.</Text>
                    <Text style={styles.modalText}>This only hides it from your phone. The other person will still see it unless they delete it too.</Text>
                  </View>
                </ScrollView>
                <TouchableOpacity onPress={() => setShowDeleteHelpModal(false)}>
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <MediaPickerModal
            visible={showMediaPicker}
            onClose={() => setShowMediaPicker(false)}
            onConfirm={(selected) => {
              setMediaSelected(selected);
              setShowMediaPicker(false);
            }}
          />
          
          {/* Reminder to delete SMS */}
          <Modal visible={showDeleteReminder} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalText}>
                  Reminder: You may want to delete the SOS from your Messages app for yourself.
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowDeleteReminder(false);
                  setShowSentConfirmation(true);
                }}>
                  <Text style={styles.buttonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Confirmation and return */}
          <Modal visible={showSentConfirmation} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalBox}>
                <Text style={styles.modalText}>
                  SOS sent. Help is on the way, and you are not alone.{"\n\n"}Returning to your Notes...
                </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setShowSentConfirmation(false);
                    setIsUnlocked(false); // This triggers RootNavigator to rerender with disguise routes

                    // Delay navigation so the stack is re-mounted first
                    setTimeout(() => {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'NotesHome' }],
                      });
                    }, 100); // slight delay to allow re-mount
                  }}
                >
                  <Text style={styles.buttonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'left',
    paddingTop: 10,   // simulate status bar height + spacing
    paddingBottom: 0,
    position: 'relative',
  },
  backButton: {
    padding: 0, 
    left: -5,      // add padding for better touch response
    marginRight: 12,
  },
  leftColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 55,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    color: theme.text,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Inter',
    marginTop: 11,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: theme.card, // slightly darker (e.g. #4A4A4A)
    color: theme.text,
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 6,
    fontFamily: 'Inter',
    height: 70,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: theme.highlight, // subtle outline
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  rowText: {
    color: theme.text,
    fontSize: 16,
    fontFamily: 'Inter',
  },
  selectBtn: {
    backgroundColor: theme.input,
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  sendBtn: {
    backgroundColor: theme.danger,
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Inter',
  },
  subText: {
    textAlign: 'left',
    color: theme.muted,
    fontSize: 13,
    marginBottom: 6,
    fontFamily: 'Inter',
  },
  linkText: {
    textAlign: 'left',
    color: theme.accent,
    fontSize: 13,
    marginTop: 6,
    textDecorationLine: 'underline',
    fontFamily: 'Inter',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  modalText: {
    color: theme.text,
    fontFamily: 'Inter',
    fontSize: 15,
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonText: {
    color: theme.accent,
    fontFamily: 'Inter',
    fontSize: 14,
  },
  emptyBox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.text, // or theme.accent if you want blue
    borderRadius: 4,         // match checkbox corner radius
  },
  spfCheckboxRow: {
    alignItems: 'flex-start',
    marginLeft: 30,
  },

  emptyBoxSPF: {
    width: 17,
    height: 17,
    borderWidth: 2,
    borderColor: theme.text,
    borderRadius: 4,
    marginRight: 8,
    marginTop: 2,
  },

  confirmText: {
    fontFamily: 'Inter',
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
    color: theme.text,
  },
  checkboxWrapper: {
    width: 18,
    height: 18,
    marginRight: 8,
    marginTop: 2,
  },
});