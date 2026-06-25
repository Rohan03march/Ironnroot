import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SPACING } from '../../constants/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';
import CircularProgress from '../../components/CircularProgress';
import { DEFAULT_TEMPLATES, WORKOUT_LOGS, DEFAULT_USER } from '../../constants/mockData';
import { Flame, Play, Clock, Dumbbell, Award, Plus } from 'lucide-react-native';

export default function Dashboard() {
  const router = useRouter();

  // Find recent logs
  const recentLogs = WORKOUT_LOGS.slice(0, 2);

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

        {/* Daily Summary Glass Card with Gradient Border Wrapper */}
        <View style={styles.todayCardWrapper}>
          <LinearGradient
            colors={['#8B5CF6', '#06B6D4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.todayCardGradient}
          >
            <View style={styles.todayCardInner}>
              <View style={styles.todayContent}>
                <View style={styles.todayLeft}>
                  <Text style={styles.todayHeader}>TODAY'S TARGET</Text>
                  <Text style={styles.todayTitle}>Muscle Rebuild</Text>
                  <Text style={styles.todayGoalText}>Complete 12 working sets to keep the momentum going!</Text>
                  
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleStartWorkout('temp-legs')}
                    style={styles.quickStartChip}
                  >
                    <Play size={10} color={COLORS.success} fill={COLORS.success} />
                    <Text style={styles.quickStartChipText}>Up next: Leg Day</Text>
                  </TouchableOpacity>
                </View>
                <CircularProgress
                  size={100}
                  strokeWidth={8}
                  progress={8 / 12}
                  label="8 / 12"
                  subLabel="SETS DONE"
                />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Stats Row with top borders and glowing shadows */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, styles.statCardTime]}>
            <Clock size={18} color={COLORS.accentCyan} />
            <Text style={styles.statValue}>188m</Text>
            <Text style={styles.statLabel}>Lifting Time</Text>
          </Card>

          <Card style={[styles.statCard, styles.statCardVolume]}>
            <Dumbbell size={18} color={COLORS.primary} />
            <Text style={styles.statValue}>7,360 kg</Text>
            <Text style={styles.statLabel}>Total Volume</Text>
          </Card>

          <Card style={[styles.statCard, styles.statCardWorkouts]}>
            <Award size={18} color={COLORS.success} />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </Card>
        </View>

        {/* Start Empty Workout Button */}
        <Button
          title="Start Empty Workout"
          onPress={() => handleStartWorkout()}
          variant="primary"
          icon={<Plus size={18} color={COLORS.white} />}
          style={styles.emptyWorkoutBtn}
        />

        {/* Templates Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Workout Routines</Text>
          <TouchableOpacity onPress={() => router.push('/workouts')}>
            <Text style={styles.sectionLink}>View All</Text>
          </TouchableOpacity>
        </View>

        {/* Templates horizontal list with left accent borders and glowing drop shadows */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
          {DEFAULT_TEMPLATES.map((t) => {
            const borderThemeColor = t.id === 'temp-push' ? '#8B5CF6' : t.id === 'temp-pull' ? '#00F2FE' : '#10B981';
            return (
              <Card 
                key={t.id} 
                style={[
                  styles.templateCard, 
                  { 
                    borderLeftWidth: 3, 
                    borderLeftColor: borderThemeColor,
                    shadowColor: borderThemeColor,
                    shadowOpacity: 0.15,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 4 },
                  }
                ]}
              >
                <Text style={styles.templateName} numberOfLines={1}>{t.name}</Text>
                <Text style={styles.templateMeta}>
                  {t.exercisesCount} Exercises • {t.durationMin} mins
                </Text>
                <Button
                  title="Start Routine"
                  onPress={() => handleStartWorkout(t.id)}
                  size="sm"
                  variant="outline"
                  style={[styles.templateBtn, { borderColor: borderThemeColor }]}
                  textStyle={{ color: borderThemeColor, fontSize: 11 }}
                />
              </Card>
            );
          })}
        </ScrollView>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Logs</Text>
        {recentLogs.map((log) => {
          const logBorderColor = log.name.toLowerCase().includes('legs') 
            ? '#10B981' 
            : log.name.toLowerCase().includes('pull') 
              ? '#00F2FE' 
              : '#8B5CF6';
          return (
            <Card 
              key={log.id} 
              style={[
                styles.logCard, 
                { borderLeftWidth: 3, borderLeftColor: logBorderColor }
              ]}
            >
              <View style={styles.logHeader}>
                <View>
                  <Text style={styles.logName}>{log.name}</Text>
                  <Text style={styles.logMeta}>
                    {log.date} • {log.durationMin} mins • Volume: {log.totalVolumeKg}kg
                  </Text>
                </View>
                <Dumbbell size={16} color={logBorderColor} />
              </View>
              <View style={styles.logDivider} />
              {log.exercises.slice(0, 2).map((ex, idx) => (
                <Text key={idx} style={styles.logExerciseItem}>
                  • {ex.exerciseName} ({ex.setsCount} sets • Best: {ex.bestSet})
                </Text>
              ))}
            </Card>
          );
        })}
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
  todayCardWrapper: {
    marginBottom: 20,
    borderRadius: SIZES.radius_lg,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  todayCardGradient: {
    padding: 1.5,
    borderRadius: SIZES.radius_lg,
  },
  todayCardInner: {
    backgroundColor: 'rgba(21, 30, 46, 0.95)',
    borderRadius: SIZES.radius_lg - 1.5,
    padding: 18,
  },
  todayCard: {
    marginBottom: 20,
    padding: 20,
  },
  todayContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  todayLeft: {
    flex: 1,
    paddingRight: 12,
  },
  todayHeader: {
    color: '#8B5CF6',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  todayTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  todayGoalText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  quickStartChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius_md,
    alignSelf: 'flex-start',
  },
  quickStartChipText: {
    color: COLORS.success,
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginHorizontal: -4,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  statCardTime: {
    borderTopWidth: 3,
    borderTopColor: COLORS.accentCyan,
  },
  statCardVolume: {
    borderTopWidth: 3,
    borderTopColor: COLORS.primary,
  },
  statCardWorkouts: {
    borderTopWidth: 3,
    borderTopColor: COLORS.success,
  },
  statValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  emptyWorkoutBtn: {
    marginBottom: 24,
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
  sectionLink: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  templatesScroll: {
    marginBottom: 24,
  },
  templateCard: {
    width: 175,
    marginRight: 12,
    padding: 14,
    height: 130,
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
  },
  templateName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  templateMeta: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 4,
    marginBottom: 10,
  },
  templateBtn: {
    height: 30,
    borderRadius: SIZES.radius_sm,
  },
  logCard: {
    marginBottom: 12,
    padding: 14,
    backgroundColor: COLORS.card,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  logMeta: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  logDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    marginVertical: 10,
  },
  logExerciseItem: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
});
