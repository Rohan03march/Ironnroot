import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import Button from '../components/Button';
import Card from '../components/Card';
import { Dumbbell, Target, User, CheckCircle2 } from 'lucide-react-native';

const GOALS = [
  { id: 'muscle', label: 'Build Muscle', desc: 'Hypertrophy & body recomposition' },
  { id: 'fat', label: 'Lose Fat', desc: 'Burn calories & lean out' },
  { id: 'strength', label: 'Increase Strength', desc: 'Powerlifting & absolute power' },
  { id: 'endurance', label: 'Improve Endurance', desc: 'Stamina & functional fitness' },
];

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  
  // Form states
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('muscle');
  const [level, setLevel] = useState('Intermediate');
  const [weight, setWeight] = useState('75');
  const [height, setHeight] = useState('175');
  
  // Loading state for plan generation
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 4;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [step]);

  useEffect(() => {
    if (loadingProgress === 100) {
      // Navigate to tabs home
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 500);
    }
  }, [loadingProgress, router]);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.logoCircleContainer}>
              <LinearGradient
                colors={COLORS.primaryGradient}
                style={styles.logoCircle}
              >
                <Dumbbell size={50} color={COLORS.white} />
              </LinearGradient>
            </View>
            <Text style={styles.title}>IRONNROOT</Text>
            <Text style={styles.subtitle}>FITNESS TRACKER</Text>
            <Text style={styles.description}>
              Elevate your training. Log every set, track weight changes, and analyze your progression with precision.
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Enter your name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Rohan"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <Button
              title="Get Started"
              onPress={handleNext}
              disabled={!name.trim()}
              style={styles.nextBtn}
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeader}>Select Your Primary Goal</Text>
            <Text style={styles.stepSubHeader}>We will tailor your metrics and logs to support your outcome.</Text>

            <ScrollView style={styles.goalList} showsVerticalScrollIndicator={false}>
              {GOALS.map((g) => {
                const isSelected = goal === g.id;
                return (
                  <TouchableOpacity
                    key={g.id}
                    activeOpacity={0.8}
                    onPress={() => setGoal(g.id)}
                    style={[
                      styles.goalCard,
                      isSelected && styles.goalCardSelected,
                    ]}
                  >
                    <View style={styles.goalCardInfo}>
                      <Text style={[styles.goalLabel, isSelected && styles.selectedGoalText]}>
                        {g.label}
                      </Text>
                      <Text style={styles.goalDesc}>{g.desc}</Text>
                    </View>
                    {isSelected && (
                      <CheckCircle2 size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.footerRow}>
              <Button title="Back" onPress={handleBack} variant="ghost" style={styles.backBtn} />
              <Button title="Continue" onPress={handleNext} style={styles.continueBtn} />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepHeader}>Personal Details</Text>
            <Text style={styles.stepSubHeader}>Provide baseline measurements to calibrate your profile.</Text>

            <View style={styles.metricForm}>
              {/* Level selection */}
              <Text style={styles.label}>Fitness Experience Level</Text>
              <View style={styles.levelRow}>
                {LEVELS.map((lvl) => {
                  const isSelected = level === lvl;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      onPress={() => setLevel(lvl)}
                      style={[
                        styles.levelButton,
                        isSelected && styles.levelButtonSelected,
                      ]}
                    >
                      <Text style={[styles.levelBtnText, isSelected && styles.levelBtnTextSelected]}>
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Height and weight */}
              <View style={styles.rowInputs}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                  <Text style={styles.label}>Current Weight (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Height (cm)</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                  />
                </View>
              </View>
            </View>

            <View style={styles.footerRow}>
              <Button title="Back" onPress={handleBack} variant="ghost" style={styles.backBtn} />
              <Button
                title="Create Account"
                onPress={handleNext}
                disabled={!weight || !height}
                style={styles.continueBtn}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingTitle}>Optimizing Dashboard...</Text>
              <Text style={styles.loadingText}>
                Setting up metrics for {name}...
              </Text>
              
              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${loadingProgress}%` }]} />
              </View>
              <Text style={styles.progressPercent}>{loadingProgress}%</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topDotContainer}>
        {step < 3 && (
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  step === i ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            ))}
          </View>
        )}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderStep()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topDotContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dots: {
    flexDirection: 'row',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  inactiveDot: {
    backgroundColor: COLORS.cardHeader,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stepContainer: {
    alignItems: 'center',
    width: '100%',
  },
  logoCircleContainer: {
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: COLORS.white,
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 2,
  },
  subtitle: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
    marginBottom: 24,
  },
  description: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 12,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_md,
    borderWidth: 1,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontSize: 16,
    paddingHorizontal: 16,
    height: 52,
  },
  nextBtn: {
    width: '100%',
    marginTop: 10,
  },
  stepHeader: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  stepSubHeader: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  goalList: {
    width: '100%',
    maxHeight: 320,
    marginBottom: 24,
  },
  goalCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  goalCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  goalCardInfo: {
    flex: 1,
    paddingRight: 12,
  },
  goalLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  selectedGoalText: {
    color: COLORS.primary,
  },
  goalDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
  },
  backBtn: {
    flex: 1,
    marginRight: 8,
  },
  continueBtn: {
    flex: 2,
  },
  metricForm: {
    width: '100%',
    marginBottom: 24,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  levelButton: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_md,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  levelButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  levelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  levelBtnTextSelected: {
    color: COLORS.primary,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 4,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 32,
  },
  progressTrack: {
    width: 220,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.cardHeader,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressPercent: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
