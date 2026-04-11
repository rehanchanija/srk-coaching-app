import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  ChevronRight,
  Plus,
  Layers,
  Users,
} from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme/Theme';
import { Card } from '../components/Card';

const { width } = Dimensions.get('window');

interface BatchChatPreview {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  members: number;
  type: string;
}

interface MessageScreenProps {
  onNavigateChat: (batchId: string, batchName: string) => void;
}

export const MessageScreen: React.FC<MessageScreenProps> = ({ onNavigateChat }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const batchChats: BatchChatPreview[] = [
    {
      id: '1',
      name: 'React Native Basics',
      lastMessage: 'Good morning everyone! Please remember...',
      time: '09:20 AM',
      unreadCount: 2,
      members: 25,
      type: 'Morning',
    },
    {
      id: '2',
      name: 'Advanced JavaScript',
      lastMessage: 'The new course materials are ready...',
      time: 'Yesterday',
      unreadCount: 0,
      members: 18,
      type: 'Morning',
    },
    {
      id: '3',
      name: 'UI/UX Design',
      lastMessage: 'Can we reschedule the batch timing...',
      time: '24 Mar',
      unreadCount: 0,
      members: 30,
      type: 'Evening',
    },
    {
        id: '4',
        name: 'Node.js Backend',
        lastMessage: 'Group members has updated the curriculum.',
        time: '22 Mar',
        unreadCount: 1,
        members: 22,
        type: 'Evening',
      },
  ];

  const filteredChats = batchChats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View>
          <Text style={typography.h1}>Batch Chats</Text>
          <Text style={styles.subTitle}>Connect with your student groups</Text>
        </View>
        <TouchableOpacity style={styles.newChatBtn}>
          <Plus color="#FFF" size={24} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Search color={colors.textMuted} size={20} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search batches..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {filteredChats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            onPress={() => onNavigateChat(chat.id, chat.name)}
            activeOpacity={0.7}
          >
            <Card style={styles.chatCard}>
              <View style={styles.batchAvatar}>
                <Layers color={colors.primary} size={24} strokeWidth={2.5} />
              </View>

              <View style={styles.chatInfo}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName} numberOfLines={1}>{chat.name}</Text>
                  <Text style={styles.chatTime}>{chat.time}</Text>
                </View>
                
                <View style={styles.chatFooter}>
                  <Text style={styles.lastMessage} numberOfLines={1}>{chat.lastMessage}</Text>
                  {chat.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.metaRow}>
                   <View style={styles.metaItem}>
                      <Users size={12} color={colors.textMuted} />
                      <Text style={styles.metaText}>{chat.members} Students</Text>
                   </View>
                   <View style={styles.dot} />
                   <Text style={styles.metaText}>{chat.type}</Text>
                </View>
              </View>
              
              <ChevronRight size={18} color={colors.textMuted} strokeWidth={2.5} />
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  subTitle: { fontSize: 14, color: colors.textLight, fontWeight: '500' },
  newChatBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 20,
  },
  searchIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.text },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  batchAvatar: { 
    width: 56, 
    height: 56, 
    borderRadius: 18, 
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInfo: { flex: 1, marginLeft: 16, marginRight: 8 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  chatName: { fontSize: 16, fontWeight: '800', color: colors.text, flex: 1 },
  chatTime: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  chatFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  lastMessage: { fontSize: 13, color: colors.textLight, fontWeight: '500', flex: 1 },
  unreadBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, color: colors.textMuted, fontWeight: '700' },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.border },
});
