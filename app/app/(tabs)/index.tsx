import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import { DEFAULT_USER } from '../../constants/mockData';
import { Flame, Dumbbell, Plus } from 'lucide-react-native';

export default function Dashboard() {
  const router = useRouter();

  const handleStartWorkout = (templateId?: string) => {
    if (templateId) {
      router.push(`/active-workout?templateId=${templateId}`);
    } else {
      router.push('/active-workout');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hey, {DEFAULT_USER.name} 👋</Text>
            <Text style={styles.dateText}>Ready to crush today's goals?</Text>
          </View>
          <View style={styles.streakBadge}>
            <Flame size={16} color={COLORS.warning} fill={COLORS.warning} />
            <Text style={styles.streakText}>{DEFAULT_USER.streakDays} Day Streak</Text>
          </View>
        </View>

        {/* Routines Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Routines</Text>
        </View>

        {/* New Routine and Explore Routine Actions */}
        <View style={styles.routinesRow}>
          <TouchableOpacity
            style={styles.routineActionCard}
            onPress={() => router.push('/create-routine')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.18)', 'rgba(236, 72, 153, 0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.routineActionGradient}
            >
              <View style={[styles.routineActionIconContainer, { borderColor: 'rgba(236, 72, 153, 0.2)' }]}>
                <Plus size={18} color={COLORS.accentPink} />
              </View>
              <Text style={styles.routineActionTitle}>New Routine</Text>
              <Text style={styles.routineActionDesc}>Design custom routine</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.routineActionCard}
            onPress={() => router.push('/explore-exercises')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(6, 182, 212, 0.18)', 'rgba(59, 130, 246, 0.06)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.routineActionGradient}
            >
              <View style={[styles.routineActionIconContainer, { borderColor: 'rgba(6, 182, 212, 0.2)' }]}>
                <Dumbbell size={16} color={COLORS.accentCyan} />
              </View>
              <Text style={styles.routineActionTitle}>Explore Exercises</Text>
              <Text style={styles.routineActionDesc}>Browse database</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
  },
  dateText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius_xl,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  streakText: {
    color: COLORS.warning,
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  routinesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: -6,
  },
  routineActionCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: SIZES.radius_lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: COLORS.card,
  },
  routineActionGradient: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 125,
  },
  routineActionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1.5,
  },
  routineActionTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 3,
  },
  routineActionDesc: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  startEmptyCard: {
    borderRadius: SIZES.radius_lg,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  startEmptyGradient: {
    padding: 1.5,
    borderRadius: SIZES.radius_lg,
  },
  startEmptyInner: {
    backgroundColor: 'rgba(21, 30, 46, 0.95)',
    borderRadius: SIZES.radius_lg - 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  startEmptyText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
