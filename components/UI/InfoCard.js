import { View, Text, StyleSheet } from 'react-native'
import { theme } from '../../constants/colors'

export default function InfoCard({ iconComponent, title }) {
  return (
    <View style={styles.card}>
      {iconComponent}
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontWeight: 'bold',
    color: theme.text,
    fontSize: 18,
    marginLeft: 12,
  },
})
