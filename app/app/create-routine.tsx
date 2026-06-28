import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Dimensions, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../constants/theme';
import Card from '../components/Card';
import Button from '../components/Button';
import { LinearGradient } from 'expo-linear-gradient';
import { EXERCISES, WorkoutExercise, SetLog, Exercise, addCustomTemplate } from '../constants/mockData';
import { Plus, Trash2, Check, X, Search, ChevronRight, Dumbbell, ChevronDown, Edit2 } from 'lucide-react-native';

const CATEGORY_COLORS: Record<string, string> = {
  Chest: '#8B5CF6',
  Back: '#00F2FE',
  Legs: '#10B981',
  Shoulders: '#F59E0B',
  Arms: '#EC4899',
  Core: '#3B82F6',
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

const EXERCISE_IMAGES: Record<string, string> = {
  Chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=100&auto=format&fit=crop&q=60',
  Back: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=100&auto=format&fit=crop&q=60',
  Legs: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=100&auto=format&fit=crop&q=60',
  Shoulders: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=100&auto=format&fit=crop&q=60',
  Arms: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=100&auto=format&fit=crop&q=60',
  Core: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&auto=format&fit=crop&q=60',
};

const getExerciseColor = (category: string) => {
  return CATEGORY_COLORS[category] || '#8B5CF6';
};

const { width: windowWidth } = Dimensions.get('window');
const cardWidth = windowWidth - 32;

export default function CreateRoutine() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollViewRefs = useRef<Record<string, any>>({});
  const titleInputRef = useRef<TextInput>(null);
  const [isKgMode, setIsKgMode] = useState(true);
  const [repsMode, setRepsMode] = useState<'reps' | 'range'>('reps');

  // Focus state for title editing
  const [isTitleFocused, setIsTitleFocused] = useState(false);

  // Routine State
  const [routineName, setRoutineName] = useState('Custom Routine');
  const [activeExercises, setActiveExercises] = useState<WorkoutExercise[]>([]);

  // Modals / Rest timer triggers
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [filterSheetType, setFilterSheetType] = useState<'equipment' | 'muscle' | null>(null);

  const EQUIPMENT_OPTIONS = ['Barbell', 'Dumbbell', 'Kettlebell', 'Machine', 'Cable', 'Bodyweight', 'Plate', 'Resistance Band', 'Suspension Band', 'Others'];
  const MUSCLE_OPTIONS = [
    'Chest', 'Upper Chest', 'Lower Chest',
    'Back', 'Lats', 'Traps', 'Rhomboids', 'Lower Back',
    'Shoulders', 'Front Delts', 'Side Delts', 'Rear Delts',
    'Biceps', 'Triceps', 'Forearms',
    'Legs', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Adductors', 'Abductors',
    'Abs', 'Obliques', 'Hip Flexors',
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

  // Created success splash
  const [showSuccessSplash, setShowSuccessSplash] = useState(false);
  const [summaryStats, setSummaryStats] = useState({ sets: 0 });

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

    if (updated[exerciseIndex].sets.length === 0) {
      updated.splice(exerciseIndex, 1);
    }

    setActiveExercises(updated);
  };

  const toggleSelectExercise = (id: string) => {
    setTempSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirmMultiSelect = () => {
    if (tempSelectedIds.length === 0) {
      setExerciseModalVisible(false);
      return;
    }

    const exercisesToAdd = EXERCISES.filter((ex) => tempSelectedIds.includes(ex.id));

    const newWorkoutExercises: WorkoutExercise[] = exercisesToAdd.map((exercise) => ({
      id: `active-${exercise.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      category: exercise.category,
      sets: [
        { id: `ae-s1-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`, weight: 20, reps: 10, completed: false }
      ]
    }));

    // Filter duplicates
    const duplicatesFiltered = newWorkoutExercises.filter(
      (ne) => !activeExercises.some((ae) => ae.exerciseId === ne.exerciseId)
    );

    if (duplicatesFiltered.length > 0) {
      setActiveExercises([...activeExercises, ...duplicatesFiltered]);
    }

    setExerciseModalVisible(false);
    setTempSelectedIds([]);
    setSelectedEquipment(null);
    setSelectedMuscle(null);
    setSearchQuery('');
  };

  const handleCancelRoutine = () => {
    Alert.alert(
      'Cancel Routine',
      'Are you sure you want to discard this routine? All changes will be lost.',
      [
        { text: 'Keep Editing', style: 'cancel' },
        { text: 'Discard Routine', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const handleFinishRoutine = () => {
    if (activeExercises.length === 0) {
      Alert.alert('Empty Routine', 'Add at least one exercise to save your routine.');
      return;
    }

    const totalSets = activeExercises.reduce((acc, ex) => acc + ex.sets.length, 0);

    setSummaryStats({
      sets: totalSets,
    });

    setShowSuccessSplash(true);
  };

  const handleFinishConfirm = () => {
    // Construct new WorkoutTemplate
    const newTemplate = {
      id: `custom-routine-${Date.now()}`,
      name: routineName || 'Custom Routine',
      durationMin: activeExercises.length * 10, // Estimate 10 mins per exercise
      exercisesCount: activeExercises.length,
      exercises: activeExercises,
      createdAt: new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD
    };

    // Save to global storage
    addCustomTemplate(newTemplate);

    setShowSuccessSplash(false);
    router.replace('/(tabs)/routines');
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
        <TouchableOpacity onPress={handleCancelRoutine} style={styles.iconBtn}>
          <X size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitleText}>Create Routine</Text>
        </View>
        <TouchableOpacity onPress={handleFinishRoutine} style={styles.headerFinishBtn} activeOpacity={0.7}>
          <Text style={styles.headerFinishBtnText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Session Header (Editable Title) */}
        <View style={styles.sessionHeader}>
          <View style={styles.sessionTitleRow}>
            <TextInput
              ref={titleInputRef}
              style={[
                styles.sessionTitleInput,
                isTitleFocused && styles.sessionTitleInputFocused
              ]}
              value={routineName}
              onChangeText={setRoutineName}
              placeholder="Routine Name"
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
                  <Text style={styles.emptyTitle}>Custom Workout Routine</Text>
                  <Text style={styles.emptyDesc}>
                    Design your new routine. Add exercises, define target sets and reps, and save it as a template for future workouts.
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => setExerciseModalVisible(true)}
                    style={[styles.customAddExerciseBtn, { marginTop: 20, marginBottom: 0, width: '90%' }]}
                  >
                    <Plus size={16} color={COLORS.white} style={{ marginRight: 6 }} />
                    <Text style={styles.customAddExerciseText}>Add Exercise</Text>
                  </TouchableOpacity>
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
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => router.push(`/exercise-detail?id=${ex.exerciseId}`)}
                      style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Image
                        source={{ uri: EXERCISE_IMAGES[ex.category] || EXERCISE_IMAGES.Chest }}
                        style={styles.exerciseCardImage}
                      />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.exerciseName}>{ex.exerciseName}</Text>
                          <ChevronRight size={14} color={COLORS.textMuted} style={{ marginLeft: 4 }} />
                        </View>
                        <View style={[styles.exerciseBadge, { backgroundColor: `${accentColor}10` }]}>
                          <Text style={[styles.exerciseBadgeText, { color: accentColor }]}>{ex.category}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
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
                      style={[styles.colInput, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.colHeader}>Weight ({isKgMode ? 'kg' : 'lb'})</Text>
                      <ChevronDown size={10} color={COLORS.textSecondary} style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleSelectRepsMode}
                      style={[styles.colInput, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }]}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.colHeader}>{repsMode === 'reps' ? 'Reps' : 'Reps Range'}</Text>
                      <ChevronDown size={10} color={COLORS.textSecondary} style={{ marginLeft: 3 }} />
                    </TouchableOpacity>
                  </View>

                  {ex.sets.map((set, setIdx) => {
                    const rowStyle = [
                      styles.setRow,
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
                                onFocus={() => setFocusedInput({ exIdx, setIdx, field: 'reps' })}
                                onBlur={() => setFocusedInput(null)}
                              />
                            ) : (
                              <View style={styles.rangeInputContainer}>
                                <TextInput
                                  style={[
                                    styles.tableInputRange,
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
                                  onFocus={() => setFocusedInput({ exIdx, setIdx, field: 'minReps' })}
                                  onBlur={() => setFocusedInput(null)}
                                />
                                <Text style={styles.rangeDash}>-</Text>
                                <TextInput
                                  style={[
                                    styles.tableInputRange,
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

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => setExerciseModalVisible(true)}
              style={styles.customAddExerciseBtn}
            >
              <Plus size={16} color={COLORS.white} style={{ marginRight: 6 }} />
              <Text style={styles.customAddExerciseText}>Add Exercise</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Add Exercise Modal selection */}
      <Modal
        visible={exerciseModalVisible}
        animationType="slide"
        onRequestClose={() => {
          setExerciseModalVisible(false);
          setTempSelectedIds([]);
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
              setTempSelectedIds([]);
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

          <ScrollView contentContainerStyle={[styles.modalList, { paddingBottom: tempSelectedIds.length > 0 ? 100 : 24 }]}>
            {modalFilteredExercises.map((ex) => {
              const badgeColor = getExerciseColor(ex.category);
              const isAlreadyAdded = activeExercises.some((ae) => ae.exerciseId === ex.id);
              const isSelected = tempSelectedIds.includes(ex.id);
              return (
                <TouchableOpacity
                  key={ex.id}
                  onPress={() => {
                    if (!isAlreadyAdded) {
                      toggleSelectExercise(ex.id);
                    }
                  }}
                  style={[
                    styles.modalListItem,
                    isSelected && styles.modalListItemSelected,
                    isAlreadyAdded && styles.modalListItemAdded
                  ]}
                  activeOpacity={isAlreadyAdded ? 1 : 0.8}
                >
                  <Image
                    source={{ uri: EXERCISE_IMAGES[ex.category] || EXERCISE_IMAGES.Chest }}
                    style={styles.modalItemImage}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modalItemName, isAlreadyAdded && styles.modalItemNameAdded]}>
                      {ex.name}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                      <View style={[styles.modalBadge, { backgroundColor: `${badgeColor}12` }]}>
                        <Text style={[styles.modalBadgeText, { color: badgeColor }]}>{ex.category}</Text>
                      </View>
                      <Text style={styles.modalItemSub}> • {ex.equipment}</Text>
                    </View>
                  </View>
                  
                  {isAlreadyAdded ? (
                    <View style={styles.addedBadge}>
                      <Text style={styles.addedBadgeText}>Added</Text>
                    </View>
                  ) : (
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}>
                      {isSelected && <Check size={12} color={COLORS.white} strokeWidth={3} />}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {tempSelectedIds.length > 0 && (
            <View style={[styles.modalAddBtnContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <TouchableOpacity
                onPress={handleConfirmMultiSelect}
                style={styles.modalAddBtn}
                activeOpacity={0.85}
              >
                <Plus size={16} color={COLORS.white} style={{ marginRight: 6 }} />
                <Text style={styles.modalAddBtnText}>Add Exercises ({tempSelectedIds.length})</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Filter Bottom Sheet */}
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
                          if (isEquipment) {
                            setSelectedEquipment(selectedEquipment === option ? null : option);
                          } else {
                            setSelectedMuscle(selectedMuscle === option ? null : option);
                          }
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
            <Text style={styles.successTitle}>Routine Created!</Text>
            <Text style={styles.successSub}>Your new routine has been saved successfully.</Text>

            <View style={styles.successStatsBox}>
              <View style={styles.successStat}>
                <Text style={styles.successStatLabel}>Exercises</Text>
                <Text style={styles.successStatVal}>{activeExercises.length}</Text>
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
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseCardImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  exerciseName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  exerciseBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  exerciseBadgeText: {
    fontSize: 10,
    fontWeight: '700',
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
  cellText: {
    color: COLORS.text,
    fontSize: 13,
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
  customAddExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    marginTop: 12,
    marginBottom: 30,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  customAddExerciseText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
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
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  emptyCardGradient: {
    padding: 1.5,
    borderRadius: SIZES.radius_lg,
  },
  emptyCardInner: {
    backgroundColor: 'rgba(21, 30, 46, 0.96)',
    borderRadius: SIZES.radius_lg - 1.5,
    padding: 24,
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyAddBtn: {
    paddingHorizontal: 24,
    height: 42,
    borderRadius: 21,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 12,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12,
  },
  modalSearchFocused: {
    borderColor: COLORS.primary,
  },
  modalSearchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  filterPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 6,
  },
  filterPillActive: {
    borderColor: 'rgba(139, 92, 246, 0.4)',
    backgroundColor: 'rgba(139, 92, 246, 0.06)',
  },
  filterPillText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: COLORS.primary,
  },
  filterClearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  filterClearText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  modalList: {
    paddingBottom: 24,
  },
  modalListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  modalItemName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
  modalBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modalBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modalItemSub: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '600',
  },
  modalListItemSelected: {
    borderColor: 'rgba(139, 92, 246, 0.4)',
    backgroundColor: 'rgba(139, 92, 246, 0.04)',
  },
  modalListItemAdded: {
    opacity: 0.6,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  modalItemImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  modalItemNameAdded: {
    color: COLORS.textSecondary,
    textDecorationLine: 'none',
  },
  addedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  addedBadgeText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF6',
  },
  modalAddBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  modalAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modalAddBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  sheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheetContainer: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: SIZES.radius_lg,
    borderTopRightRadius: SIZES.radius_lg,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    maxHeight: '65%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.02)',
  },
  sheetItemSelected: {
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  sheetDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  sheetItemText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  sheetItemTextSelected: {
    color: COLORS.white,
    fontWeight: '700',
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 10, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  successIconOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  successStatsBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius_lg,
    width: '100%',
    paddingVertical: 14,
    marginBottom: 24,
  },
  successStat: {
    flex: 1,
    alignItems: 'center',
  },
  successStatLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  successStatVal: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  successBtn: {
    width: '100%',
    height: 46,
    borderRadius: 23,
  },
});
