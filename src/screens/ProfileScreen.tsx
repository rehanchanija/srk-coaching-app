import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LogOut,
  User,
  Phone,
  Mail,
  Shield,
  HelpCircle,
  ChevronRight,
  Edit2,
  X,
  MapPin,
  Lock,
} from 'lucide-react-native';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { colors, radius, spacing, typography } from '../theme/Theme';
import { studentService } from '../services/studentService';
import Toast from 'react-native-toast-message';

interface ProfileScreenProps {
  onLogout: () => void;
  onNavigateSupport: () => void;
  onNavigatePrivacy: () => void;
  userData?: any;
  onUpdateProfile?: (updated: any) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onLogout,
  onNavigateSupport,
  onNavigatePrivacy,
  userData,
  onUpdateProfile,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modals visibility
  const [isNameModalVisible, setIsNameModalVisible] = useState(false);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  
  // Values for update
  const [editName, setEditName] = useState(userData?.name || '');
  const [editPhone, setEditPhone] = useState(userData?.phone || '');
  const [editAddress, setEditAddress] = useState(userData?.address || '');
  const [newPassword, setNewPassword] = useState('');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  React.useEffect(() => {
    if (userData) {
      setEditName(userData.name || '');
      setEditPhone(userData.phone || '');
      setEditAddress(userData.address || '');
    }
  }, [userData]);

  const isStudent = userData?.role === 'student';
  const isAdmin = userData?.role === 'admin';

  const handleUpdateField = async (field: 'name' | 'address' | 'password' | 'phone') => {
    const payload: any = {};
    
    if (field === 'name') {
      if (!editName.trim()) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Name cannot be empty' });
        return;
      }
      payload.name = editName;
    } else if (field === 'phone') {
      if (!editPhone.trim()) {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Phone cannot be empty' });
        return;
      }
      payload.phone = editPhone;
    } else if (field === 'address') {
      payload.address = editAddress;
    } else if (field === 'password') {
      if (newPassword.length < 6) {
        Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Password must be at least 6 characters' });
        return;
      }
      payload.password = newPassword;
    }

    setIsUpdating(true);
    try {
      const targetId = userData?._id || userData?.id;
      const updated = await studentService.update(targetId, payload);
      if (onUpdateProfile) onUpdateProfile(updated);
      
      Toast.show({ type: 'success', text1: 'Success', text2: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully!` });
      
      // Close all modals
      setIsNameModalVisible(false);
      setIsAddressModalVisible(false);
      setIsPhoneModalVisible(false);
      setIsPasswordModalVisible(false);
      setNewPassword('');
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err?.message || 'Update failed' });
    } finally {
      setIsUpdating(false);
    }
  };

  const renderOption = (
    icon: any,
    label: string,
    color: string,
    onPress?: () => void,
  ) => (
    <TouchableOpacity style={styles.optionRow} onPress={onPress}>
      <View style={[styles.optionIconBox, { backgroundColor: color + '15' }]}>
        {React.createElement(icon, {
          size: 20,
          color: color,
          strokeWidth: 2.5,
        })}
      </View>
      <Text style={styles.optionLabel}>{label}</Text>
      <ChevronRight size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.header}>
          <Text style={typography.h1}>{isStudent ? 'User Profile' : 'Admin Profile'}</Text>
        </View>

        {/* Profile Summary Card */}
        <Card style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.avatar}>
              <User color={colors.white} size={32} strokeWidth={2.5} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.miniLabel}>FULL NAME</Text>
                <TouchableOpacity onPress={() => setIsNameModalVisible(true)}>
                  <Edit2 size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.mainNameText}>{userData?.name || '---'}</Text>
              
              <Text style={styles.miniLabel}>JOINED DATE</Text>
              <Text style={styles.subText}>
                {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-GB') : '---'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Contact Details Card */}
        <Text style={styles.sectionLabel}>Contact & Security</Text>
        <Card variant="outline" style={styles.fullCard}>
          {/* Phone Number (Read-only) */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Phone size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.infoSmallLabel}>PHONE NUMBER {isAdmin ? '' : '(PRIVATE)'}</Text>
                {isAdmin && (
                  <TouchableOpacity onPress={() => setIsPhoneModalVisible(true)}>
                    <Edit2 size={14} color={colors.primary} />
                  </TouchableOpacity>
                )}
                {!isAdmin && <Lock size={10} color={colors.textMuted} />}
              </View>
              <Text style={styles.infoMainText}>{userData?.phone || 'Not linked'}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          {/* Address */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <MapPin size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.infoSmallLabel}>PERMANENT ADDRESS</Text>
                <TouchableOpacity onPress={() => setIsAddressModalVisible(true)}>
                  <Edit2 size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.infoMainText}>{userData?.address || 'Click to add address'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Password Section */}
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Shield size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.infoSmallLabel}>SECURITY & PASSWORD</Text>
                <TouchableOpacity onPress={() => setIsPasswordModalVisible(true)}>
                  <Edit2 size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={styles.infoMainText}>••••••••</Text>
            </View>
          </View>
        </Card>

        {/* Settings/Support Options */}
        <Text style={styles.sectionLabel}>Preferences</Text>
        <Card variant="outline" style={styles.fullCard}>
          {renderOption(HelpCircle, 'Contact Support', colors.primary, onNavigateSupport)}
          {renderOption(Shield, 'Privacy & Policy', colors.accent, onNavigatePrivacy)}
          <View style={styles.divider} />
          <TouchableOpacity style={styles.optionRow} onPress={onLogout}>
            <View style={[styles.optionIconBox, { backgroundColor: colors.danger + '15' }]}>
              <LogOut size={20} color={colors.danger} strokeWidth={2.5} />
            </View>
            <Text style={[styles.optionLabel, { color: colors.danger }]}>Sign Out</Text>
          </TouchableOpacity>
        </Card>

        {/* MODALS */}
        
        {/* Update Name Modal */}
        <UpdateModal 
          visible={isNameModalVisible} 
          title="Update Name" 
          value={editName}
          onClose={() => setIsNameModalVisible(false)}
          onChangeText={setEditName}
          onSave={() => handleUpdateField('name')}
          loading={isUpdating}
        />

        {/* Update Address Modal */}
        <UpdateModal 
          visible={isAddressModalVisible} 
          title="Update Address" 
          value={editAddress}
          onClose={() => setIsAddressModalVisible(false)}
          onChangeText={setEditAddress}
          onSave={() => handleUpdateField('address')}
          loading={isUpdating}
          multiline
        />

        {/* Update Phone Modal */}
        <UpdateModal 
          visible={isPhoneModalVisible} 
          title="Update Phone" 
          value={editPhone}
          onClose={() => setIsPhoneModalVisible(false)}
          onChangeText={setEditPhone}
          onSave={() => handleUpdateField('phone')}
          loading={isUpdating}
          keyboardType="phone-pad"
        />

        {/* Update Password Modal */}
        <Modal visible={isPasswordModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
             <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
               <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>Change Password</Text>
                 <TouchableOpacity onPress={() => setIsPasswordModalVisible(false)}>
                   <X size={24} color={colors.textMuted} />
                 </TouchableOpacity>
               </View>
               <Input 
                 label="New Password" 
                 placeholder="Enter new password"
                 value={newPassword}
                 onChangeText={setNewPassword}
                 secureTextEntry={!showPassword}
                 rightIcon={
                   <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                     <Shield size={20} color={colors.textMuted} />
                   </TouchableOpacity>
                 }
               />
               <Button 
                title="Update Password" 
                onPress={() => handleUpdateField('password')} 
                loading={isUpdating}
                style={{ marginTop: 16 }}
               />
             </KeyboardAvoidingView>
          </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
};

// Reusable Small Update Modal
const UpdateModal = ({ visible, title, value, onClose, onChangeText, onSave, loading, multiline, keyboardType }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <X size={24} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
        <Input 
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter your ${title.split(' ')[1].toLowerCase()}`}
          multiline={multiline}
          keyboardType={keyboardType || 'default'}
          autoFocus
        />
        <Button title={`Save ${title.split(' ')[1]}`} onPress={onSave} loading={loading} style={{ marginTop: 16 }}/>
      </KeyboardAvoidingView>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: spacing.l, paddingBottom: 100 },
  header: { marginTop: spacing.m, marginBottom: spacing.l },
  profileCard: { padding: 20 },
  profileTopRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 70, height: 70, borderRadius: 24, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  miniLabel: { fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 1 },
  mainNameText: { fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: 8 },
  subText: { fontSize: 14, fontWeight: '700', color: colors.textLight },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: colors.textMuted, marginTop: spacing.l, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  fullCard: { padding: 4 },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  iconCircle: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  lockedLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoSmallLabel: { fontSize: 10, fontWeight: '800', color: colors.textMuted, letterSpacing: 0.5 },
  infoMainText: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 16 },
  optionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 16 },
  optionIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  optionLabel: { flex: 1, fontSize: 15, fontWeight: '700', color: colors.text },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', padding: 24 },
  modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
});
