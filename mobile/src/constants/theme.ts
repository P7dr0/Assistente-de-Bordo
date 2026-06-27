/**
 * Design System - Assistente de Bordo
 * Tema dark mode premium com paleta minimalista
 */

export const COLORS = {
  // Background
  background: '#0A0A0F',
  backgroundSecondary: '#12121A',
  backgroundCard: 'rgba(255, 255, 255, 0.04)',
  backgroundCardBorder: 'rgba(255, 255, 255, 0.08)',

  // Text
  textPrimary: '#F5F5F5',
  textSecondary: '#9E9E9E',
  textMuted: '#616161',

  // Accent
  accent: '#448AFF',
  accentLight: 'rgba(68, 138, 255, 0.15)',

  // Semáforo
  green: '#00E676',
  greenLight: 'rgba(0, 230, 118, 0.15)',
  greenDark: 'rgba(0, 230, 118, 0.08)',

  yellow: '#FFD600',
  yellowLight: 'rgba(255, 214, 0, 0.15)',
  yellowDark: 'rgba(255, 214, 0, 0.08)',

  red: '#FF1744',
  redLight: 'rgba(255, 23, 68, 0.15)',
  redDark: 'rgba(255, 23, 68, 0.08)',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  divider: 'rgba(255, 255, 255, 0.06)',
  overlay: 'rgba(0, 0, 0, 0.6)',

  // Health Score Gradient
  healthExcellent: '#00E676',
  healthGood: '#66BB6A',
  healthFair: '#FFD600',
  healthPoor: '#FF9100',
  healthCritical: '#FF1744',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
  hero: 48,
};

export const FONT_WEIGHT = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
};

/**
 * Retorna a cor do semáforo baseada no status
 */
export function getStatusColor(status: 'green' | 'yellow' | 'red'): string {
  const map = {
    green: COLORS.green,
    yellow: COLORS.yellow,
    red: COLORS.red,
  };
  return map[status] || COLORS.textMuted;
}

/**
 * Retorna a cor de fundo suave baseada no status
 */
export function getStatusBackgroundColor(status: 'green' | 'yellow' | 'red'): string {
  const map = {
    green: COLORS.greenLight,
    yellow: COLORS.yellowLight,
    red: COLORS.redLight,
  };
  return map[status] || 'transparent';
}

/**
 * Retorna a cor do health score (0-100)
 */
export function getHealthColor(score: number): string {
  if (score >= 80) return COLORS.healthExcellent;
  if (score >= 60) return COLORS.healthGood;
  if (score >= 40) return COLORS.healthFair;
  if (score >= 20) return COLORS.healthPoor;
  return COLORS.healthCritical;
}

/**
 * Retorna label do status em português
 */
export function getStatusLabel(status: 'green' | 'yellow' | 'red'): string {
  const map = {
    green: 'Em dia',
    yellow: 'Atenção',
    red: 'Vencido',
  };
  return map[status] || 'Desconhecido';
}

// API Configuration
export const API_BASE_URL = 'http://10.0.2.2:3001/api'; // Android emulator
// Para iOS simulator usar: 'http://localhost:3001/api'
// Para dispositivo físico usar o IP da máquina
