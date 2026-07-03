import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../hooks/useAuth';
import { useGoals } from '../../hooks/useGoals';
import { useStreak } from '../../hooks/useStreak';
import { addDeposit } from '../../services/depositService';
import { updateGoalBalance, markGoalCompleted } from '../../services/goalService';
import { saveUserStats } from '../../services/userStatsService';
import { BadgeId } from '../../types';
import { computeDepositStats } from '../../utils/depositUtils';
import {
  sendMilestoneNotification,
  sendGoalCompletedNotification,
} from '../../services/notificationService';
import { formatCurrency, parseNumberInput } from '../../utils/format';
import { captureError, trackEvent } from '../../services/telemetryService';
import { showToast } from '../../services/toastService';
import { getErrorMessage } from '../../utils/errorUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Deposit'>;

export default function DepositScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { goalId } = route.params;
  const { user } = useAuth();
  const { goals } = useGoals(user?.uid ?? null);
  const stats = useStreak(user?.uid ?? null);

  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const didCompleteRef = useRef(false);

  const goal = goals.find((g) => g.id === goalId);

  useEffect(() => {
    trackEvent('deposit_opened', { goalId });
  }, [goalId]);

  useEffect(() => {
    return () => {
      const hasInput = amount.trim().length > 0 || note.trim().length > 0;
      if (!didCompleteRef.current && hasInput) {
        trackEvent('deposit_abandoned', { goalId, hadInput: true });
      }
    };
  }, [amount, goalId, note]);

  async function handleDeposit() {
    const depositAmount = parseNumberInput(amount);
    if (!depositAmount || depositAmount <= 0) {
      showToast('Please enter a valid amount.', 'error');
      return;
    }
    if (!user || !goal) return;

    setLoading(true);
    try {
      await addDeposit(goalId, user.uid, depositAmount, note);
      trackEvent('deposit_added', { amount: depositAmount, goalId });

      const outcome = computeDepositStats({
        currentBalance: goal.currentBalance,
        targetAmount: goal.targetAmount,
        depositAmount,
        stats,
        goalCount: goals.length,
        existingBadges: stats.badges as BadgeId[],
      });

      await updateGoalBalance(goalId, outcome.newBalance);

      await saveUserStats(user.uid, {
        currentStreak: outcome.newStreak,
        lastDepositMonth: outcome.currentMonth,
        totalDeposits: outcome.newTotalDeposits,
        badges: outcome.newBadges,
      });

      await Promise.all(
        outcome.crossedMilestones.map((milestone) =>
          sendMilestoneNotification(user.uid, goalId, goal.name, milestone).catch(() => {})
        )
      );

      if (outcome.isCompleted && !goal.completedAt) {
        trackEvent('goal_completed', { goalId });
        await sendGoalCompletedNotification(user.uid, goalId, goal.name).catch(() => {});
        await markGoalCompleted(goalId);
        didCompleteRef.current = true;
        showToast('Goal completed. Nice work!', 'success');
        navigation.replace('Celebration', { goalId, goalName: goal.name });
      } else {
        didCompleteRef.current = true;
        showToast('Deposit recorded.', 'success');
        navigation.goBack();
      }
    } catch (error: unknown) {
      captureError('deposit_submit', error);
      showToast(getErrorMessage(error, 'Failed to record deposit.'), 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Add Deposit</Text>
      {goal && (
        <View style={styles.goalSummary}>
          <Text style={styles.goalName}>{goal.name}</Text>
          <View style={styles.goalAmounts}>
            <Text style={styles.goalBalance}>{formatCurrency(goal.currentBalance)} saved</Text>
            <Text style={styles.goalSeparator}> · </Text>
            <Text style={styles.goalRemaining}>
              {formatCurrency(Math.max(goal.targetAmount - goal.currentBalance, 0))} remaining
            </Text>
          </View>
        </View>
      )}

      <Text style={styles.label}>Deposit Amount ($)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="Example: 100"
        placeholderTextColor="#9BA7A0"
        keyboardType="numeric"
        autoFocus
      />
      {goal && parseNumberInput(amount) > 0 && (
        <Text style={styles.depositHint}>
          {Math.min(
            ((goal.currentBalance + parseNumberInput(amount)) / goal.targetAmount) * 100,
            100
          ).toFixed(1)}
          % of goal after deposit
          {' • '}
          {formatCurrency(parseNumberInput(amount))} entered
          {goal.currentBalance + parseNumberInput(amount) >= goal.targetAmount ? ' 🎉' : ''}
        </Text>
      )}

      <Text style={styles.label}>Note (optional)</Text>
      <TextInput
        style={[styles.input, styles.noteInput]}
        value={note}
        onChangeText={setNote}
        placeholder="e.g. Freelance payout"
        placeholderTextColor="#9BA7A0"
        maxLength={120}
      />
      <Text style={styles.charCount}>{note.length}/120</Text>

      <TouchableOpacity style={styles.btn} onPress={handleDeposit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? 'Saving…' : 'Record Deposit'}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FFF8',
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: 6,
    textAlign: 'center',
  },
  goalSummary: {
    alignItems: 'center',
    marginBottom: 28,
  },
  goalName: { fontSize: 15, fontWeight: '700', color: '#2E7D32', textAlign: 'center' },
  goalAmounts: { flexDirection: 'row', marginTop: 4 },
  goalBalance: { fontSize: 13, color: '#555' },
  goalSeparator: { fontSize: 13, color: '#999' },
  goalRemaining: { fontSize: 13, color: '#E65100', fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', color: '#444', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    padding: 14,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 4,
  },
  depositHint: {
    fontSize: 12,
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  noteInput: {
    fontSize: 16,
    textAlign: 'left',
  },
  charCount: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    marginBottom: 20,
  },
  btn: { backgroundColor: '#4CAF50', borderRadius: 10, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
