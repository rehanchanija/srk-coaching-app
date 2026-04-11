import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Shield, Lock, Eye, Download } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme/Theme';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

const policySections = [
  {
    title: 'Data Collection',
    content: 'We collect relevant coaching and student information to provide an efficient management experience. This includes student names, batch schedules, and attendance records.',
    icon: Eye
  },
  {
    title: 'Data Protection',
    content: 'Your data is encrypted and stored securely. We use industry-standard security protocols (TLS/SSL) to protect sensitive information during transit into our cloud partners.',
    icon: Lock
  },
  {
    title: 'User Sovereignty',
    content: 'You retain full ownership of your data. You can delete or modify any administrative record at any time without prior notice or platform intervention.',
    icon: Shield
  }
];

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                <ChevronLeft color={colors.text} size={28} strokeWidth={2.5} />
            </TouchableOpacity>
            <Text style={typography.h1}>Privacy Policy</Text>
        </View>

        <View style={styles.topInfo}>
            <View style={styles.shieldBox}>
                <Shield color={colors.primary} size={48} strokeWidth={2} />
            </View>
            <Text style={styles.topTitle}>Your Privacy Matters</Text>
            <Text style={styles.topSub}>Last Updated: March 2026</Text>
        </View>

        {policySections.map((section, index) => (
            <View key={index} style={styles.policyRow}>
                <View style={[styles.policyIconBox, { backgroundColor: colors.primaryLight }]}>
                    {React.createElement(section.icon, { size: 24, color: colors.primary, strokeWidth: 2.5 })}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.policyTitle}>{section.title}</Text>
                    <Text style={styles.policyText}>{section.content}</Text>
                </View>
            </View>
        ))}

        <View style={styles.divider} />

        <TouchableOpacity style={styles.downloadCard} activeOpacity={0.8}>
            <Download color={colors.primary} size={24} strokeWidth={2.5} />
            <Text style={styles.downloadText}>Download Full PDF</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 16, marginBottom: 24 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  topInfo: { alignItems: 'center', marginBottom: 40, marginTop: 12 },
  shieldBox: { padding: 24, borderRadius: 40, backgroundColor: colors.primaryLight, marginBottom: 20 },
  topTitle: { fontSize: 24, fontWeight: '900', color: colors.text },
  topSub: { fontSize: 13, color: colors.textMuted, marginTop: 6, fontWeight: '700' },
  policyRow: { flexDirection: 'row', gap: 20, marginBottom: 32 },
  policyIconBox: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  policyTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 8 },
  policyText: { fontSize: 14, color: colors.textLight, lineHeight: 22, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 24 },
  downloadCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 16, borderRadius: 16, backgroundColor: '#FFF', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  downloadText: { fontSize: 16, fontWeight: '800', color: colors.primary },
});
