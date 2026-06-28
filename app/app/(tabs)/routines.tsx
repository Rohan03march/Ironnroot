import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, SIZES } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import { DEFAULT_TEMPLATES, CUSTOM_TEMPLATES, WorkoutTemplate } from '../../constants/mockData';
import { Plus, Flame, Dumbbell, Clock, ChevronRight } from 'lucide-react-native';

export default function RoutinesTab() {
  const router = useRouter();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      setTemplates([...DEFAULT_TEMPLATES, ...CUSTOM_TEMPLATES]);
    }, [])
  );

  const handleStartWorkout = (templateId?: string) => {
    if (templateId) {
      router.push(`/active-workout?templateId=${templateId}`);
    } else {
      router.push('/active-workout');
    }
  };

  const getRoutineBorderColor = (id: string) => {
    switch (id) {
      case 'temp-push': return '#8B5CF6';
      case 'temp-pull': return '#00F2FE';
      case 'temp-legs': return '#10B981';
      default: return COLORS.primary;
    }
  };

  const getRoutineGradient = (id: string) => {
    switch (id) {
      case 'temp-push': return ['#8B5CF6', '#EC4899'] as const;
      case 'temp-pull': return ['#00F2FE', '#4FACFE'] as const;
      case 'temp-legs': return ['#10B981', '#059669'] as const;
      default: return ['#8B5CF6', '#EC4899'] as const;
    }
  };

  const getRoutineGlowColor = (id: string) => {
    switch (id) {
      case 'temp-push': return '#8B5CF6';
      case 'temp-pull': return '#00F2FE';
      case 'temp-legs': return '#10B981';
      default: return '#8B5CF6';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.routinesTab}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Workout Routines</Text>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push('/create-routine')}
              style={styles.headerAddBtn}
            >
              <Plus size={18} color="#8B5CF6" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>Select a routine to start tracking your session.</Text>

          {templates.map((t) => {
            const borderThemeColor = getRoutineBorderColor(t.id);
            const glowColor = getRoutineGlowColor(t.id);
            return (
              <Card 
                key={t.id} 
                style={[
                  styles.routineCard, 
                  { 
                    borderLeftWidth: 4, 
                    borderLeftColor: borderThemeColor,
                    shadowColor: glowColor,
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 4 },
                  }
                ]}
              >
                <View style={styles.routineInfo}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.routineName}>{t.name}</Text>
                    <ChevronRight size={16} color={COLORS.textMuted} />
                  </View>
                  <View style={styles.tagRow}>
                    <View style={[styles.tag, { backgroundColor: `${borderThemeColor}10` }]}>
                      <Clock size={10} color={borderThemeColor} style={{ marginRight: 4 }} />
                      <Text style={[styles.tagText, { color: borderThemeColor }]}>{t.durationMin} mins</Text>
                    </View>
                    <View style={[styles.tag, { backgroundColor: `${borderThemeColor}10` }]}>
                      <Dumbbell size={10} color={borderThemeColor} style={{ marginRight: 4 }} />
                      <Text style={[styles.tagText, { color: borderThemeColor }]}>{t.exercisesCount} Exercises</Text>
                    </View>
                    {t.lastPerformed ? (
                      <Text style={styles.lastPerformedText}>
                        Last: {t.lastPerformed}
                      </Text>
                    ) : t.createdAt ? (
                      <Text style={styles.lastPerformedText}>
                        Created: {t.createdAt}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <View style={styles.routineDivider} />
                <View style={styles.routineExercisesPreview}>
                  <Text style={styles.previewTitle}>Exercises In Routine:</Text>
                  {t.exercises.map((e, idx) => (
                    <View key={idx} style={styles.previewExerciseRow}>
                      <Dumbbell size={12} color={borderThemeColor} style={{ marginRight: 8, opacity: 0.8 }} />
                      <Text style={styles.previewExerciseText}>{e.exerciseName}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  onPress={() => handleStartWorkout(t.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.startBtnContainer,
                    { shadowColor: glowColor }
                  ]}
                >
                  <LinearGradient
                    colors={getRoutineGradient(t.id)}
                    style={styles.startBtnGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Flame size={14} color={COLORS.white} style={{ marginRight: 6 }} />
                    <Text style={styles.startBtnText}>Start Routine</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Card>
            );
          })}
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
  routinesTab: {
    width: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 20,
  },
  routineCard: {
    marginBottom: 16,
    padding: 16,
  },
  routineInfo: {
    marginBottom: 12,
  },
  routineName: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.radius_sm,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  lastPerformedText: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginLeft: 'auto',
  },
  routineDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 12,
  },
  routineExercisesPreview: {
    marginBottom: 16,
  },
  previewTitle: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewExerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  previewExerciseText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  startBtnContainer: {
    borderRadius: SIZES.radius_md,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  startBtnGradient: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  startBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  createCardWrapper: {
    marginBottom: 20,
    borderRadius: SIZES.radius_lg,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 6,
  },
  createCardGradient: {
    padding: 1.5,
    borderRadius: SIZES.radius_lg,
  },
  createCardInner: {
    backgroundColor: 'rgba(21, 30, 46, 0.95)',
    borderRadius: SIZES.radius_lg - 1.5,
    padding: 16,
  },
  createIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: COLORS.accentPink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  createTextContainer: {
    flex: 1,
  },
  createCardTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  createCardDesc: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  headerAddBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
