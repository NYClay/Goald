import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAppContext } from '../context/AppContext';
import BearCharacter from '../components/BearCharacter';
import FeedModal from '../components/FeedModal';
import { colors, spacing, radius, typography, shadows } from '../config/theme';
import { getBearDisplayData, getCaveProgress } from '../utils/bearUtils';

export default function DashboardScreen() {
  const { bear, caves, mission, streak, loading, feed, completeMission } = useAppContext();
  const [feedModalVisible, setFeedModalVisible] = React.useState(false);

  const displayData = bear ? getBearDisplayData(bear) : null;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your bear...</Text>
      </SafeAreaView>
    );
  }

  if (!bear) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Welcome! Create your bear to start.</Text>
      </SafeAreaView>
    );
  }

  const nextMission = mission;
  const currentCaves = caves.slice(0, 3);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.bearName}>{bear.name}</Text>
          <Text style={styles.levelBadge}>Lv. {bear.level}</Text>
        </View>

        <TouchableOpacity style={styles.bearContainer} onPress={() => setFeedModalVisible(true)}>
          <BearCharacter bear={bear} size={200} animated />
        </TouchableOpacity>

        <View style={styles.xpBarContainer}>
          <View style={styles.xpBarBg}>
            <View style={[styles.xpBarFill, { width: `${displayData!.xpProgress * 100}%` }]} />
          </View>
          <Text style={styles.xpLabel}>
            {bear.xp} / {displayData!.xpProgress * 100}% to next level
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔥 Streak: {streak.current} days</Text>
          <View style={styles.fireContainer}>
            {[1, 2, 3, 4].map(level => (
              <View
                key={level}
                style={[styles.fireSegment, level <= streak.fireLevel && styles.fireActive]}
              />
            ))}
          </View>
        </View>

        {nextMission && !nextMission.completed && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Today's Mission</Text>
            <View style={styles.missionCard}>
              <Text style={styles.missionText}>{getMissionText(nextMission)}</Text>
              <TouchableOpacity style={styles.completeBtn} onPress={() => completeMission()}>
                <Text style={styles.completeBtnText}>Complete +{nextMission.xpReward} XP</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏠 Your Caves</Text>
            <Text style={styles.viewAll}>View all</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cavesScroll}
          >
            {currentCaves.map(cave => (
              <TouchableOpacity key={cave.id} style={styles.caveCard}>
                <Text style={styles.caveName}>{cave.name}</Text>
                <View style={styles.caveProgressBg}>
                  <View
                    style={[styles.caveProgressFill, { width: `${getCaveProgress(cave) * 100}%` }]}
                  />
                </View>
                <Text style={styles.caveAmount}>
                  ${(cave.currentAmount / 100).toFixed(0)} / ${(cave.targetAmount / 100).toFixed(0)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      <FeedModal
        visible={feedModalVisible}
        onClose={() => setFeedModalVisible(false)}
        onFeed={feed}
        bear={bear}
      />
    </SafeAreaView>
  );
}

function getMissionText(mission: { type: string; target: number }): string {
  switch (mission.type) {
    case 'save_amount':
      return `Feed your bear $${(mission.target / 100).toFixed(0)}`;
    case 'round_up':
      return `Round up ${mission.target} purchases`;
    case 'skip_purchase':
      return `Skip a $${(mission.target / 100).toFixed(0)} purchase`;
    case 'custom':
      return 'No-spend day';
    default:
      return 'Complete a mission';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.warm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.warm,
  },
  loadingText: {
    fontSize: typography.sizes.lg,
    color: colors.text.muted,
    fontFamily: typography.fontFamilies.body,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.warm,
    padding: spacing(6),
  },
  emptyText: {
    fontSize: typography.sizes.lg,
    color: colors.text.muted,
    fontFamily: typography.fontFamilies.body,
    textAlign: 'center',
  },
  scrollContent: {
    padding: spacing(4),
    paddingBottom: spacing(10),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(4),
  },
  bearName: {
    fontSize: typography.sizes['3xl'],
    fontWeight: '700',
    color: colors.text.ink,
    fontFamily: typography.fontFamilies.display,
  },
  levelBadge: {
    backgroundColor: colors.accent.honey,
    borderRadius: radius.full,
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(0.5),
  },
  bearContainer: {
    alignItems: 'center',
    marginVertical: spacing(3),
  },
  xpBarContainer: {
    marginBottom: spacing(4),
    paddingHorizontal: spacing(2),
  },
  xpBarBg: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border.soft,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: colors.accent.honey,
    borderRadius: radius.full,
  },
  xpLabel: {
    marginTop: spacing(1),
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    textAlign: 'center',
    fontFamily: typography.fontFamilies.mono,
  },
  section: {
    marginBottom: spacing(4),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(2),
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text.ink,
    fontFamily: typography.fontFamilies.display,
  },
  viewAll: {
    fontSize: typography.sizes.sm,
    color: colors.accent.honey,
    fontWeight: '500',
  },
  fireContainer: {
    flexDirection: 'row',
    gap: spacing(1),
    marginTop: spacing(1),
  },
  fireSegment: {
    flex: 1,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border.soft,
  },
  fireActive: {
    backgroundColor: colors.accent.berry,
  },
  missionCard: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    padding: spacing(4),
    ...shadows.card,
  },
  missionText: {
    fontSize: typography.sizes.base,
    color: colors.text.ink,
    marginBottom: spacing(3),
    fontFamily: typography.fontFamilies.body,
  },
  completeBtn: {
    backgroundColor: colors.accent.moss,
    borderRadius: radius.md,
    paddingVertical: spacing(2),
    alignItems: 'center',
  },
  completeBtnText: {
    fontSize: typography.sizes.base,
    fontWeight: '700',
    color: '#fff',
    fontFamily: typography.fontFamilies.display,
  },
  cavesScroll: {
    gap: spacing(2),
    paddingBottom: spacing(2),
  },
  caveCard: {
    width: 160,
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    padding: spacing(3),
    ...shadows.card,
  },
  caveName: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
    color: colors.text.ink,
    marginBottom: spacing(2),
    fontFamily: typography.fontFamilies.display,
  },
  caveProgressBg: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.border.soft,
    overflow: 'hidden',
    marginBottom: spacing(1),
  },
  caveProgressFill: {
    height: '100%',
    backgroundColor: colors.accent.honey,
    borderRadius: radius.full,
  },
  caveAmount: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    fontFamily: typography.fontFamilies.mono,
  },
});
