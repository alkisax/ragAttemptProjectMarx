// native\marx-rag\metadata\index.tsx
/*
  .11
*/

import React from 'react'
import { ScrollView, View } from 'react-native'
import { Text, List, Divider } from 'react-native-paper'
import { useRagChatContext } from '../../src/context/RagChatContext'

export default function MetadataScreen() {
  const { messages, memory } = useRagChatContext()

  const lastAssistant = [...messages]
    .reverse()
    .find(m => m.role === 'assistant' && m.context && m.context.length > 0)

  if (!lastAssistant) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: '#999' }}>No metadata yet. Ask a question to load context.</Text>
      </View>
    )
  }

  const lastQuery = messages[messages.length - 2]?.content || '(unknown query)'

  const context = lastAssistant.context ?? []

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: '#121212',
        padding: 16,
      }}
    >
      <Text
        style={{
          color: '#ffcc00',
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 16,
        }}
      >
        Latest Query Metadata
      </Text>

      {/* --- Context paragraphs --- */}
      <List.Accordion
        title="Context paragraphs"
        titleStyle={{ color: '#ffcc00', fontWeight: '600' }}
        style={{ backgroundColor: '#333', borderRadius: 8 }}
      >
        {context.map((p, i) => (
          <View key={i} style={{ marginBottom: 12 }}>
            <Text style={{ color: '#ffcc00', fontWeight: '600' }}>
              Paragraph {p.paragraphNoTotal ?? '?'}{' '}
              {p.score && (
                <Text style={{ color: '#999', fontSize: 12 }}>
                  (score: {p.score.toFixed ? p.score.toFixed(3) : p.score})
                </Text>
              )}
            </Text>

            <Text style={{ color: '#bbb', fontSize: 13, marginBottom: 2 }}>
              {[
                p.book && `Book: ${p.book}`,
                p.chapter && `Chapter: ${p.chapter}`,
                p.chapterTitle && `“${p.chapterTitle}”`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>

            <Text style={{ color: '#ccc', fontSize: 14 }}>{p.text}</Text>

            {i < context.length - 1 && (
              <Divider style={{ marginVertical: 6, backgroundColor: '#333' }} />
            )}
          </View>
        ))}
      </List.Accordion>

      {/* --- Rolling summary --- */}
      <List.Accordion
        title="Rolling Summary"
        titleStyle={{ color: '#ffcc00', fontWeight: '600' }}
        style={{ backgroundColor: '#333', borderRadius: 8, marginTop: 16 }}
      >
        <Text style={{ color: '#bbb', fontSize: 14 }}>
          {memory.pastSummary || 'No summary yet — ask a few questions first.'}
        </Text>
      </List.Accordion>

      {/* --- Recent questions --- */}
      <List.Accordion
        title="Recent Questions"
        titleStyle={{ color: '#ffcc00', fontWeight: '600' }}
        style={{ backgroundColor: '#333', borderRadius: 8, marginTop: 16 }}
      >
        {memory.entries.length > 0 ? (
          memory.entries.map((e, i) => (
            <View key={i} style={{ marginBottom: 10 }}>
              <Text style={{ color: '#ffcc00' }}>
                Q{i + 1}: {e.query}
              </Text>
              <Text style={{ color: '#ccc', marginLeft: 8 }}>↳ {e.summary}</Text>
              {i < memory.entries.length - 1 && (
                <Divider style={{ marginVertical: 6, backgroundColor: '#333' }} />
              )}
            </View>
          ))
        ) : (
          <Text style={{ color: '#999' }}>No previous questions yet.</Text>
        )}
      </List.Accordion>

      {/* --- Last query --- */}
      <Text style={{ marginTop: 24, color: '#bbb' }}>
        <Text style={{ color: '#ffcc00', fontWeight: '600' }}>Query: </Text>
        {lastQuery}
      </Text>
    </ScrollView>
  )
}
