import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SIZES } from '../constants/theme';
import { EXERCISES } from '../constants/mockData';
import { Search, ChevronDown, ChevronUp, X, Dumbbell, ChevronLeft, ChevronRight } from 'lucide-react-native';

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

export default function ExploreExercises() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  
  // Track search bar focus for premium borders
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const toggleExpandExercise = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedExerciseId(expandedExerciseId === id ? null : id);
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
      {/* Top Header Bar */}
      <View style={styles.topHeaderBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={22} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Explore Exercises</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                <X size={16} color={COLORS.textSecondary} />
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
                  activeOpacity={0.8}
                  onPress={() => router.push(`/exercise-detail?id=${ex.id}`)}
                  style={styles.exerciseCardHeader}
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
                  <ChevronRight size={16} color={COLORS.textSecondary} style={{ marginRight: 4 }} />
                </TouchableOpacity>
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  backBtn: {
    padding: 6,
  },
  headerTitleText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  exercisesTab: {
    width: '100%',
  },
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 20,
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
});
