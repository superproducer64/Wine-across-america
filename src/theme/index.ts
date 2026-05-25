export const Colors = {
  gold: '#C9A84C',
  goldLight: '#F0DFA0',
  goldPale: '#FBF6E9',
  ink: '#1A1710',
  inkMid: '#3D3A2E',
  inkMuted: '#7A7564',
  inkFaint: '#BDB9A8',
  surface: '#FDFCF8',
  surfaceAlt: '#F5F2EA',
  border: 'rgba(201,168,76,0.25)',
  borderStrong: 'rgba(201,168,76,0.5)',
  red: '#8B2E2E',
  redLight: '#FCEBEB',
  green: '#2E6B45',
  blue: '#2E4E8B',
  blueLight: '#EEF3FC',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const Fonts = {
  playfair: 'PlayfairDisplay_400Regular',
  playfairItalic: 'PlayfairDisplay_400Regular_Italic',
  playfairSemiBold: 'PlayfairDisplay_600SemiBold',
  dmSans: 'DMSans_400Regular',
  dmSansRegular: 'DMSans_400Regular',
  dmSansMedium: 'DMSans_500Medium',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const Radius = {
  sm: 4,
  md: 6,
  lg: 12,
  xl: 20,
  full: 9999,
} as const;

export const Typography = {
  hero: {
    fontFamily: Fonts.playfair,
    fontSize: 32,
    lineHeight: 38,
    color: Colors.ink,
  },
  h1: {
    fontFamily: Fonts.playfair,
    fontSize: 24,
    lineHeight: 30,
    color: Colors.ink,
  },
  h2: {
    fontFamily: Fonts.playfair,
    fontSize: 20,
    lineHeight: 26,
    color: Colors.ink,
  },
  h3: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
    color: Colors.inkMuted,
  },
  body: {
    fontFamily: Fonts.dmSans,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.inkMid,
  },
  bodyMedium: {
    fontFamily: Fonts.dmSansRegular,
    fontSize: 15,
    lineHeight: 22,
    color: Colors.inkMid,
  },
  caption: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    lineHeight: 16,
    color: Colors.inkMuted,
  },
  label: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
    color: Colors.gold,
  },
  mono: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
} as const;

export const Shadows = {
  sm: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;
