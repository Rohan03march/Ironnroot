import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SIZES, SPACING } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { EXERCISES, DEFAULT_TEMPLATES } from '../../constants/mockData';
import { Search, Info, ChevronDown, ChevronUp, Plus, Flame, Dumbbell, Clock, ChevronRight } from 'lucide-react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

const CATEGORY_COLORS: Record<string, string> = {
  All: '#8B5CF6',
  Chest: '#8B5CF6',      // Violet
  Back: '#00F2FE',       // Cyan
  Legs: '#10B981',       // Emerald
  Shoulders: '#F59E0B',  // Amber
  Arms: '#EC4899',       // Pink
  Core: '#3B82F6',       // Blue
};

export default function Workouts() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'routines' | 'exercises'>('routines');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  
  // Track search bar focus for premium borders
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleStartWorkout = (templateId?: string) => {
    if (templateId) {
      router.push(`/active-workout?templateId=${templateId}`);
    } else {
      router.push('/active-workout');
    }
  };

  const toggleExpandExercise = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedExerciseId(expandedExerciseId === id ? null : id);
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

  const getExerciseColor = (category: string) => {
    return CATEGORY_COLORS[category] || COLORS.primary;
  };

  const getEquipmentTagStyle = (equipment: string) => {
    switch (equipment) {
      case 'Barbell':
      case 'Dumbbell':
        return { bg: 'rgba(245, 158, 11, 0.08)', text: '#F59E0B' }; // Amber
      case 'Bodyweight':
        return { bg: 'rgba(16, 185, 129, 0.08)', text: '#10B981' }; // Emerald
      case 'Cable':
      case 'Machine':
        return { bg: 'rgba(59, 130, 246, 0.08)', text: '#3B82F6' }; // Blue
      default:
        return { bg: 'rgba(255, 255, 255, 0.04)', text: COLORS.textSecondary };
    }
  };

  // Filter exercises
  const filteredExercises = EXERCISES.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header Tabs */}
      <View style={styles.headerTabs}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'routines' && styles.tabButtonActive]}
          onPress={() => setActiveTab('routines')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'routines' && styles.tabButtonTextActive]}>
            Routines
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'exercises' && styles.tabButtonActive]}
          onPress={() => setActiveTab('exercises')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'exercises' && styles.tabButtonTextActive]}>
            Exercises
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {activeTab === 'routines' ? (
          <View style={styles.routinesTab}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>Workout Routines</Text>
            </View>
            <Text style={styles.subtitle}>Select a routine to start tracking your session.</Text>

            {/* Create Custom Routine Card with Gradient Border Wrapper */}
            <View style={styles.createCardWrapper}>
              <LinearGradient
                colors={['#8B5CF6', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createCardGradient}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleStartWorkout()}
                  style={styles.createCardInner}
                >
                  <View style={styles.createCardContent}>
                    <View style={styles.createIconContainer}>
                      <Plus size={20} color={COLORS.accentPink} />
                    </View>
                    <View style={styles.createTextContainer}>
                      <Text style={styles.createCardTitle}>Create Custom Workout</Text>
                      <Text style={styles.createCardDesc}>Start an empty routine and add exercises on the fly</Text>
                    </View>
                    <ChevronRight size={18} color={COLORS.textSecondary} />
                  </View>
                </TouchableOpacity>
              </LinearGradient>
            </View>

            {DEFAULT_TEMPLATES.map((t) => {
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
                      {t.lastPerformed && (
                        <Text style={styles.lastPerformedText}>
                          Last: {t.lastPerformed}
                        </Text>
                      )}
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
        ) : (
          <View style={styles.exercisesTab}>
            <Text style={styles.title}>Exercise Database</Text>
            <Text style={styles.subtitle}>Browse form guides and list details for various workouts.</Text>

            {/* Search Bar */}
            <View style={[styles.searchBar, isSearchFocused && styles.searchBarFocused]}>
              <Search size={18} color={isSearchFocused ? COLORS.primary : COLORS.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                  <Plus size={16} color={COLORS.textSecondary} style={{ transform: [{ rotate: '45deg' }] }} />
                </TouchableOpacity>
              )}
            </View>

            {/* Category horizontal badges */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                const badgeColor = getExerciseColor(cat);
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryBadge,
                      isSelected ? {
                        backgroundColor: `${badgeColor}18`,
                        borderColor: badgeColor,
                        shadowColor: badgeColor,
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 4 },
                        elevation: 4,
                      } : {
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderColor: 'rgba(255, 255, 255, 0.06)',
                      },
                    ]}
                  >
                    <Text style={[
                      styles.categoryText,
                      isSelected && { color: badgeColor, fontWeight: '800' }
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Exercises List */}
            {filteredExercises.map((ex) => {
              const isExpanded = expandedExerciseId === ex.id;
              const accentColor = getExerciseColor(ex.category);
              return (
                <View 
                  key={ex.id} 
                  style={[
                    styles.exerciseCardWrapper,
                    { borderLeftWidth: 4, borderLeftColor: accentColor }
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => toggleExpandExercise(ex.id)}
                    style={[
                      styles.exerciseCardHeader,
                      isExpanded && styles.exerciseCardHeaderExpanded,
                    ]}
                  >
                    <View style={styles.exerciseCardInfo}>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      <View style={styles.badgeRow}>
                        <View style={[styles.tag, { backgroundColor: `${accentColor}10`, marginRight: 6 }]}>
                          <Text style={[styles.tagText, { color: accentColor, fontWeight: '700' }]}>{ex.category}</Text>
                        </View>
                        {(() => {
                          const equipStyle = getEquipmentTagStyle(ex.equipment);
                          return (
                            <View style={[styles.tag, { backgroundColor: equipStyle.bg }]}>
                              <Text style={[styles.tagText, { color: equipStyle.text }]}>{ex.equipment}</Text>
                            </View>
                          );
                        })()}
                      </View>
                    </View>
                    {isExpanded ? (
                      <ChevronUp size={18} color={COLORS.textSecondary} />
                    ) : (
                      <ChevronDown size={18} color={COLORS.textSecondary} />
                    )}
                  </TouchableOpacity>
                  
                  {isExpanded && (
                    <View style={styles.exerciseCardBody}>
                      <Text style={[styles.instructionsTitle, { color: accentColor }]}>How to Perform</Text>
                      <View style={styles.instructionBox}>
                        <View style={{ width: '100%' }}>
                          {ex.instructions.split('. ').map((step, stepIdx) => {
                            if (!step.trim()) return null;
                            const formattedStep = step.endsWith('.') ? step : `${step}.`;
                            return (
                              <View key={stepIdx} style={styles.stepRow}>
                                <View style={[styles.stepNumberContainer, { backgroundColor: `${accentColor}15` }]}>
                                  <Text style={[styles.stepNumberText, { color: accentColor }]}>{stepIdx + 1}</Text>
                                </View>
                                <Text style={styles.stepText}>{formattedStep}</Text>
                              </View>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}

            {filteredExercises.length === 0 && (
              <View style={styles.emptyState}>
                <Dumbbell size={40} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No exercises found matching search filters.</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 3,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 13,
  },
  tabButtonActive: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButtonText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: COLORS.white,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
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
  exercisesTab: {
    width: '100%',
  },
  searchBar: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_md,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchBarFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    height: '100%',
  },
  clearSearchBtn: {
    padding: 6,
  },
  categoryScroll: {
    marginBottom: 20,
  },
  categoryBadge: {
    backgroundColor: COLORS.card,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.radius_xl,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  exerciseCardWrapper: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  exerciseCardHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  exerciseCardInfo: {
    flex: 1,
  },
  exerciseName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  exerciseCardBody: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    padding: 16,
  },
  instructionBox: {
    backgroundColor: COLORS.cardHeader,
    padding: 12,
    borderRadius: SIZES.radius_md,
  },
  instructionsTitle: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 6,
    paddingRight: 8,
  },
  stepNumberContainer: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1.5,
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
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
  createCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.04)',
    borderRadius: SIZES.radius_lg,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.18)',
    borderStyle: 'dashed',
    padding: 16,
    marginBottom: 20,
  },
  createCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
