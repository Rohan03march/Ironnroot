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
            <Flame size={16} color={COLORS.warning} />
            <Text style={styles.streakText}>{DEFAULT_USER.streakDays} Day Streak</Text>
          </View>
        </View>

        {/* Daily Summary Glass Card */}
        <Card style={styles.todayCard}>
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
                <Play size={10} color={COLORS.white} fill={COLORS.white} />
                <Text style={styles.quickStartChipText}>Up next: Leg Day</Text>
              </TouchableOpacity>
            </View>
            <CircularProgress
              size={110}
              strokeWidth={8}
              progress={8 / 12}
              label="8 / 12"
              subLabel="SETS DONE"
            />
          </View>
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Clock size={18} color={COLORS.accentCyan} />
            <Text style={styles.statValue}>188m</Text>
            <Text style={styles.statLabel}>Lifting Time</Text>
          </Card>

          <Card style={styles.statCard}>
            <Dumbbell size={18} color={COLORS.primary} />
            <Text style={styles.statValue}>7,360 kg</Text>
            <Text style={styles.statLabel}>Total Volume</Text>
          </Card>

          <Card style={styles.statCard}>
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

        {/* Templates horizontal list */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templatesScroll}>
          {DEFAULT_TEMPLATES.map((t) => (
            <Card key={t.id} style={styles.templateCard}>
              <Text style={styles.templateName} numberOfLines={1}>{t.name}</Text>
              <Text style={styles.templateMeta}>
                {t.exercisesCount} Exercises • {t.durationMin} mins
              </Text>
              <Button
                title="Start Routine"
                onPress={() => handleStartWorkout(t.id)}
                size="sm"
                variant="outline"
                style={styles.templateBtn}
              />
            </Card>
          ))}
        </ScrollView>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Logs</Text>
        {recentLogs.map((log) => (
          <Card key={log.id} style={styles.logCard}>
            <View style={styles.logHeader}>
              <View>
                <Text style={styles.logName}>{log.name}</Text>
                <Text style={styles.logMeta}>
                  {log.date} • {log.durationMin} mins • Volume: {log.totalVolumeKg}kg
                </Text>
              </View>
              <Dumbbell size={16} color={COLORS.primary} />
            </View>
            <View style={styles.logDivider} />
            {log.exercises.slice(0, 2).map((ex, idx) => (
              <Text key={idx} style={styles.logExerciseItem}>
                • {ex.exerciseName} ({ex.setsCount} sets • Best: {ex.bestSet})
              </Text>
            ))}
          </Card>
        ))}
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
    paddingBottom: 40,
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
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius_xl,
  },
  streakText: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
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
    paddingRight: 16,
  },
  todayHeader: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  todayTitle: {
    color: COLORS.white,
    fontSize: 18,
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius_md,
    alignSelf: 'flex-start',
  },
  quickStartChipText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 14,
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
    fontWeight: '500',
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
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    width: 170,
    marginRight: 12,
    padding: 14,
    height: 124,
    justifyContent: 'space-between',
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
  },
  logCard: {
    marginBottom: 12,
    padding: 14,
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
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  logExerciseItem: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
});
