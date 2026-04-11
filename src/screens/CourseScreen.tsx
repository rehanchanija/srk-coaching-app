import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Pressable,
  Keyboard,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, PlayCircle, Plus, X, CheckCircle2 } from 'lucide-react-native';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, radius, spacing, typography } from '../theme/Theme';
import { Checkbox } from '../components/Checkbox';
import { courseService, Course } from '../services/courseService';
import Toast from 'react-native-toast-message';

interface CourseScreenProps {
  subjectId: string;
  onBack: () => void;
  isStudentRole?: boolean;
}

export const CourseScreen: React.FC<CourseScreenProps> = ({
  subjectId,
  onBack,
  isStudentRole,
}) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [chapterName, setChapterName] = useState('');
  const [lectureCount, setLectureCount] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCourses();
  }, [subjectId]);

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching Courses for Subject ID:', subjectId);
      const data = await courseService.getBySubject(subjectId);
      console.log('Fetched Chapters:', data.length);
      setCourses(data);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not fetch data.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchCourses();
  };

  const chapterSchema = z.object({
    name: z.string().min(3, 'Chapter name must be at least 3 characters'),
  });

  const validate = () => {
    try {
      setErrors({});
      chapterSchema.parse({ name: chapterName });
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

  const toggleStatus = async (id: string, isCurrentlyCompleted: boolean) => {
    try {
      const newProgress = isCurrentlyCompleted ? 0 : 100;
      const updated = await courseService.updateProgress(id, newProgress);
      setCourses(prev => prev.map(c => (c._id === id ? updated : c)));
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Update failed.' });
    }
  };

  const handleCreateChapter = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      const courseData = {
        name: chapterName,
        subjectId: subjectId,
      };

      console.log('Creating Chapter with data:', courseData);

      await courseService.create(courseData);

      console.log('Chapter created successfully!');

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Chapter created successfully!',
      });

      setModalVisible(false);
      setChapterName('');
      setLectureCount('');
      setErrors({});
      fetchCourses();
    } catch (err) {
      console.error('Failed to create chapter error:', err);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Creation failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const totalChapters = courses.length;
  const completedChapters = courses.filter(ch => ch.progress === 100).length;
  const progressPercent =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

  const renderChapter = ({ item, index }: { item: Course; index: number }) => (
    <TouchableOpacity
      style={styles.chapterItem}
      onPress={() => {
        if (!isStudentRole) toggleStatus(item._id, item.progress === 100);
      }}
      activeOpacity={isStudentRole ? 1 : 0.8}
    >
      <View
        style={[
          styles.chapterNumberCircle,
          item.progress === 100
            ? { backgroundColor: colors.primaryLight }
            : { backgroundColor: colors.background },
        ]}
      >
        <Text
          style={[
            styles.chapterNumberText,
            item.progress === 100
              ? { color: colors.text }
              : { color: colors.textLight },
          ]}
        >
          {index + 1}
        </Text>
      </View>

      <View style={styles.chapterInfo}>
        <Text
          style={[
            styles.chapterName,
            item.progress === 100 && styles.completedChapterName,
          ]}
        >
          {item.name}
        </Text>
        <Text style={styles.chapterSubtext}>
          {item.progress === 100 ? 'Completed' : 'Pending'}
        </Text>
      </View>

      {isStudentRole ? (
        <View style={styles.statusIconBox}>
          {item.progress === 100 && <CheckCircle2 color={colors.success} size={20} />}
        </View>
      ) : (
        <View style={styles.statusIconBox}>
          <Checkbox
            checked={item.progress === 100}
            onChange={() => toggleStatus(item._id, item.progress === 100)}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft color="#64748B" size={24} strokeWidth={3} />
            <Text style={styles.headerBreadcrumb}>Subject Content</Text>
          </TouchableOpacity>
          {!isStudentRole && (
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={styles.plusIconButton}
            >
              <Plus color="#64748B" size={24} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>

        {/* Create Chapter Modal */}
        <Modal
          visible={modalVisible}
          transparent
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
                  <Text style={styles.modalTitle}>Add New Chapter</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeBtn}
                  >
                    <X color="#94A3B8" size={22} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Input
                    label="Chapter Name"
                    placeholder="e.g. Quadratic Equations"
                    value={chapterName}
                    onChangeText={setChapterName}
                    autoFocus
                    error={errors.name}
                  />
                  <Input
                    label="Lecture Count"
                    placeholder="4"
                    value={lectureCount}
                    onChangeText={setLectureCount}
                    keyboardType="numeric"
                    error={errors.lectures}
                  />
                </View>

                <Button
                  title="Create Chapter"
                  onPress={handleCreateChapter}
                  disabled={chapterName.trim() === ''}
                  style={styles.modalActionBtn}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        <View style={styles.statsRow}>
          <View
            style={[styles.statCard, { backgroundColor: colors.primaryLight }]}
          >
            <Text style={[styles.statValue, { color: colors.text }]}>
              {totalChapters}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textLight }]}>
              Chapters
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.primary }]}>
            <Text style={[styles.statValue, { color: colors.white }]}>
              {completedChapters}
            </Text>
            <Text style={[styles.statLabel, { color: colors.white }]}>
              Completed
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {isLoading && !isRefreshing ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={courses}
          renderItem={renderChapter}
          keyExtractor={item => item._id}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plusIconButton: {
    padding: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerBreadcrumb: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94A3B8',
    marginLeft: 4,
  },
  contentHeader: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    marginHorizontal: 24,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 14,
  },
  activeTabText: {
    color: '#0F172A',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  chapterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  chapterNumberCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  chapterNumberText: {
    fontSize: 16,
    fontWeight: '800',
  },
  chapterInfo: {
    flex: 1,
  },
  chapterName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  completedChapterName: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
    opacity: 0.7,
  },
  chapterSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  statusIconBox: {
    width: 32,
    alignItems: 'center',
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  keyboardAvoidingView: {
    width: '100%',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    marginBottom: 24,
  },
  modalActionBtn: {
    borderRadius: 16,
    height: 54,
  },
});
