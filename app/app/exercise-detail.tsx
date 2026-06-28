import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { EXERCISES } from '../constants/mockData';
import { ChevronLeft, Dumbbell, Award, Info, Star } from 'lucide-react-native';

const { width: windowWidth } = Dimensions.get('window');

const EXERCISE_IMAGES: Record<string, string> = {
  Chest: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&auto=format&fit=crop&q=80',
  Back: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format&fit=crop&q=80',
  Legs: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&auto=format&fit=crop&q=80',
  Shoulders: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600&auto=format&fit=crop&q=80',
  Arms: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop&q=80',
  Core: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80',
};

const CATEGORY_COLORS: Record<string, string> = {
  Chest: '#8B5CF6',      // Violet
  Back: '#00F2FE',       // Cyan
  Legs: '#10B981',       // Emerald
  Shoulders: '#F59E0B',  // Amber
  Arms: '#EC4899',       // Pink
  Core: '#3B82F6',       // Blue
};

export default function ExerciseDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id?: string }>();

  // Find exercise by ID
  const exercise = EXERCISES.find((ex) => ex.id === id);

  if (!exercise) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Exercise not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const accentColor = CATEGORY_COLORS[exercise.category] || '#8B5CF6';

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Banner Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: EXERCISE_IMAGES[exercise.category] || EXERCISE_IMAGES.Chest }}
            style={styles.heroImage}
          />
          <View style={styles.imageOverlay} />
          
          {/* Back button positioned absolutely over image */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.floatingBackBtn, { top: Math.max(insets.top, 16) }]}
            activeOpacity={0.8}
          >
            <ChevronLeft size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Content Container */}
        <View style={styles.contentCard}>
          {/* Header */}
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          
          {/* Badges Row */}
          <View style={styles.badgesRow}>
            <View style={[styles.badge, { backgroundColor: `${accentColor}12`, borderColor: `${accentColor}30`, borderWidth: 1 }]}>
              <Dumbbell size={12} color={accentColor} style={{ marginRight: 6 }} />
              <Text style={[styles.badgeText, { color: accentColor }]}>{exercise.category}</Text>
            </View>

            <View style={[styles.badge, { backgroundColor: 'rgba(255, 255, 255, 0.04)', borderColor: 'rgba(255, 255, 255, 0.08)', borderWidth: 1 }]}>
              <Award size={12} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
              <Text style={[styles.badgeText, { color: COLORS.textSecondary }]}>{exercise.equipment}</Text>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.sectionHeader}>
            <Info size={16} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>About this exercise</Text>
          </View>
          <Text style={styles.descriptionText}>
            This is a premium {exercise.equipment.toLowerCase()}-based exercise targeting the {exercise.category.toLowerCase()} muscle group. Performing this movement regularly promotes hyper-growth, form stability, and muscle activation.
          </Text>

          {/* How to Perform Section */}
          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Star size={16} color={COLORS.accentCyan} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>How to Perform</Text>
          </View>
          
          <View style={styles.stepsContainer}>
            {exercise.instructions.split('. ').map((step, idx) => {
              if (!step.trim()) return null;
              const formattedStep = step.endsWith('.') ? step : `${step}.`;
              return (
                <View key={idx} style={styles.stepRow}>
                  <View style={[styles.stepNumberContainer, { backgroundColor: `${accentColor}15` }]}>
                    <Text style={[styles.stepNumberText, { color: accentColor }]}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{formattedStep}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: windowWidth,
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  floatingBackBtn: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentCard: {
    marginTop: -20,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  exerciseName: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
    lineHeight: 28,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  descriptionText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  stepsContainer: {
    marginTop: 8,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 16,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
