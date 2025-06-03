import { View, Text } from 'react-native'
import Markdown from 'react-native-markdown-display'
import { theme as defaultTheme } from '../../constants/colors'

export default function MarkdownContent({ content, theme = defaultTheme }) {
  return (
    <Markdown
      style={getMarkdownStyles(theme)}
      rules={getMarkdownRules(theme)}
    >
      {content}
    </Markdown>
  )
}

const getMarkdownStyles = (theme) => ({
  body: {
    color: theme.text,
    fontFamily: 'Inter',
    fontSize: 16,
    lineHeight: 24,
  },
  heading2: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: 'bold',
    color: theme.text,
  },
  link: {
    color: '#4181D4',
    textDecorationLine: 'none',
    fontWeight: '500',
  },
})

const getMarkdownRules = (theme) => {
  let headingCount = 0

  return {
    bullet_list: (node, children) => (
      <View key={node.key} style={{ marginBottom: 0 }}>
        {children}
      </View>
    ),

    list_item: (node, children) => (
      <View key={node.key} style={{ flexDirection: 'row', marginTop: 0 }}>
        <Text style={{ color: theme.text, fontSize: 22 }}>{'\u2022' + ' '}</Text>
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    ),

    heading2: (node, children, parent, styles) => {
      const isFirst = headingCount === 0
      headingCount += 1

      return (
        <View
          key={node.key}
          style={{
            marginTop: isFirst ? 0 : 32,
            marginBottom: 8,
          }}
        >
          <Text style={styles.heading2}>{children}</Text>
        </View>
      )
    },
  }
}
