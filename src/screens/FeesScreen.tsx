import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CreditCard, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { colors, spacing, typography, radius } from '../theme/Theme';
import { Card } from '../components/Card';
import feesService, { Fee } from '../services/feesService';

const { width } = Dimensions.get('window');

interface FeesScreenProps {
  userData: any;
}

export const FeesScreen: React.FC<FeesScreenProps> = ({ userData }) => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFees = async () => {
    try {
      const data = await feesService.getStudentFees(userData._id);
      setFees(data);
    } catch (err) {
      console.error('Error fetching fees:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFees();
  };

  const totalDue = fees
    .filter((f) => f.status === 'unpaid')
    .reduce((acc, curr) => acc + curr.amount, 0);

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.h1}>My Fees</Text>
        <Text style={styles.subHeader}>Track your payment history</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color={colors.primary} />
        }
      >
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>Total Unpaid Due</Text>
              <Text style={styles.summaryValue}>₹{totalDue}</Text>
            </View>
            <View style={[styles.iconBox, { backgroundColor: totalDue > 0 ? colors.warningLight : colors.successLight }]}>
              <CreditCard color={totalDue > 0 ? colors.warning : colors.success} size={24} />
            </View>
          </View>
          {totalDue > 0 && (
            <View style={styles.warningBox}>
              <AlertCircle size={16} color={colors.warning} />
              <Text style={styles.warningText}>Please clear your dues at the coaching center.</Text>
            </View>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Payment History</Text>

        {fees.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AlertCircle size={48} color={colors.textMuted} strokeWidth={1.5} />
            <Text style={styles.emptyText}>No fee records found</Text>
          </View>
        ) : (
          fees.map((fee) => (
            <Card key={fee._id} variant="outline" style={styles.feeCard}>
              <View style={styles.feeHeader}>
                <View style={styles.monthBox}>
                  <Calendar size={18} color={colors.textMuted} />
                  <Text style={styles.monthText}>
                    {new Date(fee.month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: fee.status === 'paid' ? colors.successLight : colors.warningLight }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: fee.status === 'paid' ? colors.success : colors.warning }
                  ]}>
                    {fee.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.feeFooter}>
                <View>
                  <Text style={styles.amountLabel}>Amount</Text>
                  <Text style={styles.amountValue}>₹{fee.amount}</Text>
                </View>
                {fee.status === 'paid' && fee.paidAt && (
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.amountLabel}>Paid On</Text>
                        <Text style={styles.paidDate}>{new Date(fee.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                    </View>
                )}
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  subHeader: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  summaryCard: {
    backgroundColor: colors.primary,
    padding: 24,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  warningText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
  },
  feeCard: {
    marginBottom: 16,
    padding: 16,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  feeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  paidDate: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
