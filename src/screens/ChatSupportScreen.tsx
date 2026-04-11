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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Send,
  Sparkles,
  User,
  ShieldCheck,
} from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme/Theme';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  time: string;
}

interface ChatSupportScreenProps {
  onBack: () => void;
}

export const ChatSupportScreen: React.FC<ChatSupportScreenProps> = ({
  onBack,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! How can we help you today?',
      isUser: false,
      time: '10:00 AM',
    },
    {
      id: '2',
      text: 'I have some questions about the new dashboard features.',
      isUser: true,
      time: '10:01 AM',
    },
    {
      id: '3',
      text: 'Sure! I can explain everything. Which part do you want to know about?',
      isUser: false,
      time: '10:02 AM',
    },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (input.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: input,
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
            <View style={styles.supportAvatar}>
              <ShieldCheck color={colors.white} size={20} strokeWidth={2.5} />
              <View style={styles.activeIndicator} />
            </View>
            <View>
              <Text style={styles.title}>Tutor Support</Text>
              <Text style={styles.sub}>Always Online</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.infoBtn}>
            <Sparkles color={colors.primary} size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(m => (
            <View
              key={m.id}
              style={[
                styles.messageRow,
                m.isUser ? styles.userRow : styles.supportRow,
              ]}
            >
              {!m.isUser && (
                <View style={styles.miniAvatar}>
                  <ShieldCheck color={colors.primary} size={14} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  m.isUser ? styles.userBubble : styles.supportBubble,
                ]}
              >
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
              placeholder="Type a message..."
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
  supportAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.text },
  sub: { fontSize: 12, color: colors.secondary, fontWeight: '700' },
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
    marginBottom: 20,
    maxWidth: '85%',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userRow: { alignSelf: 'flex-end' },
  supportRow: { alignSelf: 'flex-start' },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageBubble: {
    padding: 14,
    borderRadius: 20,
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
  messageText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
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
