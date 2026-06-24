import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SIZES, SPACING } from '../../constants/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { EXERCISES, DEFAULT_TEMPLATES } from '../../constants/mockData';
import { Search, Info, ChevronDown, ChevronUp, Plus, Flame, Dumbbell } from 'lucide-react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

export default function Workouts() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'routines' | 'exercises'>('routines');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);

  const handleStartWorkout = (templateId: string) => {
    router.push(`/active-workout?templateId=${templateId}`);
  };

  const toggleExpandExercise = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedExerciseId(expandedExerciseId === id ? null : id);
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
              <Text style={styles.title}>Workout Templates</Text>
              <Button
                title="New Routine"
                onPress={() => router.push('/active-workout')}
                size="sm"
                variant="outline"
                icon={<Plus size={14} color={COLORS.primary} />}
              />
            </View>
            <Text style={styles.subtitle}>Select a routine to start tracking your session.</Text>

            {DEFAULT_TEMPLATES.map((t) => (
              <Card key={t.id} style={styles.routineCard}>
                <View style={styles.routineInfo}>
                  <Text style={styles.routineName}>{t.name}</Text>
                  <View style={styles.tagRow}>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{t.durationMin} mins</Text>
                    </View>
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{t.exercisesCount} Exercises</Text>
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
                  <Text style={styles.previewTitle}>Exercises:</Text>
                  <Text style={styles.previewList} numberOfLines={1}>
                    {t.exercises.map(e => e.exerciseName).join(', ')}
                  </Text>
                </View>
                <Button
                  title="Start Routine"
                  onPress={() => handleStartWorkout(t.id)}
                  style={styles.startBtn}
                />
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.exercisesTab}>
            <Text style={styles.title}>Exercise Database</Text>
            <Text style={styles.subtitle}>Browse form guides and list details for various workouts.</Text>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <Search size={18} color={COLORS.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor={COLORS.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Category horizontal badges */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={[
                      styles.categoryBadge,
                      isSelected && styles.categoryBadgeActive,
                    ]}
                  >
                    <Text style={[styles.categoryText, isSelected && styles.categoryTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Exercises List */}
            {filteredExercises.map((ex) => {
              const isExpanded = expandedExerciseId === ex.id;
              return (
                <View key={ex.id} style={styles.exerciseCardWrapper}>
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
                        <View style={[styles.tag, styles.muscleTag]}>
                          <Text style={styles.muscleTagText}>{ex.category}</Text>
                        </View>
                        <View style={styles.tag}>
                          <Text style={styles.tagText}>{ex.equipment}</Text>
                        </View>
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
                      <View style={styles.instructionBox}>
                        <Info size={16} color={COLORS.primary} style={styles.infoIcon} />
                        <Text style={styles.instructionsText}>{ex.instructions}</Text>
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 11,
  },
  tabButtonActive: {
    backgroundColor: COLORS.card,
    shadowColor: '#000',
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
    marginBottom: 6,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: SIZES.radius_sm,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  muscleTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  muscleTagText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
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
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  previewList: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  startBtn: {
    width: '100%',
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
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
    height: '100%',
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
  categoryBadgeActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryTextActive: {
    color: COLORS.white,
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
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  exerciseCardBody: {
    backgroundColor: 'rgba(255,255,255,0.01)',
    padding: 16,
  },
  instructionBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardHeader,
    padding: 12,
    borderRadius: SIZES.radius_md,
  },
  infoIcon: {
    marginRight: 8,
    marginTop: 1,
  },
  instructionsText: {
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
});
