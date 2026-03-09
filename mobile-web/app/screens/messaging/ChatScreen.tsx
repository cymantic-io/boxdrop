import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useThread, useSendMessage } from '../../hooks';
import { colors } from '../../theme';
import { useAuthStore } from '../../stores/useAuthStore';
import type { Message, ProfileStackParamList } from '../../types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Chat'>;

export function ChatScreen({ route, navigation }: Props) {
  const { threadId, listingTitle } = route.params;
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList<Message>>(null);
  const currentUserId = useAuthStore((s) => s.user?.id);

  const { data: thread, isLoading, isError, error } = useThread(threadId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();

  useEffect(() => {
    if (listingTitle) {
      navigation.setOptions({ title: listingTitle });
    }
  }, [listingTitle, navigation]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    sendMessage({ threadId, data: { content: trimmed } });
    setText('');
  }, [text, threadId, isSending, sendMessage]);

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  }, []);

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwn = item.senderId === currentUserId;

    return (
      <View
        style={[
          styles.messageBubble,
          isOwn ? styles.ownBubble : styles.otherBubble,
        ]}
      >
        <Text style={[styles.messageText, isOwn ? styles.ownText : styles.otherText]}>
          {item.content}
        </Text>
        <Text
          style={[
            styles.messageTime,
            isOwn ? styles.ownTime : styles.otherTime,
          ]}
        >
          {formatTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          {(error as Error)?.message ?? 'Failed to load messages'}
        </Text>
      </View>
    );
  }

  const messages = thread?.messages ?? [];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        inverted
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>No messages yet. Say hello!</Text>
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
          returnKeyType="default"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!text.trim() || isSending) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!text.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  messageList: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 16,
    padding: 12,
    marginVertical: 3,
  },
  ownBubble: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  ownText: {
    color: '#FFFFFF',
  },
  otherText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  ownTime: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  otherTime: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#333',
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  emptyChat: {
    alignItems: 'center',
    padding: 24,
    transform: [{ scaleY: -1 }],
  },
  emptyChatText: {
    fontSize: 14,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
    textAlign: 'center',
  },
});
