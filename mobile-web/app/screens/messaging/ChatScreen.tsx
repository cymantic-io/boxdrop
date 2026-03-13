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
  Image,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';
import { useThread, useSendMessage, useAcceptOffer, useRejectOffer, useCounterOffer, useListing } from '../../hooks';
import { colors } from '../../theme';
import { useAuthStore } from '../../stores/useAuthStore';
import type { Message, MessagesStackParamList } from '../../types';

type Props = NativeStackScreenProps<MessagesStackParamList, 'Chat'>;

export function ChatScreen({ route, navigation }: Props) {
  const { threadId, listingTitle } = route.params;
  const [text, setText] = useState('');
  const [counterAmount, setCounterAmount] = useState('');
  const [counteringOfferId, setCounteringOfferId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<Message>>(null);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const { mutate: accept } = useAcceptOffer();
  const { mutate: reject } = useRejectOffer();
  const { mutate: counter } = useCounterOffer();

  const { data: thread, isLoading, isError, error } = useThread(threadId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage();
  const { data: listing } = useListing(thread?.thread.listingId);

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

    if (item.offer) {
      const canAct = item.offer.status === 'PENDING' && !isOwn;
      const statusColor = item.offer.status === 'ACCEPTED' ? colors.success
        : item.offer.status === 'REJECTED' ? colors.error
        : item.offer.status === 'SUPERSEDED' ? colors.textMuted
        : colors.primary;

      return (
        <View style={[styles.offerCard, isOwn ? styles.ownOffer : styles.otherOffer]}>
          <Text style={styles.offerLabel}>
            {isOwn ? 'You offered' : 'Offer received'}
          </Text>
          <Text style={styles.offerAmount}>${item.offer.amount.toFixed(2)}</Text>
          <View style={[styles.offerStatusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.offerStatusText, { color: statusColor }]}>
              {item.offer.status}
            </Text>
          </View>
          {canAct && (
            <View style={styles.offerActions}>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => accept(item.offer!.id, {
                  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['threads'] }),
                })}
              >
                <Text style={styles.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => reject(item.offer!.id, {
                  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['threads'] }),
                })}
              >
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setCounteringOfferId(item.offer!.id)}
              >
                <Text style={styles.counterBtnText}>Counter</Text>
              </TouchableOpacity>
            </View>
          )}
          {counteringOfferId === item.offer.id && (
            <View style={styles.counterInput}>
              <TextInput
                style={styles.counterField}
                placeholder="Amount"
                keyboardType="decimal-pad"
                value={counterAmount}
                onChangeText={setCounterAmount}
              />
              <TouchableOpacity
                style={styles.counterSubmit}
                onPress={() => {
                  const amt = parseFloat(counterAmount);
                  if (!amt || amt <= 0) return;
                  counter({ offerId: item.offer!.id, data: { amount: amt } }, {
                    onSuccess: () => {
                      setCounteringOfferId(null);
                      setCounterAmount('');
                    },
                  });
                }}
              >
                <Text style={styles.counterSubmitText}>Send</Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={[styles.messageTime, isOwn ? styles.ownTime : styles.otherTime]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      );
    }

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
      {listing && (
        <View style={styles.listingHeader}>
          {listing.images?.[0] && (
            <Image source={{ uri: listing.images[0].imageUrl }} style={styles.listingImage} />
          )}
          <View style={styles.listingInfo}>
            <Text style={styles.listingTitle} numberOfLines={1}>{listing.title}</Text>
            <View style={styles.listingMeta}>
              <Text style={styles.listingPrice}>${listing.currentPrice.toFixed(2)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: listing.status === 'AVAILABLE' ? '#ECFDF3' : '#FEE2E2' }]}>
                <Text style={[styles.statusText, { color: listing.status === 'AVAILABLE' ? '#12B76A' : '#F04438' }]}>
                  {listing.status}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

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
  offerCard: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 16,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  ownOffer: { alignSelf: 'flex-end' },
  otherOffer: { alignSelf: 'flex-start' },
  offerLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  offerAmount: { fontSize: 24, fontWeight: '700', color: colors.primary, marginBottom: 8 },
  offerStatusBadge: { alignSelf: 'flex-start', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 8 },
  offerStatusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  offerActions: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  acceptBtn: { backgroundColor: colors.success, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  acceptBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  rejectBtn: { backgroundColor: colors.error, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  rejectBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  counterBtn: { borderWidth: 1, borderColor: colors.primary, borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  counterBtnText: { color: colors.primary, fontSize: 13, fontWeight: '600' },
  counterInput: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  counterField: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 16, color: colors.textPrimary },
  counterSubmit: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  counterSubmitText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  listingHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  listingImage: { width: 56, height: 56, borderRadius: 8, backgroundColor: colors.background },
  listingInfo: { flex: 1, marginLeft: 12 },
  listingTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  listingMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  listingPrice: { fontSize: 16, fontWeight: '700', color: colors.primary },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
});
