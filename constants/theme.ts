// constants/theme.ts (Enhanced)
export type ThemeType = 'light' | 'dark';

export const lightColors = {
  // Primary colors (Bloom theme)
  primary: '#9C27B0',
  primaryLight: '#E1BEE7',
  primaryDark: '#7B1FA2',
  
  // Secondary colors
  secondary: '#4CAF50',
  secondaryLight: '#C8E6C9',
  secondaryDark: '#388E3C',
  
  // Accent colors
  accentBlue: '#2196F3',
  accentYellow: '#FFEB3B',
  accentOrange: '#FF9800',
  accentPink: '#E91E63',
  
  // Neutral colors
  background: '#FEF7FF',
  surface: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  textDisabled: '#999999',
  
  // Feedback colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
  
  // ASD-friendly colors
  softBlue: '#B3E5FC',
  softGreen: '#C8E6C9',
  softYellow: '#FFF9C4',
  softPink: '#F8BBD0',
  softPurple: '#E1BEE7',
  
  // For charts and progress
  progressStart: '#FF4081',
  progressEnd: '#7B1FA2',
};

export const darkColors = {
  // Primary colors (Bloom theme - dark mode)
  primary: '#BA68C8',
  primaryLight: '#4A235A',
  primaryDark: '#7B1FA2',
  
  // Secondary colors
  secondary: '#81C784',
  secondaryLight: '#1B5E20',
  secondaryDark: '#388E3C',
  
  // Accent colors
  accentBlue: '#64B5F6',
  accentYellow: '#FFF176',
  accentOrange: '#FFB74D',
  accentPink: '#F48FB1',
  
  // Neutral colors
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textLight: '#B0B0B0',
  textDisabled: '#666666',
  
  // Feedback colors
  success: '#81C784',
  warning: '#FFB74D',
  error: '#E57373',
  info: '#64B5F6',
  
  // ASD-friendly colors (darker versions)
  softBlue: '#0D47A1',
  softGreen: '#1B5E20',
  softYellow: '#F57F17',
  softPink: '#880E4F',
  softPurple: '#4A148C',
  
  // For charts and progress
  progressStart: '#FF4081',
  progressEnd: '#7B1FA2',
};

export const getColors = (theme: ThemeType = 'light') => {
  return theme === 'light' ? lightColors : darkColors;
};

export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 50,
};