export const COLORS = {
  background: '#0B0F19',      // Deep slate dark background
  card: '#151E2E',            // Card slate navy
  cardHeader: '#1E293B',      // Slate grey for header
  border: 'rgba(255, 255, 255, 0.06)', // Glassmorphic borders
  borderActive: 'rgba(255, 255, 255, 0.15)',
  
  text: '#F8FAFC',            // Almost white primary text
  textSecondary: '#94A3B8',   // Slate secondary text
  textMuted: '#64748B',       // Muted text
  
  primary: '#8B5CF6',         // Electric Violet
  primaryGradient: ['#8B5CF6', '#EC4899'] as const, // Violet to Pink
  secondaryGradient: ['#00F2FE', '#4FACFE'] as const, // Cyan to Blue
  successGradient: ['#10B981', '#059669'] as const,   // Emerald to Deep Green
  
  accentCyan: '#06B6D4',      // Neon Cyan
  accentPink: '#EC4899',      // Accent Pink
  accentBlue: '#3B82F6',      // Blue
  
  success: '#10B981',         // Emerald Green
  warning: '#F59E0B',         // Amber Yellow
  error: '#EF4444',           // Rose Red
  
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const SIZES = {
  radius_sm: 8,
  radius_md: 12,
  radius_lg: 16,
  radius_xl: 24,
};

export const SHADOWS = {
  glow: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  }
};
