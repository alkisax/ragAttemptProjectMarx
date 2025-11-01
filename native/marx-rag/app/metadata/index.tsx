/*
  .11
*/

import React from 'react'
import { ScrollView, View, StyleSheet } from 'react-native'
import { Text, List, Divider } from 'react-native-paper'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRagChatContext } from '../../src/context/RagChatContext'

export default function MetadataScreen() {
  const { messages, memory } = useRagChatContext()

  const lastAssistant = [...messages]
    .reverse()
    .find(m => m.role === 'assistant' && m.context && m.context.length > 0)

  if (!lastAssistant) {
    return (
      <View style={styles.noData}>
        <Text style={styles.noDataText}>No metadata yet. Ask a question to load context.</Text>
      </View>
    )
  }

  const lastQuery = messages[messages.length - 2]?.content || '(unknown query)'
  const context = lastAssistant.context ?? []

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scroll}>
        <Text style={styles.title}>Latest Query Metadata</Text>

        {/* --- Context paragraphs --- */}
        <List.Accordion
          title="Context paragraphs"
          titleStyle={styles.accordionTitle}
          style={styles.accordion}
        >
          {context.map((p, i) => (
            <View key={i} style={styles.paragraphBox}>
              <Text style={styles.paragraphHeader}>
                Paragraph {p.paragraphNoTotal ?? '?'}{' '}
                {p.score && (
                  <Text style={styles.score}>
                    (score: {p.score.toFixed ? p.score.toFixed(3) : p.score})
                  </Text>
                )}
              </Text>

              <Text style={styles.paragraphMeta}>
                {[
                  p.book && `Book: ${p.book}`,
                  p.chapter && `Chapter: ${p.chapter}`,
                  p.chapterTitle && `“${p.chapterTitle}”`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>

              <Text style={styles.paragraphText}>{p.text}</Text>

              {i < context.length - 1 && <Divider style={styles.divider} />}
            </View>
          ))}
        </List.Accordion>

        {/* --- Rolling summary --- */}
        <List.Accordion
          title="Rolling Summary"
          titleStyle={styles.accordionTitle}
          style={[styles.accordion, styles.marginTop]}
        >
          <Text style={styles.summaryText}>
            {memory.pastSummary || 'No summary yet — ask a few questions first.'}
          </Text>
        </List.Accordion>

        {/* --- Recent questions --- */}
        <List.Accordion
          title="Recent Questions"
          titleStyle={styles.accordionTitle}
          style={[styles.accordion, styles.marginTop]}
        >
          {memory.entries.length > 0 ? (
            memory.entries.map((e, i) => (
              <View key={i} style={styles.recentBox}>
                <Text style={styles.recentQuestion}>
                  Q{i + 1}: {e.query}
                </Text>
                <Text style={styles.recentAnswer}>↳ {e.summary}</Text>
                {i < memory.entries.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No previous questions yet.</Text>
          )}
        </List.Accordion>

        {/* --- Last query --- */}
        <Text style={styles.lastQuery}>
          <Text style={styles.queryLabel}>Query: </Text>
          {lastQuery}
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  title: {
    color: '#ffcc00',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  accordion: {
    backgroundColor: '#333',
    borderRadius: 8,
  },
  accordionTitle: {
    color: '#ffcc00',
    fontWeight: '600',
  },
  paragraphBox: {
    marginBottom: 12,
  },
  paragraphHeader: {
    color: '#ffcc00',
    fontWeight: '600',
  },
  score: {
    color: '#999',
    fontSize: 12,
  },
  paragraphMeta: {
    color: '#bbb',
    fontSize: 13,
    marginBottom: 2,
  },
  paragraphText: {
    color: '#ccc',
    fontSize: 14,
  },
  divider: {
    marginVertical: 6,
    backgroundColor: '#333',
  },
  marginTop: {
    marginTop: 16,
  },
  summaryText: {
    color: '#bbb',
    fontSize: 14,
  },
  recentBox: {
    marginBottom: 10,
  },
  recentQuestion: {
    color: '#ffcc00',
  },
  recentAnswer: {
    color: '#ccc',
    marginLeft: 8,
  },
  lastQuery: {
    marginTop: 24,
    color: '#bbb',
  },
  queryLabel: {
    color: '#ffcc00',
    fontWeight: '600',
  },
  noData: {
    padding: 16,
  },
  noDataText: {
    color: '#999',
  },
})
