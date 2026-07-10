import React, { useRef, useEffect, useMemo } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Bear, Size, Mood, ACCESSORY_UNLOCKS } from '../types';
import { colors, radius, typography, shadows } from '../config/theme';

interface Props {
  bear: Bear;
  size?: number;
  onPress?: () => void;
  animated?: boolean;
}

const SIZE_MAP: Record<Size, number> = {
  cub: 120,
  grown: 180,
  giant: 240,
};

const MOOD_EYES: Record<Mood, { left: number; right: number }> = {
  hungry: { left: 0.3, right: 0.3 },
  content: { left: 0.5, right: 0.5 },
  happy: { left: 0.7, right: 0.7 },
  ecstatic: { left: 1, right: 1 },
};

const ACCESSORY_POSITIONS: Record<string, { x: number; y: number; scale: number; rotate: string }> =
  {
    scarf: { x: 0, y: 0.35, scale: 1, rotate: '0deg' },
    glasses: { x: 0, y: -0.15, scale: 0.8, rotate: '0deg' },
    party_hat: { x: 0, y: -0.55, scale: 0.6, rotate: '-5deg' },
    sunglasses: { x: 0, y: -0.15, scale: 0.85, rotate: '0deg' },
    backpack: { x: -0.4, y: 0.2, scale: 0.5, rotate: '10deg' },
    crown: { x: 0, y: -0.55, scale: 0.7, rotate: '0deg' },
  };

export default function BearCharacter({ bear, size = 160, onPress, animated = true }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const bounce = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  const bearSize = useMemo(() => SIZE_MAP[bear.size] * (size / 160), [bear.size, size]);
  const eyeScale = useMemo(() => MOOD_EYES[bear.mood], [bear.mood]);

  useEffect(() => {
    if (!animated) return;
    Animated.loop(
      Animated.timing(breathe, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, [animated, breathe]);

  const handlePressIn = () => {
    if (animated) {
      Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start();
    }
  };

  const handlePressOut = () => {
    if (animated) {
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    }
  };

  const triggerFeed = useRef(() => {
    if (animated) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.1, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
  }).current;

  const breatheAnim = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  const furColor = colors.fur.light;
  const furDark = colors.fur.dark;
  const noseColor = colors.fur.nose;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      style={[styles.container, { width: bearSize, height: bearSize }]}
    >
      <Animated.View
        style={[
          styles.bearBody,
          { width: bearSize, height: bearSize },
          { backgroundColor: furColor },
          { transform: [{ translateY: breatheAnim }] },
        ]}
      >
        <Animated.View
          style={[styles.bearHead, { width: bearSize * 0.85, height: bearSize * 0.7 }]}
        >
          <View style={styles.earLeft} />
          <View style={styles.earRight} />

          <View style={styles.face}>
            <Animated.View
              style={[
                styles.eye,
                { left: bearSize * 0.15 },
                { transform: [{ scaleX: eyeScale.left }] },
              ]}
            />
            <Animated.View
              style={[
                styles.eye,
                { right: bearSize * 0.15 },
                { transform: [{ scaleX: eyeScale.right }] },
              ]}
            />
            <View style={[styles.nose, { backgroundColor: noseColor }]} />
            <View style={styles.mouth} />
          </View>
        </Animated.View>

        {bear.accessories.map((acc) => {
          const pos = ACCESSORY_POSITIONS[acc];
          if (!pos) return null;
          return (
            <AccessoryIcon
              key={acc}
              id={acc}
              size={bearSize * pos.scale}
              style={[
                styles.accessory,
                {
                  left: '50%',
                  top: '50%',
                  transform: [
                    { translateX: pos.x * bearSize },
                    { translateY: pos.y * bearSize },
                    { rotate: pos.rotate },
                  ],
                },
              ]}
            />
          );
        })}

        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Lv.{bear.level}</Text>
        </View>
      </Animated.View>

      <Animated.Text style={[styles.xpLabel, { transform: [{ translateY: breatheAnim }] }]}>
        {bear.xp} XP
      </Animated.Text>
    </TouchableOpacity>
  );
}

function AccessoryIcon({
  id,
  size,
  style,
}: {
  id: string;
  size: number;
  style: StyleProp<ViewStyle>;
}) {
  const emojiMap: Record<string, string> = {
    scarf: '🧣',
    glasses: '👓',
    party_hat: '🎉',
    sunglasses: '🕶️',
    backpack: '🎒',
    crown: '👑',
  };

  return <Text style={[style, { fontSize: size, lineHeight: size }]}>{emojiMap[id] || '✨'}</Text>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bearBody: {
    borderRadius: radius.bear,
    ...shadows.bear,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  bearHead: {
    borderRadius: radius.bear,
    backgroundColor: colors.fur.light,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  earLeft: {
    position: 'absolute',
    top: -8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.fur.light,
    zIndex: -1,
  },
  earRight: {
    position: 'absolute',
    top: -8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.fur.light,
    zIndex: -1,
  },
  face: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  eye: {
    position: 'absolute',
    top: '30%',
    width: 16,
    height: 20,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  nose: {
    position: 'absolute',
    top: '55%',
    width: 18,
    height: 10,
    borderRadius: 9,
  },
  mouth: {
    position: 'absolute',
    top: '70%',
    width: 20,
    height: 4,
    borderBottomWidth: 2,
    borderBottomColor: '#1a1a1a',
    borderRadius: 10,
  },
  accessory: {
    position: 'absolute',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: colors.accent.honey,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 40,
    alignItems: 'center',
    ...shadows.card,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.ink,
    fontFamily: typography.fontFamilies.mono,
  },
  xpLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.muted,
    fontFamily: typography.fontFamilies.mono,
  },
});
