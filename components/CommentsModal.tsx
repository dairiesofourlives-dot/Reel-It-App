
import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TextInput, ScrollView } from 'react-native';
import { colors } from '../styles/commonStyles';
import { Ionicons } from '@expo/vector-icons';
import { useReels } from '../state/reelsContext';

interface Props {
  reelId: string;
  visible: boolean;
  onClose: () => void;
}

export default function CommentsModal({ reelId, visible, onClose }: Props) {
  const { comments, addComment } = useReels();
  const list = comments[reelId] || [];
  const [text, setText] = useState('');

  const onSend = () => {
    if (!text.trim()) return;
    addComment(reelId, text.trim());
    setText('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Comments</Text>
            <Pressable onPress={onClose} hitSlop={8} style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.7 }]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            {list.length === 0 ? (
              <Text style={styles.empty}>No comments yet. Be the first to comment!</Text>
            ) : (
              list.map((c) => (
                <View key={c.id} style={styles.item}>
                  <Text style={styles.username}>@{c.username}</Text>
                  <Text style={styles.body}>{c.text}</Text>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Add a comment…"
              placeholderTextColor={colors.grey}
              style={styles.input}
              maxLength={400}
              returnKeyType="send"
              onSubmitEditing={onSend}
            />
            <Pressable onPress={onSend} style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.8 }]}>
              <Ionicons name="send" size={18} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
    boxShadow: '0px -6px 14px rgba(0,0,0,0.10)',
    elevation: 6,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    backgroundColor: colors.backgroundAlt,
    padding: 8,
    borderRadius: 999,
  },
  title: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    gap: 12,
  },
  item: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 12,
    padding: 10,
  },
  username: {
    color: colors.text,
    fontWeight: '800',
    marginBottom: 4,
  },
  body: {
    color: colors.text,
  },
  empty: {
    color: colors.grey,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: colors.divider,
    padding: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.card,
    color: colors.text,
  },
  sendBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
});
