import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, Platform } from 'react-native';
import { Bear, FeedResult } from '../types';
import { colors, spacing, radius, typography, shadows, animation } from '../config/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onFeed: (amount: number) => Promise<FeedResult>;
  bear: Bear;
}

const AMOUNT_PRESETS = [500, 1000, 2000, 5000, 10000, 20000];

export default function FeedModal({ visible, onClose, onFeed, bear }: Props) {
  const [amount, setAmount] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FeedResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const honeyDrops = useRef([] as Animated.Value[]).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: animation.fast, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, ...animation.spring, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: animation.fast, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0, duration: animation.fast, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  useEffect(() => {
    if (result) {
      setShowResult(true);
      setTimeout(() => {
        setShowResult(false);
        setResult(null);
        onClose();
      }, 2000);
    }
  }, [result]);

  const handleFeed = async () => {
    setLoading(true);
    try {
      const res = await onFeed(amount);
      setResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  if (!visible && !result) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity, transform: [{ scale }] }]}>
      <Animated.View style={[styles.modal, { width: 320 }]}>
        <View style={styles.header}>
          <Animated.Text style={styles.title}>Feed {bear.name}</Animated.Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bearPreview}>
          <Text style={{ fontSize: 80 }}>🐻</Text>
          <Animated.Text style={styles.levelBadge}>Lv.{bear.level}</Animated.Text>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Amount to feed</Text>
          <View style={styles.amountDisplay}>
            <Text style={styles.amountValue}>{formatAmount(amount)}</Text>
          </View>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderMin}>$5</Text>
            <View style={styles.sliderTrack}>
              <Animated.View
                style={[styles.sliderFill, { width: `${((amount - 500) / (20000 - 500)) * 100}%` }]}
              />
            </View>
            <Text style={styles.sliderMax}>$200</Text>
          </View>
          <View style={styles.presets}>
            {AMOUNT_PRESETS.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[styles.presetBtn, amount === preset && styles.presetActive]}
                onPress={() => setAmount(preset)}
                disabled={loading}
              >
                <Text style={[styles.presetText, amount === preset && styles.presetTextActive]}>
                  ${preset / 100}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.feedBtn, loading && styles.feedBtnDisabled]}
          onPress={handleFeed}
          disabled={loading}
        >
          <Text style={styles.feedBtnText}>
            {loading ? 'Feeding...' : `Feed ${formatAmount(amount)}`}
          </Text>
        </TouchableOpacity>

        {showResult && result && (
          <Animated.View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{result.leveledUp ? '🎉 Level Up!' : '🍯 Fed!'}</Text>
            <Text style={styles.resultXp}>+{result.newXp - bear.xp} XP</Text>
            {result.leveledUp && (
              <Text style={styles.resultLevel}>
                Level {bear.level} → {result.newLevel}
              </Text>
            )}
            {result.newAccessories.length > 0 && (
              <Text style={styles.resultAccessory}>
                Unlocked: {result.newAccessories.join(', ')}
              </Text>
            )}
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(61, 43, 31, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing(4),
  },
  modal: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.lg,
    padding: spacing(6),
    ...shadows.modal,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(3),
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.ink,
    fontFamily: typography.fontFamilies.display,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.border.soft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 18,
    fontWeight: typography.weights.bold,
    color: colors.text.muted,
  },
  bearPreview: {
    marginVertical: spacing(3),
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: colors.accent.honey,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 2,
    minWidth: 48,
    alignItems: 'center',
  },
  amountSection: {
    width: '100%',
    alignItems: 'center',
    marginVertical: spacing(2),
  },
  amountLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
    marginBottom: spacing(2),
  },
  amountDisplay: {
    marginBottom: spacing(3),
  },
  amountValue: {
    fontSize: 42,
    fontWeight: typography.weights.extrabold,
    color: colors.text.ink,
    fontFamily: typography.fontFamilies.mono,
  },
  sliderContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing(3),
    gap: spacing(2),
  },
  sliderMin: {
    fontSize: 12,
    color: colors.text.muted,
    width: 30,
  },
  sliderMax: {
    fontSize: 12,
    color: colors.text.muted,
    width: 40,
  },
  sliderTrack: {
    flex: 1,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.border.soft,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.accent.honey,
    borderRadius: radius.full,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing(1.5),
    marginTop: spacing(2),
    width: '100%',
  },
  presetBtn: {
    backgroundColor: colors.border.soft,
    borderRadius: radius.full,
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
  },
  presetActive: {
    backgroundColor: colors.accent.honey,
  },
  presetText: {
    fontSize: 13,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
  },
  presetTextActive: {
    color: colors.text.ink,
  },
  feedBtn: {
    width: '100%',
    backgroundColor: colors.accent.honey,
    borderRadius: radius.md,
    paddingVertical: spacing(2),
    marginTop: spacing(3),
    alignItems: 'center',
    ...shadows.card,
  },
  feedBtnDisabled: {
    opacity: 0.6,
  },
  feedBtnText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.onHoney,
    fontFamily: typography.fontFamilies.display,
  },
  resultCard: {
    marginTop: spacing(3),
    padding: spacing(3),
    backgroundColor: colors.accent.mossLight,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.accent.moss,
    fontFamily: typography.fontFamilies.display,
  },
  resultXp: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.ink,
    marginTop: spacing(1),
  },
  resultLevel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.accent.honey,
    marginTop: spacing(0.5),
  },
  resultAccessory: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginTop: spacing(1),
  },
});
