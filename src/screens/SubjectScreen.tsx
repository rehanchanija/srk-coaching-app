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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ListMinus,
  LayoutGrid,
  Users,
  Calendar,
  Plus,
  X,
  Book,
  Eye,
  EyeOff,
} from 'lucide-react-native';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, radius, spacing, typography } from '../theme/Theme';
import { Checkbox } from '../components/Checkbox';
import { subjectService, Subject } from '../services/subjectService';
import { studentService, User } from '../services/studentService';
import { batchService, Batch } from '../services/batchService';
import Toast from 'react-native-toast-message';

interface SubjectScreenProps {
  batchId: string;
  batchName?: string;
  onBack: () => void;
  onNavigateCourse: (subjectId: string) => void;
  isStudentRole?: boolean;
  userData?: any;
}

export const SubjectScreen: React.FC<SubjectScreenProps> = ({
  batchId,
  batchName,
  onBack,
  onNavigateCourse,
  isStudentRole,
  userData,
}) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [batchDetail, setBatchDetail] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = React.useState<'Subjects' | 'Students'>(
    'Subjects',
  );

  // Assign Student Modal State Workflow
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [allStudents, setAllStudents] = useState<User[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isLoadingAllStudents, setIsLoadingAllStudents] = useState(false);

  // Input states for Subject Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [topics, setTopics] = useState('');
  const [chapters, setChapters] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Student Input states
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentAddress, setStudentAddress] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [batchId]);

  useEffect(() => {
    if (activeTab === 'Students' && students.length === 0) {
      fetchStudents();
    }
  }, [activeTab]);

  const fetchInitialData = async () => {
    if (!batchId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      try {
        const subjectsData = await subjectService.getByBatch(batchId);
        setSubjects(subjectsData);
      } catch (subErr) {
        console.error('Error fetching subjects:', subErr);
      }

      try {
        const batchInfo = await batchService.findById(batchId);
        setBatchDetail(batchInfo);
      } catch (batchErr) {
        console.error('Error fetching batch info:', batchErr);
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.message || 'Could not fetch data.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await studentService.getAll(batchId);
      setStudents(data);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Could not fetch students.',
      });
    }
  };

  const fetchAllStudents = async () => {
    setIsLoadingAllStudents(true);
    try {
      const data = await studentService.getAll();
      setAllStudents(data.filter(s => s.role === 'student'));
    } catch (err) {
    } finally {
      setIsLoadingAllStudents(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    if (activeTab === 'Subjects') fetchInitialData();
    else fetchStudents();
  };

  const handlePlusPress = () => {
    if (activeTab === 'Subjects') {
      setModalVisible(true);
    } else {
      fetchAllStudents();
      setAssignModalVisible(true);
    }
  };

  const handleAssignSelected = async () => {
    if (selectedStudentIds.length === 0) return;
    setIsAssigning(true);
    try {
      await Promise.all(
        selectedStudentIds.map(id => studentService.update(id, { batchId })),
      );
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Students successfully assigned!',
      });
      setAssignModalVisible(false);
      setSelectedStudentIds([]);
      fetchStudents();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to assign some users.',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const subjectSchema = z.object({
    name: z.string().min(3, 'Subject name must be at least 3 characters'),
  });

  const validate = () => {
    try {
      setErrors({});
      subjectSchema.parse({ name: subjectName });
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

  const handleCreateSubject = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const subjectData = { name: subjectName, batchId: batchId };
      await subjectService.create(subjectData);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Subject created successfully!',
      });
      setModalVisible(false);
      setSubjectName('');
      setTopics('');
      setChapters('');
      setErrors({});
      fetchInitialData();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Creation Error',
        text2: 'Could not create subject.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStudent = async () => {
    if (!studentName || !studentEmail || !studentPhone || !studentAddress) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: 'Name, Email, Phone and Address are required',
      });
      return;
    }

    setIsLoading(true);
    try {
      const stuData = {
        name: studentName,
        email: studentEmail,
        phone: studentPhone,
        address: studentAddress,
        password: studentPassword || '123456',
        batchId: batchId,
      };

      await studentService.create(stuData);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Student added successfully!',
      });
      setStudentModalVisible(false);
      setStudentName('');
      setStudentEmail('');
      setStudentPhone('');
      setStudentAddress('');
      setStudentPassword('');
      fetchStudents();
      fetchAllStudents();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: err?.message || 'Could not add student.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availableStudentsToAssign = allStudents.filter(u => {
    const activeBatchId =
      typeof u.batchId === 'object' ? u.batchId?._id : u.batchId;
    return activeBatchId !== batchId;
  });

  const renderAvailableStudent = ({ item }: { item: User }) => {
    const initials = item.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    const isSelected = selectedStudentIds.includes(item._id);
    return (
      <TouchableOpacity
        style={styles.studentItemInline}
        activeOpacity={0.7}
        onPress={() => {
          if (isSelected)
            setSelectedStudentIds(
              selectedStudentIds.filter(id => id !== item._id),
            );
          else setSelectedStudentIds([...selectedStudentIds, item._id]);
        }}
      >
        <View
          style={[
            styles.studentAvatarInline,
            { width: 36, height: 36, marginRight: 10, borderRadius: 10 },
          ]}
        >
          <Text style={[styles.studentInitials, { fontSize: 13 }]}>
            {initials}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.studentName, { fontSize: 15 }]}>
            {item.name}
          </Text>
          <Text style={[styles.studentRoll, { fontSize: 12 }]}>
            {item.email}
          </Text>
        </View>
        <Checkbox checked={isSelected} onChange={() => {}} />
      </TouchableOpacity>
    );
  };

  const renderSubject = ({ item }: { item: Subject }) => (
    <Card onPress={() => onNavigateCourse(item._id)} style={styles.subjectCard}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <Book color={colors.primary} size={22} strokeWidth={2.5} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.subjectName}>{item.name}</Text>
          <Text style={styles.topicText} numberOfLines={1}>
            {item.totalChapters === 0
              ? 'No chapters added yet'
              : `${item.completedChapters}/${item.totalChapters} Chapters Completed`}
          </Text>
        </View>
        <ChevronRight color={colors.textMuted} size={20} />
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.metaBox}>
          <LayoutGrid color={colors.textLight} size={14} />
          <Text style={styles.metaText}>
            {item.totalChapters || 0} Chapters
          </Text>
        </View>
        <Text style={styles.progressValue}>
          {Math.round(item.progress || 0)}%
        </Text>
      </View>
      <ProgressBar
        progress={item.progress || 0}
        color={colors.primary}
        height={6}
      />
    </Card>
  );

  const renderStudent = ({ item }: { item: User }) => {
    const initials = item.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    return (
      <View style={styles.studentItem}>
        <View style={styles.studentAvatar}>
          <Text style={styles.studentInitials}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentRoll}>{item.email}</Text>
          {item.updatedAt && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 4,
              }}
            >
              <Calendar size={12} color="#94A3B8" style={{ marginRight: 4 }} />
              <Text
                style={{ fontSize: 12, color: '#94A3B8', fontWeight: '600' }}
              >
                Join Date:{' '}
                {new Date(item.updatedAt).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </Text>
            </View>
          )}
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: colors.successLight }]}
        >
          <Text style={[styles.statusText, { color: colors.success }]}>
            Active
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerSection}>
        <SafeAreaView edges={['top', 'left', 'right']}>
          <View style={styles.topNav}>
            {!isStudentRole && (
              <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <ChevronLeft color="#FFFFFF" size={28} strokeWidth={2.5} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>
              {batchName || batchDetail?.name || 'Loading...'}
            </Text>
            <View style={{ flex: 1 }} />
            {!isStudentRole && (
              <TouchableOpacity
                onPress={handlePlusPress}
                style={styles.plusIconButton}
              >
                <Plus color="#FFFFFF" size={24} strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>
          {isStudentRole && userData && (
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 10,
                paddingBottom: 6,
              }}
            >
              <Text
                style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}
              >
                Welcome back, {userData.name}!
              </Text>
              <Text
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 13,
                  marginTop: 4,
                  fontWeight: '600',
                }}
              >
                Joined:{' '}
                {userData.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'N/A'}
              </Text>
            </View>
          )}
        </SafeAreaView>
      </View>

      {/* Create Subject Modal */}
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
                <Text style={styles.modalTitle}>Add New Subject</Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <X color="#94A3B8" size={22} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
              <View style={styles.modalBody}>
                <Input
                  label="Subject Name"
                  placeholder="e.g. Mathematics"
                  value={subjectName}
                  onChangeText={setSubjectName}
                  autoFocus
                  error={errors.name}
                />
              </View>
              <Button
                title="Create Subject"
                onPress={handleCreateSubject}
                disabled={subjectName.trim() === ''}
                style={styles.modalActionBtn}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Primary Assignment Modal */}
      <Modal
        visible={assignModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View
          style={[
            styles.modalOverlay,
            { justifyContent: 'flex-end', padding: 0 },
          ]}
        >
          <View
            style={[
              styles.modalContent,
              {
                height: '80%',
                padding: 0,
                paddingHorizontal: 0,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                { paddingHorizontal: 24, paddingTop: 24, marginBottom: 12 },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>Assign to Batch</Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: 13,
                    marginTop: 4,
                  }}
                >
                  Select unassigned students
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity
                  onPress={() => setStudentModalVisible(true)}
                  style={[
                    styles.plusIconButton,
                    {
                      marginRight: 16,
                      backgroundColor: colors.primaryLight,
                      borderRadius: 8,
                      padding: 8,
                    },
                  ]}
                >
                  <Plus color={colors.primary} size={20} strokeWidth={3} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setAssignModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <X color="#94A3B8" size={24} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            </View>

            {isLoadingAllStudents ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={{
                    marginTop: 12,
                    color: colors.textLight,
                    fontWeight: '600',
                  }}
                >
                  Fetching system users...
                </Text>
              </View>
            ) : availableStudentsToAssign.length === 0 ? (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: colors.textLight }}>
                  No unassigned students found in system.
                </Text>
              </View>
            ) : (
              <FlatList
                data={availableStudentsToAssign}
                renderItem={renderAvailableStudent}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingBottom: 20,
                }}
                keyExtractor={item => item._id}
                showsVerticalScrollIndicator={false}
              />
            )}

            <View
              style={{
                padding: 24,
                paddingBottom: Platform.OS === 'ios' ? 40 : 24,
                borderTopWidth: 1,
                borderColor: '#F1F5F9',
              }}
            >
              <Button
                title={
                  selectedStudentIds.length > 0
                    ? `Assign ${selectedStudentIds.length} Student(s)`
                    : 'Select Students'
                }
                onPress={handleAssignSelected}
                disabled={selectedStudentIds.length === 0}
                loading={isAssigning}
                style={styles.modalActionBtn}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Create Student Modal */}
      <Modal
        visible={studentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStudentModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { padding: 24 }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setStudentModalVisible(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardAvoidingView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create New Student</Text>
                <TouchableOpacity
                  onPress={() => setStudentModalVisible(false)}
                  style={styles.closeBtn}
                >
                  <X color="#94A3B8" size={22} strokeWidth={2.5} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    value={studentName}
                    onChangeText={setStudentName}
                  />
                  <Input
                    label="Email ID"
                    placeholder="john@example.com"
                    value={studentEmail}
                    onChangeText={setStudentEmail}
                    keyboardType="email-address"
                  />
                  <Input
                    label="Phone Number"
                    placeholder="+91 99999 00000"
                    value={studentPhone}
                    onChangeText={setStudentPhone}
                    keyboardType="phone-pad"
                  />
                  <Input
                    label="Permanent Address"
                    placeholder="Street, City, Pin"
                    value={studentAddress}
                    onChangeText={setStudentAddress}
                  />
                  <Input
                    label="Password"
                    placeholder="Default: 123456"
                    value={studentPassword}
                    onChangeText={setStudentPassword}
                    secureTextEntry={!showStudentPassword}
                    rightIcon={
                      <TouchableOpacity
                        onPress={() =>
                          setShowStudentPassword(!showStudentPassword)
                        }
                      >
                        {showStudentPassword ? (
                          <EyeOff size={20} color={colors.textMuted} />
                        ) : (
                          <Eye size={20} color={colors.textMuted} />
                        )}
                      </TouchableOpacity>
                    }
                  />
                </ScrollView>
              </View>

              <Button
                title="Register & Assign"
                onPress={handleCreateStudent}
                disabled={!studentName || !studentEmail}
                style={styles.modalActionBtn}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <View style={styles.content}>
        {!isStudentRole && (
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'Subjects' && styles.activeTab]}
              onPress={() => setActiveTab('Subjects')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'Subjects' && styles.activeTabText,
                ]}
              >
                Subjects
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'Students' && styles.activeTab]}
              onPress={() => setActiveTab('Students')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'Students' && styles.activeTabText,
                ]}
              >
                Students
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {isLoading && !isRefreshing ? (
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {activeTab === 'Subjects' && (
              <FlatList
                data={subjects}
                renderItem={renderSubject}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContainer}
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
            {activeTab === 'Students' && (
              <FlatList
                data={students.filter(s => s.role === 'student')}
                renderItem={renderStudent}
                keyExtractor={item => item._id}
                contentContainerStyle={styles.listContainer}
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
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerSection: {
    backgroundColor: colors.primary,
    paddingTop: spacing.s,
    paddingBottom: spacing.l,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    marginBottom: 4,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { ...typography.h2, color: '#FFFFFF', fontWeight: '800' },
  plusIconButton: { padding: 4 },
  content: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: 20 },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 16,
    marginVertical: 20,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 11 },
  activeTab: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  tabText: { fontSize: 14, fontWeight: '700', color: colors.textLight },
  activeTabText: { color: '#FFFFFF' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 40 },
  subjectCard: {
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subjectName: { fontSize: 17, fontWeight: '800', color: colors.text },
  topicText: {
    fontSize: 13,
    color: colors.textLight,
    fontWeight: '600',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metaBox: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, fontWeight: '700', color: colors.textLight },
  progressValue: { fontSize: 14, fontWeight: '800', color: colors.primary },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 8,
  },
  studentItemInline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentAvatarInline: {
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInitials: { color: '#3B82F6', fontWeight: '700', fontSize: 16 },
  studentName: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  studentRoll: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoidingView: { width: '100%', alignItems: 'center' },
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
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  closeBtn: { padding: 4 },
  modalBody: { marginBottom: 24, maxHeight: 400 },
  input: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
    marginBottom: 16,
  },
  modalActionBtn: { borderRadius: 16, height: 54 },
});
