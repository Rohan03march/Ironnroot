import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradientColors?: readonly string[];
}

export default function Card({ children, style, gradientColors }: CardProps) {
  if (gradientColors) {
    return (
      <LinearGradient
        colors={gradientColors}
        style={[styles.card, styles.gradientCard, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }
  
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientCard: {
    borderWidth: 0,
  }
});
