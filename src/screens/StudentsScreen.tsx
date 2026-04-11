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
  ScrollView,
  Pressable,
  Keyboard,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Search,
  Plus,
  UserPlus,
  X,
  Phone,
  MapPin,
  ChevronDown,
  ChevronRight,
  Layers,
  Eye,
  EyeOff,
  Calendar,
} from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme/Theme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

import { studentService, User } from '../services/studentService';
import { batchService, Batch } from '../services/batchService';
import Toast from 'react-native-toast-message';

interface StudentsScreenProps {
  onNavigateStudent: (id: string) => void;
}

export const StudentsScreen: React.FC<StudentsScreenProps> = ({
  onNavigateStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [students, setStudents] = useState<User[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isBatchPickerVisible, setBatchPickerVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});



  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [stuData, batchData] = await Promise.all([
        studentService.getAll(),
        batchService.getAll(),
      ]);
      setStudents(stuData);
      setBatches(batchData);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load student data.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchInitialData();
  };

  const studentSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    batchId: z.string().optional(),
  });

  const validate = () => {
    try {
      setErrors({});
      studentSchema.parse({
        name,
        email,
        password,
        phone,
        address,
        batchId: selectedBatch?._id,
      });
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        err.issues.forEach(e => {
          if (e.path[0]) {
            formattedErrors[e.path[0].toString()] = e.message;
            console.log(
              `[StudentsScreen] Validation failed for field "${e.path[0]}":`,
              e.message,
            );
          }
        });
        setErrors(formattedErrors);
      }
      return false;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Active':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'Fee Due':
        return { bg: '#FEF3C7', text: '#D97706' };
      case 'Inactive':
        return { bg: '#FEE2E2', text: '#DC2626' };
      default:
        return { bg: '#F1F5F9', text: '#64748B' };
    }
  };

  const handleAddStudent = async () => {
    if (!validate()) {
      console.log('[StudentsScreen] Validation failed');
      return;
    }
    setIsLoading(true);
    try {
      const studentData = {
        name,
        email,
        password,
        phone,
        address,
        batchId: selectedBatch?._id,
      };
      console.log('[StudentsScreen] Creating student with data:', studentData);

      await studentService.create(studentData);

      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Student added successfully!',
      });
      setModalVisible(false);
      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setAddress('');
      setPhone('');
      setSelectedBatch(null);
      fetchInitialData();
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

  const renderStudent = ({ item }: { item: User }) => {
    const avatarBg = '#EEF2FF';
    const avatarColor = '#0F172A';

    let batchName = 'Unassigned';
    let batchType = '';

    if (typeof item.batchId === 'object' && item.batchId) {
      batchName = item.batchId.name || 'Unassigned';
      batchType = item.batchId.type || '';
    } else {
      const bOption = batches.find(b => b._id === item.batchId);
      if (bOption) {
        batchName = bOption.name;
        batchType = bOption.type;
      }
    }

    if (batchType && batchName !== 'Unassigned') {
      batchName = `${batchName} (${
        batchType.charAt(0).toUpperCase() + batchType.slice(1)
      })`;
    }

    return (
      <TouchableOpacity
        style={styles.studentItem}
        activeOpacity={0.7}
        onPress={() => onNavigateStudent(item._id)}
      >
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={[styles.avatarText, { color: avatarColor }]}>
            {getInitials(item.name)}
          </Text>
        </View>
        190:
        <View style={styles.info}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.subtitle}>{batchName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: '#ECFDF5' }]}>
          <Text style={[styles.statusText, { color: '#059669' }]}>Active</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right', 'top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.h1, styles.title]}>Students</Text>
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => setModalVisible(true)}
            activeOpacity={0.8}
          >
            <Plus color="#FFF" size={24} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search
            color="#64748B"
            size={18}
            strokeWidth={2.5}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search student by name..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {isLoading && students.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={students.filter(
              s =>
                s.role === 'student' &&
                s.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )}
            keyExtractor={item => item._id}
            renderItem={renderStudent}
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

        {/* Add Student Modal */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setModalVisible(false)}
            />
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardView}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleRow}>
                    <View style={styles.modalIconBox}>
                      <UserPlus color={colors.primary} size={20} />
                    </View>
                    <Text style={typography.h2}>Add New Student</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeBtn}
                  >
                    <X color="#94A3B8" size={20} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={styles.modalBody}
                >
                  <Input
                    label="Full Name"
                    placeholder="e.g. Rahul Verma"
                    value={name}
                    onChangeText={setName}
                    error={errors.name}
                  />

                  <Input
                    label="Email Address"
                    placeholder="rahul@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    error={errors.email}
                  />

                  <Input
                    label="Password"
                    placeholder="Enter min 6 characters"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={20} color={colors.textMuted} />
                        ) : (
                          <Eye size={20} color={colors.textMuted} />
                        )}
                      </TouchableOpacity>
                    }
                    error={errors.password}
                  />

                  <Input
                    label="Phone Number"
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    icon={<Phone size={18} color={colors.textMuted} />}
                    error={errors.phone}
                  />

                  <Input
                    label="Address"
                    placeholder="Enter permanent address"
                    value={address}
                    onChangeText={setAddress}
                    icon={<MapPin size={18} color={colors.textMuted} />}
                    error={errors.address}
                  />

                  <Text style={styles.fieldLabel}>Assign Batch (Optional)</Text>
                  <TouchableOpacity
                    style={styles.batchSelector}
                    onPress={() => setBatchPickerVisible(true)}
                  >
                    <View style={styles.batchSelectorInner}>
                      <Layers size={18} color={colors.primary} />
                      <Text
                        style={[
                          styles.batchSelectorText,
                          selectedBatch && {
                            color: colors.text,
                          },
                        ]}
                      >
                        {selectedBatch
                          ? `${selectedBatch.name} ${
                              selectedBatch.type
                                ? '(' +
                                  selectedBatch.type.charAt(0).toUpperCase() +
                                  selectedBatch.type.slice(1) +
                                  ')'
                                : ''
                            }`
                          : 'Unassigned'}
                      </Text>
                    </View>
                    <ChevronDown size={20} color={colors.textMuted} />
                  </TouchableOpacity>


                </ScrollView>

                <Button
                  title="Register Student"
                  onPress={handleAddStudent}
                  loading={isLoading}
                  style={styles.submitBtn}
                />
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>

        {/* Batch Picker Modal */}
        <Modal
          visible={isBatchPickerVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setBatchPickerVisible(false)}
        >
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Batch</Text>
                <TouchableOpacity onPress={() => setBatchPickerVisible(false)}>
                  <X color={colors.textMuted} size={24} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => {
                    setSelectedBatch(null);
                    setBatchPickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      !selectedBatch && styles.selectedItemText,
                    ]}
                  >
                    Unassigned
                  </Text>
                </TouchableOpacity>
                {batches.map(batch => (
                  <TouchableOpacity
                    key={batch._id}
                    style={styles.pickerItem}
                    onPress={() => {
                      setSelectedBatch(batch);
                      setBatchPickerVisible(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.pickerItemText,
                        selectedBatch?._id === batch._id &&
                          styles.selectedItemText,
                      ]}
                    >
                      {batch.name}{' '}
                      {batch.type
                        ? `(${
                            batch.type.charAt(0).toUpperCase() +
                            batch.type.slice(1)
                          })`
                        : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>


      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFFFFF' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    marginBottom: 8,
  },
  title: { marginBottom: 0 },
  plusButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    marginHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchIcon: { marginRight: 12 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '500',
    height: '100%',
  },
  listContent: { paddingBottom: 100 },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: { fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  info: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 17, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  subtitle: { fontSize: 14, fontWeight: '600', color: '#94A3B8' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '800' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
  keyboardView: { width: '100%' },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: { padding: 6, backgroundColor: '#F8FAFC', borderRadius: 12 },
  modalBody: { maxHeight: 400, marginBottom: 20 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    marginTop: 4,
  },
  batchSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  batchSelectorInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  batchSelectorText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMuted,
  },
  submitBtn: { width: '100%' },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  pickerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  pickerItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  pickerItemText: { fontSize: 16, fontWeight: '600', color: colors.textLight },
  selectedItemText: { color: colors.primary, fontWeight: '800' },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
    marginTop: -12,
    marginBottom: 16,
    marginLeft: 4,
  },
  calendarWrapper: { padding: 16, maxHeight: 400 },
  monthYearSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  monthYearText: { fontSize: 18, fontWeight: '800', color: colors.text },
  yearDropdownTrigger: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayHeaderText: {
    width: (Dimensions.get('window').width - 80) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  calendarDay: {
    width: (Dimensions.get('window').width - 80) / 7,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderRadius: 12,
  },
  emptyDay: { backgroundColor: 'transparent' },
  selectedDay: { backgroundColor: colors.primary },
  calendarDayText: { fontSize: 15, fontWeight: '600', color: colors.text },
  emptyDayText: { color: 'transparent' },
  selectedDayText: { color: '#FFF', fontWeight: '800' },
  todayText: { color: colors.primary, fontWeight: '800' },
  yearSelectorContainer: { padding: 8 },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  yearItem: {
    width: (Dimensions.get('window').width - 120) / 3,
    paddingVertical: 12,
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
  yearItemText: { fontSize: 16, fontWeight: '700', color: colors.text },
  selectedYearText: { color: '#FFF' },
});
