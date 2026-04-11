import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Layers,
  ChevronRight,
  Search,
  Plus,
  X,
  Sun,
  Moon,
  Users,
  TrendingUp,
  Calendar,
} from 'lucide-react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { colors, radius, spacing, typography } from '../theme/Theme';
import { batchService, Batch } from '../services/batchService';
import Toast from 'react-native-toast-message';

interface BatchScreenProps {
  onNavigateSubject: (batchId: string, batchName?: string) => void;
}

export const BatchScreen: React.FC<BatchScreenProps> = ({
  onNavigateSubject,
}) => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [batchName, setBatchName] = useState('');
  const [batchType, setBatchType] = useState<'Morning' | 'Evening'>('Morning');
  const [startDate, setStartDate] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [activeDateField, setActiveDateField] = useState<
    'start' | 'completion'
  >('start');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const data = await batchService.getAll();
      setBatches(data);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Fetch Error',
        text2: 'Could not load batches.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchBatches();
  };

  const batchSchema = z.object({
    name: z.string().min(3, 'Batch name must be at least 3 characters'),
    startDate: z.string().min(10, 'Invalid start date'),
    completionDate: z.string().min(10, 'Invalid completion date'),
  });

  const validate = () => {
    try {
      setErrors({});
      batchSchema.parse({
        name: batchName,
        startDate,
        completionDate,
      });
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        err.issues.forEach(e => {
          if (e.path[0]) formattedErrors[e.path[0].toString()] = e.message;
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const handleCreateBatch = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      // Parse DD/MM/YYYY to ISO
      const [sd, sm, sy] = startDate.split('/').map(Number);
      const [cd, cm, cy] = completionDate.split('/').map(Number);

      const sIso = new Date(sy, sm - 1, sd).toISOString();
      const cIso = new Date(cy, cm - 1, cd).toISOString();

      const batchData = {
        name: batchName,
        type: batchType.toLowerCase() as 'morning' | 'evening',
        startDate: sIso,
        completionDate: cIso,
      };

      console.log('Creating Batch with data:', batchData);

      await batchService.create(batchData);

      console.log('Batch created successfully!');

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Batch created successfully!',
      });

      setModalVisible(false);
      setBatchName('');
      setBatchType('Morning');
      setStartDate('');
      setCompletionDate('');
      setErrors({});
      fetchBatches();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Creation Error',
        text2: 'Could not create batch. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [showYearSelector, setShowYearSelector] = useState(false);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderBatch = ({ item }: { item: Batch }) => {
    const progress = item.progress ? Math.round(item.progress) : 0;
    const students = 0; // Pending backend support
    const isComplete = progress >= 100;
    const statusText = isComplete ? 'Complete' : 'Active';

    return (
      <Card
        onPress={() => onNavigateSubject(item._id, item.name)}
        style={styles.batchCard}
      >
        <View style={styles.headerRow}>
          <View style={styles.titleWrapper}>
            <View style={styles.iconCircle}>
              <Layers size={20} color={colors.primary} strokeWidth={2.5} />
            </View>
            <Text style={[typography.h3, styles.batchName]} numberOfLines={1}>
              {item.name}
            </Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>

          <ChevronRight color={colors.textLight} size={22} strokeWidth={2.5} />
        </View>

        <View style={[styles.badgeRow, { justifyContent: 'space-between', alignItems: 'center' }]}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.type}</Text>
            </View>
            <View style={styles.studentsContainer}>
              <Users size={14} color={colors.textLight} />
              <Text style={styles.studentsText}>{students}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Calendar size={13} color={colors.textLight} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: colors.textLight, fontWeight: '600' }}>
              {item.startDate ? new Date(item.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'TBD'} - {item.completionDate ? new Date(item.completionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }) : 'TBD'}
            </Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressTextContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TrendingUp
                size={16}
                color={colors.secondary}
                strokeWidth={2.5}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  typography.caption,
                  { fontWeight: '700', color: colors.textLight },
                ]}
              >
                Overall Progress
              </Text>
            </View>
            <Text
              style={[
                typography.caption,
                { fontWeight: '800', color: colors.text, fontSize: 13 },
              ]}
            >
              {progress}%
            </Text>
          </View>
          <ProgressBar progress={progress} color={colors.primary} height={6} />
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[typography.h1, styles.title]}>All Batches</Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={styles.plusButton}
            activeOpacity={0.8}
          >
            <Plus color="#FFFFFF" size={24} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Search
            color={colors.textLight}
            size={18}
            strokeWidth={2.5}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search batches..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
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

        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => {
                Keyboard.dismiss();
                setModalVisible(false);
              }}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardAvoidingView}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={[typography.h2, { marginBottom: 0 }]}>
                    Create New Batch
                  </Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeBtn}
                  >
                    <X color="#94A3B8" size={22} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Input
                    label="Batch Name"
                    placeholder="e.g. JEE Advanced 2026"
                    value={batchName}
                    onChangeText={setBatchName}
                    error={errors.name}
                  />

                  <Text style={styles.fieldLabel}>Timing Slot</Text>
                  <View style={styles.toggleRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.toggleBtn,
                        batchType === 'Morning' && styles.activeToggle,
                      ]}
                      onPress={() => setBatchType('Morning')}
                    >
                      <Sun
                        size={18}
                        color={
                          batchType === 'Morning'
                            ? colors.white
                            : colors.textLight
                        }
                        strokeWidth={2.5}
                      />
                      <Text
                        style={[
                          styles.toggleText,
                          batchType === 'Morning' && styles.activeToggleText,
                        ]}
                      >
                        Morning
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        styles.toggleBtn,
                        batchType === 'Evening' && styles.activeToggle,
                        { marginLeft: spacing.s },
                      ]}
                      onPress={() => setBatchType('Evening')}
                    >
                      <Moon
                        size={18}
                        color={
                          batchType === 'Evening'
                            ? colors.white
                            : colors.textLight
                        }
                        strokeWidth={2.5}
                      />
                      <Text
                        style={[
                          styles.toggleText,
                          batchType === 'Evening' && styles.activeToggleText,
                        ]}
                      >
                        Evening
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.dateRow}>
                    <View style={{ flex: 1 }}>
                      <Input
                        label="Start Date"
                        placeholder="DD/MM/YYYY"
                        value={startDate}
                        editable={false}
                        onContainerPress={() => {
                          setActiveDateField('start');
                          setShowCalendar(true);
                        }}
                        rightIcon={
                          <Calendar size={18} color={colors.textLight} />
                        }
                        error={errors.startDate}
                      />
                    </View>
                    <View style={{ width: 16 }} />
                    <View style={{ flex: 1 }}>
                      <Input
                        label="Completion"
                        placeholder="DD/MM/YYYY"
                        value={completionDate}
                        editable={false}
                        onContainerPress={() => {
                          setActiveDateField('completion');
                          setShowCalendar(true);
                        }}
                        rightIcon={
                          <Calendar size={18} color={colors.textLight} />
                        }
                        error={errors.completionDate}
                      />
                    </View>
                  </View>
                </View>

                <Button
                  title="Create Batch"
                  onPress={handleCreateBatch}
                  disabled={batchName.trim() === '' || startDate.trim() === ''}
                  style={styles.modalActionBtn}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        <Modal
          visible={showCalendar}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCalendar(false)}
        >
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowCalendar(false)}>
                  <X color="#94A3B8" size={22} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
              <ScrollView
                style={styles.calendarWrapper}
                showsVerticalScrollIndicator={false}
              >
                {showYearSelector ? (
                  <View style={styles.yearSelectorContainer}>
                    <View style={styles.yearGrid}>
                      {Array.from({ length: 11 }, (_, i) => 2020 + i).map(
                        year => (
                          <TouchableOpacity
                            key={year}
                            style={[
                              styles.yearItem,
                              year === calendarYear && styles.selectedYearItem,
                            ]}
                            onPress={() => {
                              setCalendarYear(year);
                              setShowYearSelector(false);
                            }}
                          >
                            <Text
                              style={[
                                styles.yearItemText,
                                year === calendarYear &&
                                  styles.selectedYearText,
                              ]}
                            >
                              {year}
                            </Text>
                          </TouchableOpacity>
                        ),
                      )}
                    </View>
                  </View>
                ) : (
                  <>
                    <View style={styles.monthYearSelector}>
                      <TouchableOpacity
                        onPress={() =>
                          setCalendarMonth(
                            calendarMonth === 0 ? 11 : calendarMonth - 1,
                          )
                        }
                      >
                        <ChevronRight
                          style={{ transform: [{ rotate: '180deg' }] }}
                          size={24}
                          color={colors.primary}
                          strokeWidth={2.5}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.yearDropdownTrigger}
                        onPress={() => setShowYearSelector(true)}
                      >
                        <Text style={styles.monthYearText}>
                          {months[calendarMonth]} {calendarYear}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          setCalendarMonth(
                            calendarMonth === 11 ? 0 : calendarMonth + 1,
                          )
                        }
                      >
                        <ChevronRight
                          size={24}
                          color={colors.primary}
                          strokeWidth={2.5}
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.daysHeader}>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                        day => (
                          <Text key={day} style={styles.dayHeaderText}>
                            {day}
                          </Text>
                        ),
                      )}
                    </View>
                    <View style={styles.calendarGrid}>
                      {(() => {
                        const firstDay = new Date(
                          calendarYear,
                          calendarMonth,
                          1,
                        ).getDay();
                        const daysInMonth = new Date(
                          calendarYear,
                          calendarMonth + 1,
                          0,
                        ).getDate();
                        const days = [];
                        for (let i = 0; i < firstDay; i++) days.push(null);
                        for (let i = 1; i <= daysInMonth; i++) days.push(i);
                        return days.map((day, index) => {
                          const isToday =
                            day === new Date().getDate() &&
                            calendarMonth === new Date().getMonth() &&
                            calendarYear === new Date().getFullYear();
                          const d = String(day).padStart(2, '0');
                          const m = String(calendarMonth + 1).padStart(2, '0');
                          const formatted = `${d}/${m}/${calendarYear}`;
                          const isSelected =
                            (activeDateField === 'start'
                              ? startDate
                              : completionDate) === formatted;

                          return (
                            <TouchableOpacity
                              key={index}
                              style={[
                                styles.calendarDay,
                                !day && styles.emptyDay,
                                isSelected && styles.selectedDay,
                              ]}
                              disabled={!day}
                              onPress={() => {
                                if (day) {
                                  const selectedDate = new Date(
                                    calendarYear,
                                    calendarMonth,
                                    day,
                                  );

                                  if (
                                    activeDateField === 'completion' &&
                                    startDate
                                  ) {
                                    const [sd, sm, sy] = startDate
                                      .split('/')
                                      .map(Number);
                                    const startD = new Date(sy, sm - 1, sd);

                                    if (selectedDate < startD) {
                                      Toast.show({
                                        type: 'error',
                                        text1: 'Invalid Date',
                                        text2:
                                          'Completion date cannot be before Start date!',
                                      });
                                      return;
                                    }
                                  }

                                  if (activeDateField === 'start')
                                    setStartDate(formatted);
                                  else setCompletionDate(formatted);
                                  setShowCalendar(false);
                                }
                              }}
                            >
                              <Text
                                style={[
                                  styles.calendarDayText,
                                  !day && styles.emptyDayText,
                                  isSelected && styles.selectedDayText,
                                  isToday && !isSelected && styles.todayText,
                                ]}
                              >
                                {day}
                              </Text>
                            </TouchableOpacity>
                          );
                        });
                      })()}
                    </View>
                  </>
                )}
              </ScrollView>
              <Button
                title="Close"
                variant="primary"
                onPress={() => setShowCalendar(false)}
                style={{ margin: 16 }}
              />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  title: {
    marginBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  plusButton: {
    backgroundColor: colors.primary,
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    height: 50,
    paddingHorizontal: spacing.m,
    marginBottom: spacing.l,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchIcon: {
    marginRight: spacing.s,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    height: '100%',
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  batchCard: {
    marginBottom: spacing.m,
    padding: spacing.m,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: spacing.s,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.m,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  batchName: {
    fontSize: 17,
    flexShrink: 1,
  },
  statusBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: spacing.s,
  },
  statusText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  badge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: spacing.m,
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  studentsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  studentsText: {
    color: colors.textLight,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: spacing.xs,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: {
    width: '100%',
    paddingHorizontal: spacing.l,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: spacing.l,
    paddingTop: spacing.l,
    paddingBottom: spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
    marginBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  closeBtn: {
    padding: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  modalBody: {
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
    marginTop: 4,
    letterSpacing: -0.2,
  },
  toggleRow: {
    flexDirection: 'row',
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: radius.l,
  },
  activeToggle: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: {
    ...typography.caption,
    fontWeight: '800',
    marginLeft: 8,
    color: '#64748B',
  },
  activeToggleText: {
    color: colors.white,
  },
  dateRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  modalActionBtn: {
    width: '100%',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pickerContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingTop: 16,
    paddingBottom: 20,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  calendarWrapper: {
    paddingHorizontal: 16,
  },
  monthYearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  yearDropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
  },
  yearSelectorContainer: {
    height: 300,
    paddingHorizontal: 8,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  yearItem: {
    width: '30%',
    paddingVertical: 12,
    margin: 4,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedYearItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  yearItemText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  selectedYearText: {
    color: '#FFF',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  calendarDayText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  selectedDayText: {
    color: '#FFF',
    fontWeight: '800',
  },
  todayText: {
    color: colors.text,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  emptyDay: {
    backgroundColor: 'transparent',
  },
  emptyDayText: {
    opacity: 0,
  },
});
