import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Phone,
  Mail,
  User as UserIcon,
  MapPin,
  Calendar,
  CreditCard,
  Edit2,
  X,
  Layers,
  ChevronDown,
  ChevronRight,
  Shield,
} from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme/Theme';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { studentService, User } from '../services/studentService';
import { batchService, Batch } from '../services/batchService';
import feesService, { Fee } from '../services/feesService';
import Toast from 'react-native-toast-message';
import { Plus } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface StudentDetailScreenProps {
  studentId: string;
  onBack: () => void;
}

export const StudentDetailScreen: React.FC<StudentDetailScreenProps> = ({
  onBack,
  studentId,
}) => {
  const [student, setStudent] = useState<User | null>(null);
  const [batchName, setBatchName] = useState<string>('Unassigned');
  const [loading, setLoading] = useState(true);

  // Edit Modals State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isBatchPickerVisible, setBatchPickerVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBatch, setEditBatch] = useState<Batch | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fees State
  const [fees, setFees] = useState<Fee[]>([]);
  const [isFeeModalVisible, setIsFeeModalVisible] = useState(false);
  const [feeLoading, setFeeLoading] = useState(false);
  const [targetMonth, setTargetMonth] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetStatus, setTargetStatus] = useState<'paid' | 'unpaid'>('paid');



  useEffect(() => {
    fetchStudentDetail();
    fetchFees();
  }, [studentId]);

  const fetchFees = async () => {
    try {
      const data = await feesService.getStudentFees(studentId);
      setFees(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudentDetail = async () => {
    setLoading(true);
    try {
      const studentData = await studentService.getById(studentId);
      setStudent(studentData);

      let bName = 'Unassigned';
      if (studentData.batchId) {
        if (
          typeof studentData.batchId === 'object' &&
          studentData.batchId.name
        ) {
          bName = studentData.batchId.name;
        } else if (typeof studentData.batchId === 'string') {
          try {
            const batchData = await batchService.findById(studentData.batchId);
            bName = batchData.name;
          } catch (e) {
            // ignore
          }
        }
      }
      setBatchName(bName);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load student details.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!student) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Text style={{ fontSize: 16, color: colors.textMuted }}>
          Student not found.
        </Text>
        <TouchableOpacity onPress={onBack} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleOpenEdit = async () => {
    setEditName(student?.name || '');
    setEditPhone(student?.phone || '');
    setEditAddress(student?.address || '');
    setErrors({});

    try {
      const b = await batchService.getAll();
      setBatches(b);
      let currentBatchId: string | null = null;
      if (student?.batchId) {
        currentBatchId =
          typeof student.batchId === 'object'
            ? student.batchId._id
            : student.batchId;
        const cb = b.find(x => x._id === currentBatchId);
        if (cb) setEditBatch(cb);
        else setEditBatch(null);
      } else {
        setEditBatch(null);
      }
    } catch (e) {}

    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editName) {
      setErrors({ name: 'Name is required' });
      return;
    }
    setIsSaving(true);
    try {
      const updatePayload: any = {
        name: editName,
        phone: editPhone,
        address: editAddress,
        batchId: editBatch?._id || null,
      };

      if (editPassword.trim()) {
        updatePayload.password = editPassword;
      }

      await studentService.update(studentId, updatePayload);
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Student updated successfully!',
      });
      setIsEditModalVisible(false);
      setEditPassword('');
      fetchStudentDetail();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update student.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenFeeModal = () => {
    const now = new Date();
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setTargetMonth(monthStr);
    setTargetAmount('');
    setTargetStatus('paid');
    setIsFeeModalVisible(true);
  };

  const handleSaveFee = async () => {
    if (!targetMonth || !targetAmount) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter month and amount',
      });
      return;
    }

    setFeeLoading(true);
    try {
      await feesService.createOrUpdateFee({
        studentId,
        month: targetMonth,
        amount: Number(targetAmount),
        status: targetStatus,
      });
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Fee record saved',
      });
      setIsFeeModalVisible(false);
      fetchFees();
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to save fee record',
      });
    } finally {
      setFeeLoading(false);
    }
  };

  const initials =
    (student?.name || '')
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'ST';

  return (
    <View style={styles.container}>
      <View style={styles.topBanner}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <ChevronLeft color="#FFF" size={28} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Student Profile</Text>
            <TouchableOpacity
              onPress={handleOpenEdit}
              style={styles.backButton}
            >
              <Edit2 color="#FFF" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSummary}>
            <View style={styles.avatarGlow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            <Text style={styles.name}>{student.name}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.pillBadge}>
                <Text style={styles.pillText}>{batchName}</Text>
              </View>
              <View
                style={[
                  styles.pillBadge,
                  { backgroundColor: colors.secondaryLight },
                ]}
              >
                <Text style={[styles.pillText, { color: colors.secondary }]}>
                  Active
                </Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View style={styles.statsGrid}>
          <Card style={styles.infoCard}>
            <Calendar color={colors.primary} size={20} />
            <Text style={styles.cardValue}>
              {student.createdAt
                ? new Date(student.createdAt).toLocaleDateString('en-GB')
                : 'N/A'}
            </Text>
            <Text style={styles.cardLabel}>User Created</Text>
          </Card>
          <Card style={styles.infoCard}>
            <Layers color={colors.secondary} size={20} />
            <Text style={styles.cardValue}>
              {student.joinBatchDate
                ? new Date(student.joinBatchDate).toLocaleDateString('en-GB')
                : 'N/A'}
            </Text>
            <Text style={styles.cardLabel}>Batch Joined</Text>
          </Card>
          <Card style={styles.infoCard}>
            <CreditCard color={colors.accent} size={20} />
            <Text style={styles.cardValue}>
              ₹{fees.filter(f => f.status === 'unpaid').reduce((acc, curr) => acc + curr.amount, 0)}
            </Text>
            <Text style={styles.cardLabel}>Fee Due</Text>
          </Card>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Fees History</Text>
          <TouchableOpacity onPress={handleOpenFeeModal} style={styles.addFeeMiniBtn}>
            <Plus size={16} color={colors.primary} />
            <Text style={styles.addFeeMiniText}>Add Fee</Text>
          </TouchableOpacity>
        </View>

        {fees.length === 0 ? (
          <Card variant="outline" style={styles.emptyCard}>
            <Text style={styles.emptyText}>No fee records found</Text>
          </Card>
        ) : (
          fees.map((fee) => (
            <Card key={fee._id} variant="outline" style={styles.feeListItem}>
              <View style={styles.feeListContent}>
                <View>
                  <Text style={styles.feeMonthText}>
                    {new Date(fee.month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </Text>
                  <Text style={styles.feeAmountText}>₹{fee.amount}</Text>
                </View>
                <View style={styles.feeStatusColumn}>
                  <View style={[
                    styles.statusPill,
                    { backgroundColor: fee.status === 'paid' ? colors.successLight : colors.warningLight }
                  ]}>
                    <Text style={[
                      styles.statusPillText,
                      { color: fee.status === 'paid' ? colors.success : colors.warning }
                    ]}>
                      {fee.status.toUpperCase()}
                    </Text>
                  </View>
                  {fee.paidAt && (
                    <Text style={styles.paidAtText}>
                      {new Date(fee.paidAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          ))
        )}

        <Text style={styles.sectionTitle}>Contact Details</Text>
        <Card variant="outline">
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Phone size={18} color={colors.textLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Primary Phone</Text>
              <Text style={styles.rowValue}>
                {student.phone || 'Not provided'}
              </Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Mail size={18} color={colors.textLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Email Address</Text>
              <Text style={styles.rowValue}>{student.email}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Shield size={18} color={colors.textLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Account Password</Text>
              <Text style={styles.rowValue}>••••••••</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.sectionTitle}>Address</Text>
        <Card variant="outline">
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MapPin size={18} color={colors.textLight} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Permanent Address</Text>
              <Text style={styles.rowValue}>
                {student.address || 'Not provided'}
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>

      {/* Edit Student Modal */}
      <Modal
        visible={isEditModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsEditModalVisible(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <View style={styles.modalIconBox}>
                    <Edit2 color={colors.primary} size={20} />
                  </View>
                  <Text style={typography.h2}>Edit Student</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsEditModalVisible(false)}
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
                  value={editName}
                  onChangeText={setEditName}
                  error={errors.name}
                />

                <Input
                  label="Email Address"
                  placeholder="rahul@example.com"
                  value={student?.email || ''}
                  onChangeText={() => {}}
                  editable={false}
                  autoCapitalize="none"
                  style={{ backgroundColor: '#F8FAFC', color: '#94A3B8' }}
                />

                <Input
                  label="Phone Number"
                  placeholder="e.g. +91 9876543210"
                  value={editPhone}
                  onChangeText={setEditPhone}
                  keyboardType="phone-pad"
                  icon={<Phone size={18} color={colors.textMuted} />}
                />

                <Input
                  label="Address"
                  placeholder="Enter permanent address"
                  value={editAddress}
                  onChangeText={setEditAddress}
                  icon={<MapPin size={18} color={colors.textMuted} />}
                />

                <Input
                  label="Reset Password"
                  placeholder="Enter new password to reset"
                  value={editPassword}
                  onChangeText={setEditPassword}
                  secureTextEntry={!showPassword}
                  rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <X size={20} color={colors.textMuted} />
                      ) : (
                        <Shield size={20} color={colors.textMuted} />
                      )}
                    </TouchableOpacity>
                  }
                  icon={<Shield size={18} color={colors.textMuted} />}
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
                        editBatch && {
                          color: colors.text,
                        },
                      ]}
                    >
                      {editBatch ? `${editBatch.name} ${editBatch.type ? '(' + editBatch.type.charAt(0).toUpperCase() + editBatch.type.slice(1) + ')' : ''}` : 'Unassigned'}
                    </Text>
                  </View>
                  <ChevronDown size={20} color={colors.textMuted} />
                </TouchableOpacity>


              </ScrollView>

              <Button
                title="Save Changes"
                onPress={handleSaveEdit}
                loading={isSaving}
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
                  setEditBatch(null);
                  setBatchPickerVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    !editBatch && styles.selectedItemText,
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
                    setEditBatch(batch);
                    setBatchPickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      editBatch?._id === batch._id && styles.selectedItemText,
                    ]}
                  >
                    {batch.name} {batch.type ? `(${batch.type.charAt(0).toUpperCase() + batch.type.slice(1)})` : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Fee Management Modal */}
      <Modal
        visible={isFeeModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsFeeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsFeeModalVisible(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleRow}>
                  <View style={styles.modalIconBox}>
                    <CreditCard color={colors.primary} size={20} />
                  </View>
                  <Text style={typography.h2}>Manage Fee</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsFeeModalVisible(false)}
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
                  label="Month (YYYY-MM)"
                  placeholder="e.g. 2024-05"
                  value={targetMonth}
                  onChangeText={setTargetMonth}
                  icon={<Calendar size={18} color={colors.textMuted} />}
                />

                <Input
                  label="Amount (₹)"
                  placeholder="e.g. 500"
                  value={targetAmount}
                  onChangeText={setTargetAmount}
                  keyboardType="numeric"
                  icon={<CreditCard size={18} color={colors.textMuted} />}
                />

                <Text style={styles.fieldLabel}>Payment Status</Text>
                <View style={styles.statusToggleContainer}>
                  <TouchableOpacity
                    style={[
                      styles.statusToggleBtn,
                      targetStatus === 'paid' && { backgroundColor: colors.successLight, borderColor: colors.success }
                    ]}
                    onPress={() => setTargetStatus('paid')}
                  >
                    <Text style={[
                      styles.statusToggleText,
                      targetStatus === 'paid' && { color: colors.success }
                    ]}>PAID</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusToggleBtn,
                      targetStatus === 'unpaid' && { backgroundColor: colors.warningLight, borderColor: colors.warning }
                    ]}
                    onPress={() => setTargetStatus('unpaid')}
                  >
                    <Text style={[
                      styles.statusToggleText,
                      targetStatus === 'unpaid' && { color: colors.warning }
                    ]}>UNPAID</Text>
                  </TouchableOpacity>
                </View>

                {/* Suggestions */}
                <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Quick Suggestions</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
                  <TouchableOpacity 
                    style={styles.suggestionPill}
                    onPress={() => setTargetAmount('500')}
                  >
                    <Text style={styles.suggestionText}>₹500</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.suggestionPill}
                    onPress={() => setTargetAmount('1000')}
                  >
                    <Text style={styles.suggestionText}>₹1000</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.suggestionPill}
                    onPress={() => setTargetAmount('1500')}
                  >
                    <Text style={styles.suggestionText}>₹1500</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.suggestionPill}
                    onPress={() => {
                        const d = new Date();
                        setTargetMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
                    }}
                  >
                    <Text style={styles.suggestionText}>This Month</Text>
                  </TouchableOpacity>
                </ScrollView>
              </ScrollView>

              <Button
                title="Save Fee Record"
                onPress={handleSaveFee}
                loading={feeLoading}
                style={styles.submitBtn}
              />
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>


    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBanner: {
    backgroundColor: colors.primary,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  profileSummary: { alignItems: 'center', marginTop: 20 },
  avatarGlow: {
    padding: 4,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: colors.primary },
  name: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFF',
    marginTop: 16,
    letterSpacing: -0.5,
  },
  badgeRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  pillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  pillText: { fontSize: 13, fontWeight: '700', color: '#FFF' },
  content: { flex: 1, paddingHorizontal: 24, marginTop: -30 },
  statsGrid: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  infoCard: { flex: 1, padding: 20, alignItems: 'flex-start' },
  cardValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.text,
    marginTop: 12,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 4 },
  backButton: { padding: 4 },
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
    width: (width - 80) / 7,
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
    width: (width - 80) / 7,
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
    width: (width - 120) / 3,
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 16,
  },
  addFeeMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addFeeMiniText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  feeListItem: {
    marginBottom: 12,
    padding: 16,
  },
  feeListContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feeMonthText: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  feeAmountText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textLight,
    marginTop: 2,
  },
  feeStatusColumn: {
    alignItems: 'flex-end',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  paidAtText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    fontWeight: '600',
  },
  statusToggleContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  statusToggleBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  statusToggleText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textMuted,
  },
  suggestionPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textLight,
  },
});
