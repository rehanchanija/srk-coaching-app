import React, { useState } from 'react';
import { z } from 'zod';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ChevronLeft,
  Sun,
  Moon,
  CalendarDays,
  BookOpen,
} from 'lucide-react-native';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, radius, spacing, typography } from '../theme/Theme';
import { batchService } from '../services/batchService';
import Toast from 'react-native-toast-message';

interface CreateBatchScreenProps {
  onBack: () => void;
}

export const CreateBatchScreen: React.FC<CreateBatchScreenProps> = ({
  onBack,
}) => {
  const [batchName, setBatchName] = useState('');
  const [batchType, setBatchType] = useState<'morning' | 'evening'>('morning');
  const [startDate, setStartDate] = useState(new Date());
  const [completionDate, setCompletionDate] = useState(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)); // 3 months default
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showCompletionPicker, setShowCompletionPicker] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const batchSchema = z.object({
    name: z.string().min(3, 'Batch name must be at least 3 characters'),
  });

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const validate = () => {
    try {
      setErrors({});
      batchSchema.parse({ name: batchName });
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

  const handleCreate = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      await batchService.create({
        name: batchName,
        type: batchType,
        startDate: startDate.toISOString(),
        completionDate: completionDate.toISOString(),
      });
      
      Toast.show({
        type: 'success',
        text1: 'Batch Created',
        text2: `${batchName} has been established.`,
      });
      onBack();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Creation Failed',
        text2: err instanceof Error ? err.message : 'Unknown error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <ChevronLeft color={colors.text} size={26} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={[typography.h2, styles.title]}>Create New Batch</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="always"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
          }
        >
          <View style={styles.formGroup}>
            <Input
              label="Batch Name"
              placeholder="e.g. JEE Advanced 2026"
              value={batchName}
              onChangeText={setBatchName}
              icon={<BookOpen color={colors.textLight} size={20} />}
              error={errors.name}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Timing Slot</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.toggleBtn,
                  batchType === 'morning' && styles.activeToggle,
                ]}
                onPress={() => setBatchType('morning')}
              >
                <Sun
                  size={18}
                  color={
                    batchType === 'morning' ? colors.white : colors.textLight
                  }
                  strokeWidth={2.5}
                />
                <Text
                  style={[
                    styles.toggleText,
                    batchType === 'morning' && styles.activeToggleText,
                  ]}
                >
                  Morning
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.toggleBtn,
                  batchType === 'evening' && styles.activeToggle,
                  { marginLeft: spacing.m },
                ]}
                onPress={() => setBatchType('evening')}
              >
                <Moon
                  size={18}
                  color={
                    batchType === 'evening' ? colors.white : colors.textLight
                  }
                  strokeWidth={2.5}
                />
                <Text
                  style={[
                    styles.toggleText,
                    batchType === 'evening' && styles.activeToggleText,
                  ]}
                >
                  Evening
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Dates */}
          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Start Date</Text>
            <TouchableOpacity 
              style={styles.dateSelector} 
              onPress={() => setShowStartPicker(true)}
            >
              <CalendarDays color={colors.primary} size={20} />
              <Text style={styles.dateText}>{startDate.toDateString()}</Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                onChange={(event, date) => {
                  setShowStartPicker(false);
                  if (date) setStartDate(date);
                }}
              />
            )}
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.fieldLabel}>Completion Date</Text>
            <TouchableOpacity 
              style={styles.dateSelector} 
              onPress={() => setShowCompletionPicker(true)}
            >
              <CalendarDays color={colors.accent} size={20} />
              <Text style={styles.dateText}>{completionDate.toDateString()}</Text>
            </TouchableOpacity>
            {showCompletionPicker && (
              <DateTimePicker
                value={completionDate}
                mode="date"
                onChange={(event, date) => {
                  setShowCompletionPicker(false);
                  if (date) setCompletionDate(date);
                }}
              />
            )}
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Establish Batch"
            onPress={handleCreate}
            disabled={batchName.trim() === ''}
            loading={isLoading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.l,
    marginBottom: spacing.l,
    paddingTop: spacing.s,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    flex: 1,
    color: '#0F172A',
    marginBottom: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.l,
    paddingBottom: spacing.xxl,
  },
  formGroup: {
    marginBottom: spacing.xl,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
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
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  toggleText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  activeToggleText: {
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: radius.l,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
});
