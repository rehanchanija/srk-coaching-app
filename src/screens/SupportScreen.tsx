import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  LayoutAnimation,
  Platform,
  UIManager,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Mail,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  ShieldCheck,
  Globe,
} from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme/Theme';
import { Card } from '../components/Card';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SupportScreenProps {
  onBack: () => void;
  onNavigateChat: () => void;
}

const faqs = [
  {
    q: 'How to add a new batch?',
    a: 'Navigate to the Batches tab from the bottom navigation bar and tap the floating "+" icon at the top right. Fill in the batch name, timing, and dates to create it.',
  },
  {
    q: 'Can I change coaching name?',
    a: 'Yes, go to your Profile tab and tap on the "Edit Profile" button on the card. You can then update your coaching center name and other details.',
  },
  {
    q: 'How to communicate with students?',
    a: 'Use the new "Chat" tab in the bottom navigation. You can see a list of all your batches and open group chats for each one to send announcements.',
  },
  {
    q: 'What is the attendance journey?',
    a: 'The attendance journey automatically starts when you view current attendance and automatically closes at 8:00 PM every day to ensure clean records.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. We use industry-standard encryption to protect your data and the privacy of your students. Please review our Privacy Policy for more info.',
  },
];

export const SupportScreen: React.FC<SupportScreenProps> = ({
  onBack,
  onNavigateChat,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleEmail = () => {
    Linking.openURL('mailto:rehanchanija@gmail.com');
  };

  const toggleAccordion = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <ChevronLeft color={colors.text} size={28} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={typography.h1}>Help & Support</Text>
        </View>

        {/* Live Chat Action */}
        <Card style={styles.chatCard} onPress={onNavigateChat}>
          <MessageSquare color="#FFF" size={24} strokeWidth={2.5} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.chatTitle}>Live Chat Support</Text>
            <Text style={styles.chatSub}>Instant help from our experts</Text>
          </View>
          <View style={styles.chatStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Live</Text>
          </View>
        </Card>

        <Text style={styles.sectionLabel}>Direct Support</Text>
        <Card variant="outline" style={styles.emailCard}>
          <View style={styles.iconCircle}>
            <Mail color={colors.primary} size={24} />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.emailTitle}>Email Support</Text>
            <Text style={styles.emailAddress}>rehanchanija@gmail.com</Text>
          </View>
          <TouchableOpacity
            onPress={handleEmail}
            style={styles.emailActionBtn}
            activeOpacity={0.7}
          >
            <ExternalLink size={18} color={colors.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </Card>

        <Text style={styles.sectionLabel}>Frequently Asked Questions</Text>
        {faqs.map((faq, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => toggleAccordion(index)}
            >
              <Card
                variant="outline"
                style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqTitle, isExpanded && styles.faqTitleActive]}>
                    {faq.q}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp size={20} color={colors.primary} strokeWidth={2.5} />
                  ) : (
                    <ChevronDown size={20} color={colors.textMuted} strokeWidth={2.5} />
                  )}
                </View>
                {isExpanded && <Text style={styles.faqAnswer}>{faq.a}</Text>}
              </Card>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.sectionLabel}>App Information</Text>
        <Card variant="outline" style={styles.infoCard}>
          <View style={styles.infoRow}>
             <Info size={18} color={colors.primary} />
             <Text style={styles.infoKey}>Version</Text>
             <Text style={styles.infoValue}>2.4.1 (Stable)</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
             <ShieldCheck size={18} color={colors.primary} />
             <Text style={styles.infoKey}>Environment</Text>
             <Text style={styles.infoValue}>Production</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
             <Globe size={18} color={colors.primary} />
             <Text style={styles.infoKey}>Developer</Text>
             <Text style={styles.infoValue}>Elite Systems Inc.</Text>
          </View>
        </Card>
        
        <View style={styles.footer}>
            <Text style={styles.copyright}>© 2026 SRK Coaching Center. All rights reserved.</Text>
            <Text style={styles.footerSub}>Made with ❤️ for Educators</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
    marginBottom: 24,
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
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginTop: 12,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  chatTitle: { fontSize: 17, fontWeight: '800', color: '#FFF' },
  chatSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  chatStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.secondary },
  statusText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  emailCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 24,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  emailAddress: { fontSize: 13, color: colors.textLight, marginTop: 2 },
  emailActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqCard: { padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  faqCardExpanded: { borderColor: colors.primary + '30', backgroundColor: colors.accentLight + '30' },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqTitle: { fontSize: 15, fontWeight: '700', color: colors.text, flex: 1, marginRight: 16 },
  faqTitleActive: { color: colors.primary },
  faqAnswer: { fontSize: 14, color: colors.textLight, lineHeight: 22, marginTop: 12, fontWeight: '500' },
  infoCard: { padding: 4, marginBottom: 24 },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  infoKey: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.textLight },
  infoValue: { fontSize: 14, fontWeight: '700', color: colors.primary },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 14 },
  footer: { alignItems: 'center', marginTop: 12, gap: 4 },
  copyright: { fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  footerSub: { fontSize: 11, color: colors.primary, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
});
