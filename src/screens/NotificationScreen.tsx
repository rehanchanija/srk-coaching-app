import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ChevronLeft, 
  Bell, 
  Users, 
  CreditCard, 
  AlertCircle, 
  BookOpen,
  Check 
} from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme/Theme';
import { Card } from '../components/Card';

interface NotificationItem {
  id: string;
  type: 'student' | 'fee' | 'system' | 'course';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const notifications: NotificationItem[] = [
  {
    id: '1',
    type: 'student',
    title: 'New Student Joined',
    message: 'Aarav Sharma has been added to React Native Basics.',
    time: '2 mins ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'fee',
    title: 'Fee Overdue',
    message: 'Priya Gupta\'s fee for NEET B is overdue by 5 days.',
    time: '1 hour ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'course',
    title: 'New Material Added',
    message: 'Chapter 4: Advanced Optics has been uploaded to Physics.',
    time: '3 hours ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'System Update',
    message: 'TutorApp v2.4 is now live. Check out the new dashboard!',
    time: 'Yesterday',
    isRead: true,
  },
  {
    id: '5',
    type: 'student',
    title: 'Attendance Alert',
    message: '3 students were absent today in JEE Mains A.',
    time: 'Yesterday',
    isRead: true,
  },
];

interface NotificationScreenProps {
  onBack: () => void;
}

export const NotificationScreen: React.FC<NotificationScreenProps> = ({ onBack }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };
  const renderIcon = (type: NotificationItem['type']) => {
    const size = 20;
    const strokeWidth = 2.5;
    switch (type) {
      case 'student': return <View style={[styles.iconBox, { backgroundColor: colors.primaryLight }]}><Users color={colors.primary} size={size} strokeWidth={strokeWidth} /></View>;
      case 'fee': return <View style={[styles.iconBox, { backgroundColor: colors.warningLight }]}><CreditCard color={colors.warning} size={size} strokeWidth={strokeWidth} /></View>;
      case 'course': return <View style={[styles.iconBox, { backgroundColor: colors.accentLight }]}><BookOpen color={colors.accent} size={size} strokeWidth={strokeWidth} /></View>;
      case 'system': return <View style={[styles.iconBox, { backgroundColor: colors.dangerLight }]}><AlertCircle color={colors.danger} size={size} strokeWidth={strokeWidth} /></View>;
    }
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <Card variant={item.isRead ? 'flat' : 'elevated'} style={[styles.notifCard, !item.isRead && styles.unreadCard]}>
      <View style={styles.notifRow}>
        {renderIcon(item.type)}
        <View style={styles.textContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.notifTitle, !item.isRead && styles.boldText]}>{item.title}</Text>
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
          <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft color={colors.text} size={28} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={typography.h1}>Notifications</Text>
        <TouchableOpacity style={styles.markReadBtn}>
           <Check color={colors.primary} size={20} strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<Text style={styles.sectionLabel}>Recent Activity</Text>}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    marginBottom: spacing.l,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  markReadBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: spacing.l,
    paddingBottom: 40,
  },
  sectionLabel: {
    ...typography.caption,
    marginBottom: spacing.m,
    color: colors.textMuted,
  },
  notifCard: {
    marginBottom: spacing.m,
    padding: spacing.m,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notifRow: {
    flexDirection: 'row',
    gap: spacing.m,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  boldText: {
    fontWeight: '800',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notifMessage: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 8,
  },
  notifTime: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
});
