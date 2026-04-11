import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Send,
  Sparkles,
  Users,
  Info,
} from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme/Theme';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  senderName: string;
  isUser: boolean; // isUser is true if it's from the Current Admin
  time: string;
}

interface BatchChatScreenProps {
  batchId: string;
  batchName: string;
  onBack: () => void;
}

export const BatchChatScreen: React.FC<BatchChatScreenProps> = ({
  batchId,
  batchName,
  onBack,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Good morning everyone! Please remember to submit your assignments by EOF.',
      senderName: 'Admin (You)',
      isUser: true,
      time: '09:00 AM',
    },
    {
      id: '2',
      text: 'Got it, sir. Is there any specific format for the report?',
      senderName: 'Rahul Kumar',
      isUser: false,
      time: '09:15 AM',
    },
    {
      id: '3',
      text: 'Please use the PDF template provided in the resources section.',
      senderName: 'Admin (You)',
      isUser: true,
      time: '09:20 AM',
    },
    {
        id: '4',
        text: 'Sir, I am having trouble accessing the template.',
        senderName: 'Anjali Sharma',
        isUser: false,
        time: '09:45 AM',
      },
  ]);
  const [input, setInput] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const sendMessage = () => {
    if (input.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: input,
        senderName: 'Admin (You)',
        isUser: true,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setMessages([...messages, newMessage]);
      setInput('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Chat Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ChevronLeft color={colors.text} size={28} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <View style={styles.batchAvatar}>
              <Users color={colors.white} size={20} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.title} numberOfLines={1}>{batchName}</Text>
              <Text style={styles.sub}>Group Chat • 24 Students</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.infoBtn}>
            <Info color={colors.primary} size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          {messages.map(m => (
            <View
              key={m.id}
              style={[
                styles.messageRow,
                m.isUser ? styles.userRow : styles.supportRow,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  m.isUser ? styles.userBubble : styles.supportBubble,
                ]}
              >
                {!m.isUser && <Text style={styles.senderName}>{m.senderName}</Text>}
                <Text
                  style={[
                    styles.messageText,
                    m.isUser ? styles.userText : styles.supportText,
                  ]}
                >
                  {m.text}
                </Text>
                <Text
                  style={[
                    styles.timeText,
                    m.isUser ? styles.userTimeText : styles.supportTimeText,
                  ]}
                >
                  {m.time}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Message this batch..."
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
            />
            <TouchableOpacity
              onPress={sendMessage}
              style={[styles.sendBtn, !input.trim() && { opacity: 0.5 }]}
            >
              <Send color="#FFF" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
  },
  batchAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  infoBtn: {
    width: 40,
    height: 40,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: { padding: 20, paddingBottom: 40 },
  messageRow: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userRow: { alignSelf: 'flex-end' },
  supportRow: { alignSelf: 'flex-start' },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
  userBubble: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  supportBubble: {
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  senderName: { fontSize: 11, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  messageText: { fontSize: 15, lineHeight: 21, fontWeight: '500' },
  userText: { color: '#FFF' },
  supportText: { color: colors.text },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  userTimeText: { color: 'rgba(255,255,255,0.7)' },
  supportTimeText: { color: colors.textMuted },
  inputBar: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    padding: 6,
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
