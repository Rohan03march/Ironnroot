import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import RestTimer from '../components/RestTimer';
import { LinearGradient } from 'expo-linear-gradient';
import { EXERCISES, DEFAULT_TEMPLATES, WorkoutExercise, SetLog, Exercise } from '../constants/mockData';
import { Clock, Plus, Trash2, Check, X, Search, ChevronRight, Dumbbell, ChevronDown, Edit2 } from 'lucide-react-native';

const CATEGORY_COLORS: Record<string, string> = {
  // Broad categories
  Chest: '#8B5CF6',
  Back: '#00F2FE',
  Legs: '#10B981',
  Shoulders: '#F59E0B',
  Arms: '#EC4899',
  Core: '#3B82F6',
  // Specific muscles
  'Upper Chest': '#A78BFA',
  'Lower Chest': '#7C3AED',
  Traps: '#06B6D4',
  Lats: '#0EA5E9',
  'Lower Back': '#0284C7',
  Rhomboids: '#0369A1',
  Quads: '#34D399',
  Hamstrings: '#059669',
  Glutes: '#D97706',
  Calves: '#92400E',
  Biceps: '#F472B6',
  Triceps: '#DB2777',
  Forearms: '#BE185D',
  Deltoids: '#FBBF24',
  'Front Delts': '#F59E0B',
  'Side Delts': '#D97706',
  'Rear Delts': '#B45309',
  Abs: '#60A5FA',
  Obliques: '#2563EB',
  'Hip Flexors': '#7C3AED',
  Adductors: '#16A34A',
  Abductors: '#15803D',
  'Full Body': '#6366F1',
  Cardio: '#EF4444',
};

const getExerciseColor = (category: string) => {
  return CATEGORY_COLORS[category] || '#8B5CF6';
};

const { width: windowWidth } = Dimensions.get('window');
const cardWidth = windowWidth - 32;

export default function ActiveWorkout() {
  const router = useRouter();
  const { templateId } = useLocalSearchParams<{ templateId?: string }>();
  const insets = useSafeAreaInsets();
  const scrollViewRefs = useRef<Record<string, any>>({});
  const titleInputRef = useRef<TextInput>(null);
  const [isKgMode, setIsKgMode] = useState(true);
  const [repsMode, setRepsMode] = useState<'reps' | 'range'>('reps');

  // Focus state for title editing
  const [isTitleFocused, setIsTitleFocused] = useState(false);

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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [filterSheetType, setFilterSheetType] = useState<'equipment' | 'muscle' | null>(null);

  const EQUIPMENT_OPTIONS = ['Barbell', 'Dumbbell', 'Kettlebell', 'Machine', 'Cable', 'Bodyweight', 'Plate', 'Resistance Band', 'Suspension Band', 'Others'];
  const MUSCLE_OPTIONS = [
    // Chest
    'Chest', 'Upper Chest', 'Lower Chest',
    // Back
    'Back', 'Lats', 'Traps', 'Rhomboids', 'Lower Back',
    // Shoulders
    'Shoulders', 'Front Delts', 'Side Delts', 'Rear Delts',
    // Arms
    'Biceps', 'Triceps', 'Forearms',
    // Legs
    'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Adductors', 'Abductors',
    // Core
    'Abs', 'Obliques', 'Hip Flexors',
    // Other
    'Full Body', 'Cardio',
  ];

  // Input Focus tracking for dynamic card borders
  const [focusedInput, setFocusedInput] = useState<{ exIdx: number; setIdx: number; field: 'weight' | 'reps' | 'minReps' | 'maxReps' } | null>(null);

  const handleSelectWeightUnit = () => {
    Alert.alert(
      'Select Weight Unit',
      'Choose your preferred logging unit for weight.',
      [
        { text: 'Kilograms (kg)', onPress: () => setIsKgMode(true) },
        { text: 'Pounds (lb)', onPress: () => setIsKgMode(false) },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleSelectRepsMode = () => {
    Alert.alert(
      'Select Reps Mode',
      'Choose how you want to log your repetitions.',
      [
        { text: 'Reps Count (numeric)', onPress: () => setRepsMode('reps') },
        { text: 'Reps Range (e.g. 8-12)', onPress: () => setRepsMode('range') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

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

    if (field === 'weight') {
      const numVal = parseFloat(value) || 0;
      if (!isKgMode) {
        targetSet.weight = numVal / 2.20462;
      } else {
        targetSet.weight = numVal;
      }
    } else if (field === 'reps') {
      targetSet.reps = value as any;
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
          const repsStr = set.reps ? set.reps.toString() : '';
          let repsNum = 0;
          if (repsStr.includes('-')) {
            const parts = repsStr.split('-');
            const min = parseInt(parts[0]) || 0;
            const max = parseInt(parts[1]) || 0;
            repsNum = min > 0 ? min : (max > 0 ? max : 0);
          } else {
            repsNum = parseInt(repsStr) || 0;
          }
          totalVolume += set.weight * repsNum;
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
  const modalFilteredExercises = EXERCISES.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEquipment = selectedEquipment ? ex.equipment === selectedEquipment : true;
    const matchesMuscle = selectedMuscle ? ex.category === selectedMuscle : true;
    return matchesSearch && matchesEquipment && matchesMuscle;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleCancelWorkout} style={styles.iconBtn}>
          <X size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitleText}>Log Workout</Text>
        </View>
        <TouchableOpacity onPress={handleFinishWorkout} style={styles.headerFinishBtn} activeOpacity={0.7}>
          <Text style={styles.headerFinishBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Session Header (Editable Title & Live Timer) */}
        <View style={styles.sessionHeader}>
          <View style={styles.sessionTitleRow}>
            <TextInput
              ref={titleInputRef}
              style={[
                styles.sessionTitleInput,
                isTitleFocused && styles.sessionTitleInputFocused
              ]}
              value={workoutName}
              onChangeText={setWorkoutName}
              placeholder="Workout Name"
              placeholderTextColor={COLORS.textMuted}
              selectTextOnFocus
              maxLength={25}
              onFocus={() => setIsTitleFocused(true)}
              onBlur={() => setIsTitleFocused(false)}
            />
            {!isTitleFocused && (
              <TouchableOpacity onPress={() => titleInputRef.current?.focus()} activeOpacity={0.7}>
                <Edit2 size={16} color={COLORS.primary} style={{ marginLeft: 6, marginTop: 4 }} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.sessionTimerContainer}>
            <Clock size={13} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
            <Text style={styles.sessionTimerText}>{formatTimer(seconds)}</Text>
          </View>
        </View>
        {activeExercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.glowSphere} />
            <View style={styles.emptyCardWrapper}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyCardGradient}
              >
                <View style={styles.emptyCardInner}>
                  <View style={styles.emptyIconContainer}>
                    <Dumbbell size={32} color={COLORS.primary} />
                  </View>
                  <Text style={styles.emptyTitle}>Custom Workout Session</Text>
                  <Text style={styles.emptyDesc}>
                    Design your session dynamically. Add exercises from the database, customize sets, reps, and track your lifting metrics in real time.
                  </Text>
                  <Button
                    title="Add Exercise"
                    onPress={() => setExerciseModalVisible(true)}
                    variant="primary"
                    icon={<Plus size={16} color={COLORS.white} />}
                    style={styles.emptyAddBtn}
                  />
                </View>
              </LinearGradient>
            </View>
          </View>
        ) : (
          <>
            {activeExercises.map((ex, exIdx) => {
              const accentColor = getExerciseColor(ex.category);
              return (
                <Card key={ex.id} style={[styles.exerciseCard, { borderLeftWidth: 4, borderLeftColor: accentColor }]}>
                  <View style={styles.exerciseHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                      <View style={[styles.exerciseBadge, { backgroundColor: `${accentColor}10` }]}>
                        <Text style={[styles.exerciseBadgeText, { color: accentColor }]}>{ex.category}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        const updated = [...activeExercises];
                        updated.splice(exIdx, 1);
                        setActiveExercises(updated);
                      }}
                      style={{ padding: 4 }}
                    >
                      <Trash2 size={16} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>

                  {/* Sets Table */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.colHeader, styles.colNum]}>Set</Text>
                    <TouchableOpacity
                      onPress={handleSelectWeightUnit}
                      style={[styles.colHeader, styles.colInput, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.colHeader}>Weight ({isKgMode ? 'kg' : 'lb'})</Text>
                      <ChevronDown size={10} color={COLORS.textSecondary} style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSelectRepsMode}
                      style={[styles.colHeader, styles.colInput, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.colHeader}>{repsMode === 'reps' ? 'Reps' : 'Reps Range'}</Text>
                      <ChevronDown size={10} color={COLORS.textSecondary} style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                    <Text style={[styles.colHeader, styles.colCheck]}></Text>
                  </View>

                  {ex.sets.map((set, setIdx) => {
                    const rowStyle = [
                      styles.setRow,
                      set.completed && styles.setRowCompleted,
                    ];

                    const isWeightFocused = focusedInput?.exIdx === exIdx && focusedInput?.setIdx === setIdx && focusedInput?.field === 'weight';
                    const isRepsFocused = focusedInput?.exIdx === exIdx && focusedInput?.setIdx === setIdx && focusedInput?.field === 'reps';
                    const isMinRepsFocused = focusedInput?.exIdx === exIdx && focusedInput?.setIdx === setIdx && focusedInput?.field === 'minReps';
                    const isMaxRepsFocused = focusedInput?.exIdx === exIdx && focusedInput?.setIdx === setIdx && focusedInput?.field === 'maxReps';

                    return (
                      <ScrollView
                        key={set.id}
                        ref={(ref) => {
                          if (ref) {
                            scrollViewRefs.current[set.id] = ref;
                          } else {
                            delete scrollViewRefs.current[set.id];
                          }
                        }}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToOffsets={[0, 72]}
                        decelerationRate="fast"
                        bounces={true}
                        scrollEventThrottle={16}
                        onScroll={(event) => {
                          const offsetX = event.nativeEvent.contentOffset.x;
                          if (offsetX < 0) {
                            scrollViewRefs.current[set.id]?.scrollTo({ x: 0, animated: false });
                          } else if (offsetX > 120) {
                            handleRemoveSet(exIdx, setIdx);
                          }
                        }}
                        style={styles.swipeRowContainer}
                        contentContainerStyle={{ alignItems: 'center' }}
                      >
                        <View style={[rowStyle, { width: cardWidth - 28 }]}>
                          <Text style={[styles.cellText, styles.colNum]}>{setIdx + 1}</Text>

                          <View style={styles.inputCol}>
                            <TextInput
                              style={[
                                styles.tableInput,
                                set.completed && styles.tableInputCompleted,
                                isWeightFocused && {
                                  borderColor: accentColor,
                                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                  shadowColor: accentColor,
                                  shadowOffset: { width: 0, height: 2 },
                                  shadowOpacity: 0.15,
                                  shadowRadius: 4,
                                  elevation: 2,
                                }
                              ]}
                              keyboardType="numeric"
                              value={
                                set.weight
                                  ? isKgMode
                                    ? Math.round(set.weight * 10) / 10 === 0
                                      ? ''
                                      : (Math.round(set.weight * 10) / 10).toString()
                                    : Math.round(set.weight * 2.20462 * 10) / 10 === 0
                                    ? ''
                                    : (Math.round(set.weight * 2.20462 * 10) / 10).toString()
                                  : ''
                              }
                              onChangeText={(val) => handleUpdateSet(exIdx, setIdx, 'weight', val)}
                              placeholder="0"
                              placeholderTextColor={COLORS.textMuted}
                              editable={!set.completed}
                              onFocus={() => setFocusedInput({ exIdx, setIdx, field: 'weight' })}
                              onBlur={() => setFocusedInput(null)}
                            />
                            {set.weight > 0 && (
                              <Text style={styles.conversionText}>
                                {isKgMode
                                  ? `${Math.round(set.weight * 2.20462 * 10) / 10} lb`
                                  : `${Math.round(set.weight * 10) / 10} kg`}
                              </Text>
                            )}
                          </View>

                          <View style={styles.inputCol}>
                            {repsMode === 'reps' ? (
                              <TextInput
                                style={[
                                  styles.tableInput,
                                  set.completed && styles.tableInputCompleted,
                                  isRepsFocused && {
                                    borderColor: accentColor,
                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    shadowColor: accentColor,
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 4,
                                    elevation: 2,
                                  }
                                ]}
                                keyboardType="numeric"
                                value={set.reps ? set.reps.toString() : ''}
                                onChangeText={(val) => handleUpdateSet(exIdx, setIdx, 'reps', val)}
                                placeholder="0"
                                placeholderTextColor={COLORS.textMuted}
                                editable={!set.completed}
                                onFocus={() => setFocusedInput({ exIdx, setIdx, field: 'reps' })}
                                onBlur={() => setFocusedInput(null)}
                              />
                            ) : (
                              <View style={styles.rangeInputContainer}>
                                <TextInput
                                  style={[
                                    styles.tableInputRange,
                                    set.completed && styles.tableInputCompleted,
                                    isMinRepsFocused && {
                                      borderColor: accentColor,
                                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    }
                                  ]}
                                  keyboardType="numeric"
                                  value={
                                    set.reps
                                      ? set.reps.toString().includes('-')
                                        ? set.reps.toString().split('-')[0]
                                        : set.reps.toString()
                                      : ''
                                  }
                                  onChangeText={(val) => {
                                    const maxVal = set.reps && set.reps.toString().includes('-') ? set.reps.toString().split('-')[1] : '';
                                    handleUpdateSet(exIdx, setIdx, 'reps', maxVal ? `${val}-${maxVal}` : val);
                                  }}
                                  placeholder="Min"
                                  placeholderTextColor={COLORS.textMuted}
                                  editable={!set.completed}
                                  onFocus={() => setFocusedInput({ exIdx, setIdx, field: 'minReps' })}
                                  onBlur={() => setFocusedInput(null)}
                                />
                                <Text style={styles.rangeDash}>-</Text>
                                <TextInput
                                  style={[
                                    styles.tableInputRange,
                                    set.completed && styles.tableInputCompleted,
                                    isMaxRepsFocused && {
                                      borderColor: accentColor,
                                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    }
                                  ]}
                                  keyboardType="numeric"
                                  value={
                                    set.reps && set.reps.toString().includes('-')
                                      ? set.reps.toString().split('-')[1]
                                      : ''
                                  }
                                  onChangeText={(val) => {
                                    const minVal = set.reps
                                      ? set.reps.toString().includes('-')
                                        ? set.reps.toString().split('-')[0]
                                        : set.reps.toString()
                                      : '0';
                                    handleUpdateSet(exIdx, setIdx, 'reps', val ? `${minVal}-${val}` : minVal);
                                  }}
                                  placeholder="Max"
                                  placeholderTextColor={COLORS.textMuted}
                                  editable={!set.completed}
                                  onFocus={() => setFocusedInput({ exIdx, setIdx, field: 'maxReps' })}
                                  onBlur={() => setFocusedInput(null)}
                                />
                              </View>
                            )}
                            {set.weight > 0 && (
                              <Text style={[styles.conversionText, { opacity: 0 }]} numberOfLines={1}>
                                spacer
                              </Text>
                            )}
                          </View>

                          <View style={styles.colCheck}>
                            <TouchableOpacity
                              onPress={() => handleUpdateSet(exIdx, setIdx, 'completed', null)}
                              style={[
                                styles.checkContainer,
                                set.completed ? styles.checkContainerCompleted : styles.checkContainerPending
                              ]}
                              activeOpacity={0.8}
                            >
                              <Check
                                size={13}
                                color={set.completed ? COLORS.white : 'rgba(255, 255, 255, 0.45)'}
                                strokeWidth={3.5}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <TouchableOpacity
                          onPress={() => handleRemoveSet(exIdx, setIdx)}
                          style={styles.swipeDeleteContainer}
                          activeOpacity={0.8}
                        >
                          <Trash2 size={16} color={COLORS.white} />
                        </TouchableOpacity>
                      </ScrollView>
                    );
                  })}

                  <TouchableOpacity
                    onPress={() => handleAddSet(exIdx)}
                    style={[styles.addSetRow, { backgroundColor: `${accentColor}06`, borderColor: `${accentColor}12`, borderWidth: 1 }]}
                    activeOpacity={0.7}
                  >
                    <Plus size={14} color={accentColor} style={{ marginRight: 6 }} />
                    <Text style={[styles.addSetText, { color: accentColor }]}>Add Set</Text>
                  </TouchableOpacity>
                </Card>
              );
            })}

            <Button
              title="Add Exercise"
              onPress={() => setExerciseModalVisible(true)}
              variant="outline"
              icon={<Plus size={16} color={COLORS.primary} />}
              style={styles.addExerciseBtn}
            />
          </>
        )}
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
        onRequestClose={() => {
          setExerciseModalVisible(false);
          setSelectedEquipment(null);
          setSelectedMuscle(null);
          setSearchQuery('');
        }}
        statusBarTranslucent
      >
        <View style={[styles.modalContainer, { paddingTop: Math.max(insets.top, 16), paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Exercise</Text>
            <TouchableOpacity onPress={() => {
              setExerciseModalVisible(false);
              setSelectedEquipment(null);
              setSelectedMuscle(null);
              setSearchQuery('');
            }}>
              <X size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.modalSearch, isSearchFocused && styles.modalSearchFocused]}>
            <Search size={18} color={isSearchFocused ? COLORS.primary : COLORS.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.modalSearchInput}
              placeholder="Search exercise..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
          </View>


          {/* Filter Pill Buttons */}
          <View style={styles.filterPillRow}>
            <TouchableOpacity
              onPress={() => setFilterSheetType('equipment')}
              style={[styles.filterPill, selectedEquipment && styles.filterPillActive]}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterPillText, selectedEquipment && styles.filterPillTextActive]}>
                {selectedEquipment ?? 'Equipment'}
              </Text>
              <ChevronDown size={12} color={selectedEquipment ? COLORS.primary : COLORS.textSecondary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilterSheetType('muscle')}
              style={[styles.filterPill, selectedMuscle && styles.filterPillActive]}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterPillText, selectedMuscle && styles.filterPillTextActive]}>
                {selectedMuscle ?? 'Muscles'}
              </Text>
              <ChevronDown size={12} color={selectedMuscle ? COLORS.primary : COLORS.textSecondary} style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            {(selectedEquipment || selectedMuscle) && (
              <TouchableOpacity
                onPress={() => { setSelectedEquipment(null); setSelectedMuscle(null); }}
                style={styles.filterClearBtn}
                activeOpacity={0.7}
              >
                <X size={11} color={COLORS.textSecondary} style={{ marginRight: 3 }} />
                <Text style={styles.filterClearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView contentContainerStyle={styles.modalList}>
            {modalFilteredExercises.map((ex) => {
              const badgeColor = getExerciseColor(ex.category);
              return (
                <TouchableOpacity
                  key={ex.id}
                  onPress={() => handleSelectExercise(ex)}
                  style={styles.modalListItem}
                  activeOpacity={0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemName}>{ex.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                      <View style={[styles.modalBadge, { backgroundColor: `${badgeColor}12` }]}>
                        <Text style={[styles.modalBadgeText, { color: badgeColor }]}>{ex.category}</Text>
                      </View>
                      <Text style={styles.modalItemSub}> • {ex.equipment}</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Filter Bottom Sheet — inline absolute overlay inside this modal */}
          {filterSheetType !== null && (
            <View style={styles.sheetOverlay}>
              <TouchableOpacity
                style={styles.sheetBackdrop}
                activeOpacity={1}
                onPress={() => setFilterSheetType(null)}
              />
              <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={styles.sheetHandle} />
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>
                    {filterSheetType === 'equipment' ? 'Equipment' : 'Muscles'}
                  </Text>
                  <TouchableOpacity onPress={() => setFilterSheetType(null)}>
                    <X size={18} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                  {(filterSheetType === 'equipment' ? EQUIPMENT_OPTIONS : MUSCLE_OPTIONS).map((option) => {
                    const isEquipment = filterSheetType === 'equipment';
                    const isSelected = isEquipment ? selectedEquipment === option : selectedMuscle === option;
                    const dotColor = !isEquipment ? (CATEGORY_COLORS[option] || COLORS.primary) : null;
                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => {
                          if (isEquipment) setSelectedEquipment(isSelected ? null : option);
                          else setSelectedMuscle(isSelected ? null : option);
                          setFilterSheetType(null);
                        }}
                        style={[styles.sheetItem, isSelected && styles.sheetItemSelected]}
                        activeOpacity={0.7}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                          {dotColor && <View style={[styles.sheetDot, { backgroundColor: dotColor }]} />}
                          <Text style={[styles.sheetItemText, isSelected && styles.sheetItemTextSelected]}>
                            {option}
                          </Text>
                        </View>
                        {isSelected && <Check size={15} color={COLORS.primary} strokeWidth={3} />}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          )}
        </View>
      </Modal>



      <Modal
        visible={showSuccessSplash}
        animationType="fade"
        transparent
        statusBarTranslucent
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
                <Text style={styles.successStatVal}>
                  {isKgMode
                    ? `${Math.round(summaryStats.volume)} kg`
                    : `${Math.round(summaryStats.volume * 2.20462)} lb`}
                </Text>
              </View>
              <View style={styles.successStat}>
                <Text style={styles.successStatLabel}>Sets</Text>
                <Text style={styles.successStatVal}>{summaryStats.sets}</Text>
              </View>
            </View>

            <Button
              title="Save & Close"
              onPress={handleFinishConfirm}
              variant="success"
              style={styles.successBtn}
            />
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
  headerTitleText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  sessionHeader: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sessionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionTitleInput: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
    borderBottomWidth: 1.5,
    borderBottomColor: 'transparent',
    paddingVertical: 2,
    maxWidth: '85%',
  },
  sessionTitleInputFocused: {
    borderBottomColor: COLORS.primary,
  },
  sessionTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  sessionTimerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  headerFinishBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  headerFinishBtnText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '700',
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
    width: 30,
    textAlign: 'center',
  },
  colInput: {
    flex: 1,
    textAlign: 'center',
  },
  inputCol: {
    flex: 1,
    alignItems: 'center',
  },
  colCheck: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeRowContainer: {
    backgroundColor: COLORS.error,
    borderRadius: SIZES.radius_sm,
    marginBottom: 6,
    overflow: 'hidden',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: SIZES.radius_sm,
    backgroundColor: COLORS.card,
  },
  setRowCompleted: {
    backgroundColor: '#102622',
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
  tableInputCompleted: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    color: COLORS.textSecondary,
    opacity: 0.8,
  },
  checkContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkContainerPending: {
    borderColor: 'rgba(255, 255, 255, 0.45)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  checkContainerCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  swipeDeleteContainer: {
    width: 64,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conversionText: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  rangeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '95%',
    height: 32,
  },
  tableInputRange: {
    backgroundColor: COLORS.cardHeader,
    color: COLORS.text,
    width: '44%',
    height: 32,
    borderRadius: 6,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rangeDash: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 2,
  },
  unitTogglePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  unitToggleText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
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
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.02)',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    position: 'relative',
  },
  glowSphere: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#8B5CF6',
    opacity: 0.08,
  },
  emptyCardWrapper: {
    width: '100%',
    borderRadius: SIZES.radius_lg,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyCardGradient: {
    padding: 1.5,
    borderRadius: SIZES.radius_lg,
  },
  emptyCardInner: {
    backgroundColor: 'rgba(21, 30, 46, 0.95)',
    borderRadius: SIZES.radius_lg - 1.5,
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyAddBtn: {
    width: '80%',
    borderRadius: 24,
  },
  exerciseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
    overflow: 'hidden',
  },
  exerciseBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
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
  modalSearchFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
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
  },
  modalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
    overflow: 'hidden',
  },
  modalBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  // Filter pill buttons
  filterPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  filterPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  filterPillActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderColor: COLORS.primary,
  },
  filterPillText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  filterClearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  filterClearText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  // Bottom Sheet (Dropup) styles
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(5, 7, 12, 0.65)',
    zIndex: 99,
  },
  sheetBackdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  sheetItemSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  sheetItemText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  sheetItemTextSelected: {
    color: COLORS.text,
    fontWeight: '700',
  },
  sheetDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: 10,
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
    borderRadius: 24,
  },
});
