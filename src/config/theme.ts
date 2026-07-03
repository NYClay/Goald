export const colors = {
  bg: {
    warm: '#FEF8F0',
    card: '#FFFDF5',
    overlay: 'rgba(61, 43, 31, 0.4)',
  },
  fur: {
    light: '#D4A574',
    dark: '#8B5E3C',
    nose: '#3D2B1F',
  },
  accent: {
    honey: '#F0B232',
    honeyLight: '#F5C85A',
    berry: '#D45B6E',
    moss: '#6B8E5C',
    mossLight: '#8FC27A',
  },
  text: {
    ink: '#3D2B1F',
    muted: '#9D8B7A',
    onHoney: '#3D2B1F',
  },
  border: {
    soft: '#E8DCC8',
  },
  state: {
    success: '#6B8E5C',
    error: '#D45B6E',
    warning: '#F0B232',
  },
};

export const spacing = (n: number) => [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64][n] ?? n * 4;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
  bear: 28,
};

export const typography = {
  fontFamilies: {
    display: 'Nunito',
    body: 'Inter',
    mono: 'JetBrains Mono',
  },
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 36,
    '5xl': 48,
  },
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

export const shadows = {
  card: {
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  modal: {
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  bear: {
    shadowColor: '#8B5E3C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },
};

export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
  spring: { damping: 15, stiffness: 120 },
  bounce: { damping: 12, stiffness: 180 },
};

export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
};
