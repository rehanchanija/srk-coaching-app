import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  LibraryBig,
  Sun,
  Moon,
  ChevronRight,
  Layers,
  Bell,
} from 'lucide-react-native';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { colors, radius, spacing, typography } from '../theme/Theme';
import { dashboardService, DashboardStats } from '../services/dashboardService';
import { batchService, Batch } from '../services/batchService';
import Toast from 'react-native-toast-message';

interface DashboardScreenProps {
  onNavigateBatch: (batchId: string, batchName?: string) => void;
  onNavigateNotifications: () => void;
  userName?: string;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateBatch,
  onNavigateNotifications,
  userName = 'Admin',
}) => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBatches: 0,
    totalStudents: 0,
  });
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'morning' | 'evening'>('morning');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, batchesData] = await Promise.all([
        dashboardService.getStats(),
        batchService.getAll(),
      ]);
      setStats(statsData);
      setBatches(batchesData);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load dashboard data.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const filteredBatches = batches.filter(b => b.type === filter);

  const renderBatch = ({ item }: { item: Batch }) => (
    <Card
      onPress={() => onNavigateBatch(item._id, item.name)}
      style={styles.batchCard}
    >
      <View style={styles.batchContainer}>
        <View style={styles.iconCircle}>
          <LibraryBig color={colors.primary} size={22} strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h3, styles.batchTitle]} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.batchMeta}>
            <Users color={colors.textMuted} size={14} />
            <Text style={styles.studentsText}>Active Batch</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.progressText}>{item.progress ? Math.round(item.progress) : 0}% Done</Text>
          </View>
        </View>
        <ChevronRight color={colors.textMuted} size={20} />
      </View>
      <View style={{ marginTop: spacing.m }}>
        <ProgressBar progress={item.progress || 0} color={colors.primary} height={6} />
      </View>
    </Card>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>SRK Coaching,</Text>
            <Text style={typography.h1}>{userName}</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBadge}
            activeOpacity={0.8}
            onPress={onNavigateNotifications}
          >
            <Bell color={colors.text} size={24} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsOverview}>
          <Card
            style={[styles.statCardGrid, { backgroundColor: colors.accent }]}
          >
            <Layers color="#FFF" size={24} />
            <Text style={styles.statGridValue}>{stats.totalBatches}</Text>
            <Text style={styles.statGridLabel}>Total Batches</Text>
          </Card>
          <Card
            style={[styles.statCardGrid, { backgroundColor: colors.primary }]}
          >
            <Users color="#FFF" size={24} />
            <Text style={styles.statGridValue}>{stats.totalStudents}</Text>
            <Text style={styles.statGridLabel}>Total Students</Text>
          </Card>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={typography.h2}>Current Batches</Text>
          <View style={styles.togglePill}>
            <TouchableOpacity
              onPress={() => setFilter('morning')}
              style={[styles.pill, filter === 'morning' && styles.activePill]}
            >
              <Sun
                size={14}
                color={filter === 'morning' ? colors.primary : colors.textLight}
              />
              <Text
                style={[
                  styles.pillText,
                  filter === 'morning' && styles.activePillText,
                ]}
              >
                Morning
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilter('evening')}
              style={[styles.pill, filter === 'evening' && styles.activePill]}
            >
              <Moon
                size={14}
                color={filter === 'evening' ? colors.primary : colors.textLight}
              />
              <Text
                style={[
                  styles.pillText,
                  filter === 'evening' && styles.activePillText,
                ]}
              >
                Evening
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isLoading && !isRefreshing ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredBatches}
            keyExtractor={item => item._id}
            renderItem={renderBatch}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, paddingHorizontal: spacing.l, paddingTop: spacing.m },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  greeting: { fontSize: 16, color: colors.textLight, fontWeight: '600' },
  notifBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 14,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
    borderWidth: 2,
    borderColor: '#FFF',
  },
  statsOverview: {
    flexDirection: 'row',
    gap: spacing.m,
    marginBottom: spacing.xs,
  },
  statCardGrid: {
    flex: 1,
    padding: spacing.l,
    borderRadius: radius.xl,
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  statGridValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 12,
  },
  statGridLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeader: {
    marginBottom: spacing.m,
    marginTop: spacing.xs,
  },
  togglePill: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9', // Very light slate
    padding: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginTop: 12, // Gap below title
    width: '100%', // Full width looks better when stacked
  },
  pill: {
    flex: 1, // Equal width for both
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  activePill: {
    backgroundColor: '#FFFFFF', // High-end white-on-slate look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textLight,
    marginLeft: 6,
    letterSpacing: -0.2,
  },
  activePillText: {
    color: colors.primary, // Indigo text for active
  },
  listContent: { paddingBottom: 100 },
  batchCard: { marginBottom: spacing.m, padding: spacing.m },
  batchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  batchTitle: { fontSize: 16, fontWeight: '800' },
  batchMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  studentsText: { fontSize: 13, fontWeight: '600', color: colors.textLight },
  separator: { color: colors.textMuted },
  progressText: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
