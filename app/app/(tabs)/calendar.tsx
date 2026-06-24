import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING } from '../../constants/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';
import CustomCalendar from '../../components/CustomCalendar';
import { WORKOUT_LOGS, BODY_METRICS } from '../../constants/mockData';
import { Scale, Heart, ShieldAlert, Check } from 'lucide-react-native';

export default function CalendarScreen() {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  
  // Local states for metrics inputs
  const [inputWeight, setInputWeight] = useState('');
  const [inputBodyFat, setInputBodyFat] = useState('');
  
  // Track logged metrics dynamically
  const [metricsLogs, setMetricsLogs] = useState(BODY_METRICS);
  const [workoutLogs, setWorkoutLogs] = useState(WORKOUT_LOGS);

  // Extract all dates that have workouts
  const workoutDates = workoutLogs.map((log) => log.date);

  // Look up workouts completed on the selected date
  const dayWorkouts = workoutLogs.filter((log) => log.date === selectedDate);
  
  // Look up metrics logged on the selected date
  const dayMetric = metricsLogs.find((m) => m.date === selectedDate);

  const handleSaveMetrics = () => {
    if (!inputWeight) {
      Alert.alert('Missing Weight', 'Please provide a weight value to save.');
      return;
    }

    const weightNum = parseFloat(inputWeight);
    const fatNum = inputBodyFat ? parseFloat(inputBodyFat) : undefined;

    const existingIndex = metricsLogs.findIndex((m) => m.date === selectedDate);
    let updatedMetrics = [...metricsLogs];

    if (existingIndex >= 0) {
      updatedMetrics[existingIndex] = {
        ...updatedMetrics[existingIndex],
        weight: weightNum,
        bodyFat: fatNum,
      };
    } else {
      updatedMetrics.push({
        date: selectedDate,
        weight: weightNum,
        bodyFat: fatNum,
      });
    }

    setMetricsLogs(updatedMetrics);
    setInputWeight('');
    setInputBodyFat('');
    Alert.alert('Metrics Logged', `Successfully updated metrics for ${selectedDate}.`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>History & Metrics</Text>
        <Text style={styles.subtitle}>Select dates to view logs or log body measurements.</Text>

        {/* Custom Calendar Card */}
        <CustomCalendar
          selectedDate={selectedDate}
          onDateSelect={(dateStr) => {
            setSelectedDate(dateStr);
            // Pre-fill metrics inputs if they exist
            const existing = metricsLogs.find((m) => m.date === dateStr);
            if (existing) {
              setInputWeight(existing.weight.toString());
              setInputBodyFat(existing.bodyFat ? existing.bodyFat.toString() : '');
            } else {
              setInputWeight('');
              setInputBodyFat('');
            }
          }}
          workoutDates={workoutDates}
        />

        {/* Workouts section */}
        <Text style={styles.sectionTitle}>Workout Session Logs ({selectedDate})</Text>
        {dayWorkouts.map((log) => (
          <Card key={log.id} style={styles.workoutLogCard}>
            <View style={styles.logHeader}>
              <Text style={styles.logName}>{log.name}</Text>
              <Text style={styles.logTime}>{log.durationMin} min</Text>
            </View>
            <Text style={styles.logVolume}>Total Volume: {log.totalVolumeKg} kg</Text>
            <View style={styles.divider} />
            {log.exercises.map((ex, index) => (
              <View key={index} style={styles.exerciseLogItem}>
                <Text style={styles.exLogName}>{ex.exerciseName}</Text>
                <Text style={styles.exLogSets}>{ex.setsCount} sets (Best: {ex.bestSet})</Text>
              </View>
            ))}
          </Card>
        ))}

        {dayWorkouts.length === 0 && (
          <Card style={styles.restDayCard}>
            <Heart size={24} color={COLORS.primary} style={{ marginBottom: 8 }} />
            <Text style={styles.restDayTitle}>Rest & Recovery Day</Text>
            <Text style={styles.restDayText}>
              No workouts logged. Give your muscles time to rebuild and synthesize protein.
            </Text>
          </Card>
        )}

        {/* Daily Measures Logger */}
        <Text style={styles.sectionTitle}>Body Measures ({selectedDate})</Text>
        <Card style={styles.metricsCard}>
          {dayMetric ? (
            <View style={styles.loggedMetricsContainer}>
              <View style={styles.metricRow}>
                <Scale size={16} color={COLORS.accentCyan} />
                <Text style={styles.metricText}>Weight: </Text>
                <Text style={styles.metricValue}>{dayMetric.weight} kg</Text>
              </View>
              {dayMetric.bodyFat && (
                <View style={[styles.metricRow, { marginTop: 8 }]}>
                  <Scale size={16} color={COLORS.accentPink} />
                  <Text style={styles.metricText}>Body Fat: </Text>
                  <Text style={styles.metricValue}>{dayMetric.bodyFat}%</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.noMetricContainer}>
              <ShieldAlert size={18} color={COLORS.textMuted} />
              <Text style={styles.noMetricText}>No measurements recorded for this date.</Text>
            </View>
          )}

          {/* Form inputs */}
          <View style={styles.inputsRow}>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.metricInput}
                placeholder={dayMetric ? dayMetric.weight.toString() : '75.0'}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={inputWeight}
                onChangeText={setInputWeight}
              />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Body Fat (%)</Text>
              <TextInput
                style={styles.metricInput}
                placeholder={dayMetric?.bodyFat ? dayMetric.bodyFat.toString() : '15.0'}
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                value={inputBodyFat}
                onChangeText={setInputBodyFat}
              />
            </View>
          </View>
          <Button
            title="Log Measurement"
            onPress={handleSaveMetrics}
            variant="outline"
            size="sm"
            style={styles.saveMetricsBtn}
          />
        </Card>
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
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  workoutLogCard: {
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  logTime: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  logVolume: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 10,
  },
  exerciseLogItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  exLogName: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  exLogSets: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  restDayCard: {
    alignItems: 'center',
    padding: 20,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  restDayTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  restDayText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  metricsCard: {
    padding: 16,
  },
  loggedMetricsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: SIZES.radius_md,
    padding: 12,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginLeft: 8,
  },
  metricValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  noMetricContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginBottom: 12,
  },
  noMetricText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginLeft: 8,
  },
  inputsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  inputBox: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  metricInput: {
    backgroundColor: COLORS.cardHeader,
    color: COLORS.text,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  saveMetricsBtn: {
    width: '100%',
  },
});
