import { Heart, Info, ChevronLeft } from 'lucide-react-native'
import { useNavigation } from '@react-navigation/native'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { theme } from '../../constants/colors' // adjust path if needed

const HeartIcon = <Heart color="red" size={20} />
const InfoIcon = <Info color="lightblue" size={20} />

const items = [
  { icon: HeartIcon, label: 'Signs of domestic violence' },
  { icon: HeartIcon, label: 'What to do if you are in danger' },
  { icon: HeartIcon, label: 'Legal and shelter support' },
  { icon: HeartIcon, label: 'Emergency hotlines & helplines' },
  { icon: InfoIcon, label: 'How to keep SafeNotes hidden' },
  { icon: InfoIcon, label: 'SafeNotes Guide' },
  { icon: InfoIcon, label: 'How do I delete an SMS for myself?' },
]

export default function InfoScreen() {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <ChevronLeft color="white" size={28} />
      </Pressable>

      {/* H1 Heading */}
      <Text style={styles.h1}>Information Page</Text>

      {/* List of items */}
      <ScrollView>
        {items.map((item, index) => (
          <View key={index} style={styles.card}>
            <View>{item.icon}</View>
            <Text style={styles.cardText}>{item.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 60,
    paddingLeft: 20,
  },
  text: {
    color: theme.text,
    fontFamily: 'Inter',
    fontSize: 18,
  },
  h1: {
    color: theme.text,
    fontSize: 36,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#1e1e1e',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  backButton: {},
})
