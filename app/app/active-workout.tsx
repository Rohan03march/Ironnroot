import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import RestTimer from '../components/RestTimer';
import { EXERCISES, DEFAULT_TEMPLATES, WorkoutExercise, SetLog, Exercise } from '../constants/mockData';
import { Clock, Plus, Trash2, Check, X, Search, ChevronRight } from 'lucide-react-native';

export default function ActiveWorkout() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  
  // Timer States
  const [seconds, setSeconds] = useState(0);
  
  // Workout State
  const [workoutName, setWorkoutName] = useState('Empty Workout');
  const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>([]);
  
  // Modals / Rest timer triggers
  const [restTimerVisible, setRestTimerVisible] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Finished success splash
  const [showSuccessSplash, setShowSuccessSplash] = useState(false);
  const [summaryStats, setSummaryStats] = useState({ duration: '', volume: 0, sets: 0 });

  // Initialize workout based on template or empty
  useEffect(() => {
    if (templateId) {
      const template = DEFAULT_TEMPLATES.find((t) => t.id === templateId);
      if (template) {
        setWorkoutName(template.name);
        
        // Deep clone template exercises to keep state local
        const clonedExercises = template.exercises.map((ex) => ({
          ...ex,
          sets: ex.sets.map((s) => ({ ...s, completed: false })),
        }));
        
        setActiveExercises(clonedExercises);
      }
    } else {
      setWorkoutName('Custom Session');
    }
  }, [templateId]);

  // Session timer hook
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Set management
  const handleUpdateSet = (exerciseIndex: number, setIndex: number, field: keyof SetLog, value: any) => {
    const updated = [...activeExercises];
    const targetSet = updated[exerciseIndex].sets[setIndex];
    
    if (field === 'weight' || field === 'reps') {
      const numVal = parseFloat(value) || 0;
      targetSet[field] = numVal as never;
    } else if (field === 'completed') {
      const nextVal = !targetSet.completed;
      targetSet.completed = nextVal;
      
      // Trigger rest timer when a set is completed
      if (nextVal) {
        setRestDuration(90); // default rest duration
        setRestTimerVisible(true);
      }
    }
    setActiveExercises(updated);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...activeExercises];
    const sets = updated[exerciseIndex].sets;
    const lastSet = sets[sets.length - 1];
    
    const newSet: SetLog = {
      id: `${updated[exerciseIndex].id}-s-${sets.length + 1}-${Date.now()}`,
      weight: lastSet ? lastSet.weight : 20,
      reps: lastSet ? lastSet.reps : 10,
      completed: false,
      previous: lastSet ? `${lastSet.weight}kg x ${lastSet.reps}` : undefined,
    };
    
    sets.push(newSet);
    setActiveExercises(updated);
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...activeExercises];
    updated[exerciseIndex].sets.splice(setIndex, 1);
    
    // If no sets remaining, optionally delete exercise or keep empty list
    if (updated[exerciseIndex].sets.length === 0) {
      updated.splice(exerciseIndex, 1);
    }
    
    setActiveExercises(updated);
  };

  // Add exercise to workout
  const handleSelectExercise = (exercise: Exercise) => {
    setExerciseModalVisible(false);
    
    // Check if exercise already added
    if (activeExercises.some((e) => e.exerciseId === exercise.id)) {
      Alert.alert('Exercise added', `${exercise.name} is already in your active workout.`);
      return;
    }

    const newWorkoutExercise: WorkoutExercise = {
      id: `active-${exercise.id}-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      sets: [
        { id: `ae-s1-${Date.now()}`, weight: 20, reps: 10, completed: false }
      ]
    };

    setActiveExercises([...activeExercises, newWorkoutExercise]);
  };

  const handleCancelWorkout = () => {
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to discard this workout? All progress will be lost.',
      [
        { text: 'Keep Tracking', style: 'cancel' },
        { text: 'Discard Workout', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const handleFinishWorkout = () => {
    if (activeExercises.length === 0) {
      Alert.alert('Empty Workout', 'Add at least one exercise to log your workout.');
      return;
    }

    // Calculate Summary stats
    let totalVolume = 0;
    let totalSets = 0;
    
    activeExercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed) {
          totalVolume += set.weight * set.reps;
          totalSets += 1;
        }
      });
    });

    if (totalSets === 0) {
      Alert.alert('No Sets Logged', 'Complete and check at least one set to finish.');
      return;
    }

    setSummaryStats({
      duration: formatTimer(seconds),
      volume: totalVolume,
      sets: totalSets,
    });
    
    setShowSuccessSplash(true);
  };

  const handleFinishConfirm = () => {
    setShowSuccessSplash(false);
    router.replace('/(tabs)');
  };

  // Filter exercises in selection modal
  const modalFilteredExercises = EXERCISES.filter((ex) =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleCancelWorkout} style={styles.iconBtn}>
          <X size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.workoutTitle} numberOfLines={1}>{workoutName}</Text>
          <View style={styles.timerRow}>
            <Clock size={12} color={COLORS.primary} style={{ marginRight: 4 }} />
            <Text style={styles.timerText}>{formatTimer(seconds)}</Text>
          </View>
        </View>
        <Button title="Finish" onPress={handleFinishWorkout} variant="primary" size="sm" style={styles.finishBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeExercises.map((ex, exIdx) => (
          <Card key={ex.id} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View>
                <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                <Text style={styles.exerciseCat}>{ex.category}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  const updated = [...activeExercises];
                  updated.splice(exIdx, 1);
                  setActiveExercises(updated);
                }}
              >
                <Trash2 size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Sets Table */}
            <View style={styles.tableHeader}>
              <Text style={[styles.colHeader, styles.colNum]}>Set</Text>
              <Text style={[styles.colHeader, styles.colPrev]}>Previous</Text>
              <Text style={[styles.colHeader, styles.colInput]}>Weight</Text>
              <Text style={[styles.colHeader, styles.colInput]}>Reps</Text>
              <Text style={[styles.colHeader, styles.colCheck]}></Text>
            </View>

            {ex.sets.map((set, setIdx) => {
              const rowStyle = [
                styles.setRow,
                set.completed && styles.setRowCompleted,
              ];

              return (
                <View key={set.id} style={rowStyle}>
                  <Text style={[styles.cellText, styles.colNum]}>{setIdx + 1}</Text>
                  
                  <Text style={[styles.cellText, styles.colPrev, styles.mutedCell]}>
                    {set.previous || '--'}
                  </Text>
                  
                  <View style={styles.colInput}>
                    <TextInput
                      style={styles.tableInput}
                      keyboardType="numeric"
                      value={set.weight ? set.weight.toString() : ''}
                      onChangeText={(val) => handleUpdateSet(exIdx, setIdx, 'weight', val)}
                      placeholder="0"
                      placeholderTextColor={COLORS.textMuted}
                      editable={!set.completed}
                    />
                  </View>
                  
                  <View style={styles.colInput}>
                    <TextInput
                      style={styles.tableInput}
                      keyboardType="numeric"
                      value={set.reps ? set.reps.toString() : ''}
                      onChangeText={(val) => handleUpdateSet(exIdx, setIdx, 'reps', val)}
                      placeholder="0"
                      placeholderTextColor={COLORS.textMuted}
                      editable={!set.completed}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => handleUpdateSet(exIdx, setIdx, 'completed', null)}
                    style={[
                      styles.checkContainer,
                      styles.colCheck,
                      set.completed && styles.checkContainerCompleted,
                    ]}
                  >
                    {set.completed && <Check size={14} color={COLORS.white} />}
                  </TouchableOpacity>

                  {!set.completed && (
                    <TouchableOpacity
                      onPress={() => handleRemoveSet(exIdx, setIdx)}
                      style={styles.rowDelete}
                    >
                      <Trash2 size={12} color={COLORS.error} />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              onPress={() => handleAddSet(exIdx)}
              style={styles.addSetRow}
            >
              <Plus size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
              <Text style={styles.addSetText}>Add Set</Text>
            </TouchableOpacity>
          </Card>
        ))}

        <Button
          title="Add Exercise"
          onPress={() => setExerciseModalVisible(true)}
          variant="outline"
          icon={<Plus size={16} color={COLORS.primary} />}
          style={styles.addExerciseBtn}
        />
      </ScrollView>

      {/* Rest Timer Modal */}
      <RestTimer
        visible={restTimerVisible}
        initialSeconds={restDuration}
        onClose={() => setRestTimerVisible(false)}
      />

      {/* Add Exercise Modal selection */}
      <Modal
        visible={exerciseModalVisible}
        animationType="slide"
        onRequestClose={() => setExerciseModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Exercise</Text>
            <TouchableOpacity onPress={() => setExerciseModalVisible(false)}>
              <X size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalSearch}>
            <Search size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search exercise..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <ScrollView contentContainerStyle={styles.modalList}>
            {modalFilteredExercises.map((ex) => (
              <TouchableOpacity
                key={ex.id}
                onPress={() => handleSelectExercise(ex)}
                style={styles.modalListItem}
              >
                <View>
                  <Text style={styles.modalItemName}>{ex.name}</Text>
                  <Text style={styles.modalItemSub}>{ex.category} • {ex.equipment}</Text>
                </View>
                <ChevronRight size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Success Completion Modal Splash */}
      <Modal
        visible={showSuccessSplash}
        animationType="fade"
        transparent
      >
        <View style={styles.successOverlay}>
          <Card style={styles.successCard}>
            <View style={styles.successIconOuter}>
              <Check size={36} color={COLORS.white} />
            </View>
            <Text style={styles.successTitle}>Workout Completed!</Text>
            <Text style={styles.successSub}>Awesome job, Rohan! You killed it.</Text>

            <View style={styles.successStatsBox}>
              <View style={styles.successStat}>
                <Text style={styles.successStatLabel}>Time</Text>
                <Text style={styles.successStatVal}>{summaryStats.duration}</Text>
              </View>
              <View style={styles.successStat}>
                <Text style={styles.successStatLabel}>Volume</Text>
                <Text style={styles.successStatVal}>{summaryStats.volume} kg</Text>
              </View>
              <View style={styles.successStat}>
                <Text style={styles.successStatLabel}>Sets</Text>
                <Text style={styles.successStatVal}>{summaryStats.sets}</Text>
              </View>
            </View>

            <Button title="Save & Close" onPress={handleFinishConfirm} style={styles.successBtn} />
          </Card>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  iconBtn: {
    padding: 6,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  workoutTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timerText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  finishBtn: {
    paddingHorizontal: 12,
    height: 32,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  exerciseCard: {
    marginBottom: 16,
    padding: 14,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exerciseName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  exerciseCat: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
    marginBottom: 8,
  },
  colHeader: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  colNum: {
    width: 25,
    textAlign: 'center',
  },
  colPrev: {
    flex: 2,
    paddingLeft: 6,
  },
  colInput: {
    flex: 1.5,
    alignItems: 'center',
  },
  colCheck: {
    width: 36,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: SIZES.radius_sm,
    marginBottom: 4,
    position: 'relative',
  },
  setRowCompleted: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  cellText: {
    color: COLORS.text,
    fontSize: 13,
  },
  mutedCell: {
    color: COLORS.textSecondary,
  },
  tableInput: {
    backgroundColor: COLORS.cardHeader,
    color: COLORS.text,
    width: '85%',
    height: 32,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkContainer: {
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkContainerCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  rowDelete: {
    position: 'absolute',
    right: -12,
    padding: 6,
  },
  addSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: SIZES.radius_sm,
  },
  addSetText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  addExerciseBtn: {
    marginTop: 8,
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_md,
    margin: 16,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalSearchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  modalList: {
    paddingHorizontal: 16,
  },
  modalListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  modalItemSub: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  successIconOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  successTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  successSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  successStatsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: COLORS.cardHeader,
    borderRadius: SIZES.radius_md,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  successStat: {
    flex: 1,
    alignItems: 'center',
  },
  successStatLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  successStatVal: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  successBtn: {
    width: '100%',
  },
});
