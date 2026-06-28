import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SIZES, SPACING } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { DEFAULT_USER, BODY_METRICS, WORKOUT_LOGS, BodyMetric, WorkoutLog } from '../../constants/mockData';
import {
  VolumeBarChart,
  WeightLineChart,
  MuscleSplitDonutChart
} from '../../components/AnalyticsCharts';
import {
  User,
  Award,
  Settings,
  ShieldAlert,
  ChevronRight,
  Scale,
  Bell,
  BarChart2,
  Dumbbell,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
  Calendar,
  TrendingUp,
  PieChart,
  Clock,
  Info
} from 'lucide-react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type TabType = 'stats' | 'measures' | 'settings';

export default function Profile() {
  const router = useRouter();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<TabType>('stats');

  // Profile data state
  const [userProfile, setUserProfile] = useState(DEFAULT_USER);

  // Settings switches
  const [useMetric, setUseMetric] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [restSoundEnabled, setRestSoundEnabled] = useState(true);
  
  // PR states
  const [prs, setPrs] = useState({
    'Bench Press': '85 kg',
    'Back Squat': '110 kg',
    'Deadlift': '135 kg',
    'Overhead Press': '55 kg'
  });
  const [editingLift, setEditingLift] = useState<string | null>(null);
  const [prInput, setPrInput] = useState('');

  // Body Metrics state
  const [metricsLogs, setMetricsLogs] = useState<BodyMetric[]>(BODY_METRICS);
  
  // Workout Logs state
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(WORKOUT_LOGS);



  // Input Focus tracking for premium borders
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  // Form inputs for new measurements
  const [measureDate, setMeasureDate] = useState(new Date().toISOString().split('T')[0]);
  const [measureWeight, setMeasureWeight] = useState('');
  const [measureBodyFat, setMeasureBodyFat] = useState('');
  const [measureWaist, setMeasureWaist] = useState('');
  const [measureBiceps, setMeasureBiceps] = useState('');
  const [measureChest, setMeasureChest] = useState('');

  // Calculations for Stats Overview
  const totalWorkouts = workoutLogs.length;
  const totalVolume = workoutLogs.reduce((sum, log) => sum + log.totalVolumeKg, 0);
  const totalSets = workoutLogs.reduce((sum, log) => {
    return sum + log.exercises.reduce((exSum, ex) => exSum + ex.setsCount, 0);
  }, 0);

  const handleUpdatePr = (lift: string) => {
    if (!prInput.trim()) {
      setEditingLift(null);
      return;
    }
    
    setPrs({
      ...prs,
      [lift]: `${prInput} ${useMetric ? 'kg' : 'lbs'}`
    });
    setEditingLift(null);
    setPrInput('');
    Alert.alert('PR Updated', `New personal record set for ${lift}!`);
  };

  const handleLogMeasurement = () => {
    if (!measureWeight) {
      Alert.alert('Missing Weight', 'Please provide a weight value to save.');
      return;
    }

    const newMetric: BodyMetric = {
      date: measureDate,
      weight: parseFloat(measureWeight),
      bodyFat: measureBodyFat ? parseFloat(measureBodyFat) : undefined,
      waist: measureWaist ? parseFloat(measureWaist) : undefined,
      biceps: measureBiceps ? parseFloat(measureBiceps) : undefined,
      chest: measureChest ? parseFloat(measureChest) : undefined,
    };

    // Check if entry for date already exists
    const existingIndex = metricsLogs.findIndex(m => m.date === measureDate);
    let updatedLogs = [...metricsLogs];

    if (existingIndex >= 0) {
      updatedLogs[existingIndex] = {
        ...updatedLogs[existingIndex],
        ...newMetric
      };
    } else {
      updatedLogs.push(newMetric);
    }

    // Sort by date descending
    updatedLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setMetricsLogs(updatedLogs);

    // Update current weight in header if matching latest date or today
    const sortedByDateAsc = [...updatedLogs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latestWeight = sortedByDateAsc[sortedByDateAsc.length - 1].weight;
    setUserProfile(prev => ({
      ...prev,
      currentWeightKg: latestWeight
    }));

    // Reset fields except date
    setMeasureWeight('');
    setMeasureBodyFat('');
    setMeasureWaist('');
    setMeasureBiceps('');
    setMeasureChest('');

    Alert.alert('Metrics Logged', `Successfully updated metrics for ${measureDate}.`);
  };

  const handleDeleteMeasurement = (date: string) => {
    Alert.alert(
      'Delete Measurement',
      `Are you sure you want to delete the log for ${date}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const filtered = metricsLogs.filter(m => m.date !== date);
            setMetricsLogs(filtered);
            if (filtered.length > 0) {
              const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
              setUserProfile(prev => ({
                ...prev,
                currentWeightKg: sorted[sorted.length - 1].weight
              }));
            }
          }
        }
      ]
    );
  };



  const handleResetData = () => {
    Alert.alert(
      'Reset All Data',
      'This will erase all recorded logs, personal records, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            router.replace('/onboarding');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* User Card */}
        <Card style={styles.userCard}>
          <View style={styles.avatarWrapper}>
            <LinearGradient
              colors={['#8B5CF6', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradientBorder}
            >
              <View style={styles.avatarCircle}>
                <User size={38} color={COLORS.primary} />
              </View>
            </LinearGradient>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 {userProfile.streakDays}D</Text>
            </View>
          </View>
          <Text style={styles.userName}>{userProfile.name}</Text>
          <Text style={styles.userGoal}>{userProfile.goal}</Text>
          <Text style={styles.userLevel}>{userProfile.fitnessLevel} Athlete</Text>

          <View style={styles.divider} />

          <View style={styles.detailsRow}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Height</Text>
              <Text style={styles.detailVal}>{userProfile.heightCm} cm</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailVal}>{userProfile.currentWeightKg.toFixed(1)} kg</Text>
            </View>
            <View style={styles.verticalDivider} />
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Target</Text>
              <Text style={styles.detailVal}>{userProfile.targetWeightKg.toFixed(1)} kg</Text>
            </View>
          </View>
        </Card>

        {/* Tab Selector */}
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'stats' && styles.tabActive]}
            onPress={() => setActiveTab('stats')}
          >
            <BarChart2 size={18} color={activeTab === 'stats' ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>Stats</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'measures' && styles.tabActive]}
            onPress={() => setActiveTab('measures')}
          >
            <Scale size={18} color={activeTab === 'measures' ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'measures' && styles.tabTextActive]}>Measures</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'settings' && styles.tabActive]}
            onPress={() => setActiveTab('settings')}
          >
            <Settings size={18} color={activeTab === 'settings' ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* TAB CONTENTS */}

        {/* 1. STATS TAB */}
        {activeTab === 'stats' && (
          <View>
            <Text style={styles.sectionTitle}>Overview Statistics</Text>
            
            {/* KPI Cards Grid */}
            <View style={styles.kpiGrid}>
              <Card style={styles.kpiCard}>
                <Text style={styles.kpiVal}>{totalWorkouts}</Text>
                <Text style={styles.kpiLabel}>Workouts</Text>
              </Card>
              <Card style={styles.kpiCard}>
                <Text style={styles.kpiVal}>
                  {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}
                </Text>
                <Text style={styles.kpiLabel}>Total Vol. (kg)</Text>
              </Card>
              <Card style={styles.kpiCard}>
                <Text style={styles.kpiVal}>{totalSets}</Text>
                <Text style={styles.kpiLabel}>Est. Sets</Text>
              </Card>
            </View>

            {/* Volume Bar Chart */}
            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <BarChart2 size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
                <Text style={styles.cardHeaderTitle}>Volume Trend</Text>
              </View>
              <VolumeBarChart logs={workoutLogs} />
            </Card>

            {/* Weight Line Chart */}
            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <TrendingUp size={18} color={COLORS.accentCyan} style={{ marginRight: 8 }} />
                <Text style={styles.cardHeaderTitle}>Weight Shift</Text>
              </View>
              <WeightLineChart metrics={metricsLogs} />
            </Card>

            {/* Muscle Split Donut Chart */}
            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <PieChart size={18} color={COLORS.accentPink} style={{ marginRight: 8 }} />
                <Text style={styles.cardHeaderTitle}>Set Allocation</Text>
              </View>
              <MuscleSplitDonutChart logs={workoutLogs} />
            </Card>
          </View>
        )}

        {/* 2. MEASURES TAB */}
        {activeTab === 'measures' && (
          <View>
            {/* PRs Card */}
            <Text style={styles.sectionTitle}>Personal Records (PRs)</Text>
            <Card style={styles.prCard}>
              {Object.entries(prs).map(([lift, val]) => {
                const isEditing = editingLift === lift;
                return (
                  <View key={lift} style={styles.prRow}>
                    <View style={styles.prLabelGroup}>
                      <Award size={16} color={COLORS.warning} style={{ marginRight: 8 }} />
                      <Text style={styles.prLiftName}>{lift}</Text>
                    </View>
                    {isEditing ? (
                      <View style={styles.prEditRow}>
                        <TextInput
                          style={styles.prInput}
                          keyboardType="numeric"
                          value={prInput}
                          onChangeText={setPrInput}
                          placeholder={val.split(' ')[0]}
                          placeholderTextColor={COLORS.textMuted}
                          autoFocus
                        />
                        <TouchableOpacity onPress={() => handleUpdatePr(lift)} style={styles.prSaveBtn}>
                          <Text style={styles.prSaveBtnText}>Save</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity onPress={() => setEditingLift(lift)} style={styles.prValBtn}>
                        <Text style={styles.prValueText}>{val}</Text>
                        <ChevronRight size={14} color={COLORS.textMuted} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </Card>

            {/* Daily Measures Logger */}
            <Text style={styles.sectionTitle}>Log Measurements</Text>
            <Card style={styles.metricsFormCard}>
              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={[
                    styles.formInput,
                    focusedInput === 'date' && styles.inputDateFocused
                  ]}
                  onFocus={() => setFocusedInput('date')}
                  onBlur={() => setFocusedInput(null)}
                  placeholder={new Date().toISOString().split('T')[0]}
                  placeholderTextColor={COLORS.textMuted}
                  value={measureDate}
                  onChangeText={setMeasureDate}
                />
              </View>
              
              <View style={styles.formGrid}>
                <View style={[styles.inputBox, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Weight (kg) *</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      focusedInput === 'weight' && styles.inputWeightFocused
                    ]}
                    onFocus={() => setFocusedInput('weight')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="75.5"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={measureWeight}
                    onChangeText={setMeasureWeight}
                  />
                </View>
                <View style={[styles.inputBox, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Body Fat (%)</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      focusedInput === 'fat' && styles.inputFatFocused
                    ]}
                    onFocus={() => setFocusedInput('fat')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="15.0"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={measureBodyFat}
                    onChangeText={setMeasureBodyFat}
                  />
                </View>
              </View>

              <View style={styles.formGrid}>
                <View style={[styles.inputBox, { flex: 1, marginRight: 6 }]}>
                  <Text style={styles.inputLabel}>Waist (cm)</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      focusedInput === 'waist' && styles.inputWaistFocused
                    ]}
                    onFocus={() => setFocusedInput('waist')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="82"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={measureWaist}
                    onChangeText={setMeasureWaist}
                  />
                </View>
                <View style={[styles.inputBox, { flex: 1, marginRight: 6 }]}>
                  <Text style={styles.inputLabel}>Biceps (cm)</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      focusedInput === 'biceps' && styles.inputBicepsFocused
                    ]}
                    onFocus={() => setFocusedInput('biceps')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="36"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={measureBiceps}
                    onChangeText={setMeasureBiceps}
                  />
                </View>
                <View style={[styles.inputBox, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Chest (cm)</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      focusedInput === 'chest' && styles.inputChestFocused
                    ]}
                    onFocus={() => setFocusedInput('chest')}
                    onBlur={() => setFocusedInput(null)}
                    placeholder="104"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={measureChest}
                    onChangeText={setMeasureChest}
                  />
                </View>
              </View>

              <Button
                title="Log Measurement"
                onPress={handleLogMeasurement}
                variant="primary"
                size="sm"
                style={styles.submitMeasureBtn}
              />
            </Card>

            {/* Metrics History */}
            <Text style={styles.sectionTitle}>Measurement History</Text>
            {metricsLogs.length === 0 ? (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyText}>No measurement history logs found.</Text>
              </Card>
            ) : (
              metricsLogs.map((item, idx) => (
                <Card key={idx} style={styles.historyItemCard}>
                  <View style={styles.historyHeader}>
                    <View style={styles.historyDateWrapper}>
                      <Calendar size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
                      <Text style={styles.historyDate}>{item.date}</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleDeleteMeasurement(item.date)}>
                      <Trash2 size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.historyGrid}>
                    <View style={styles.historyCol}>
                      <Text style={styles.historyLabel}>Weight</Text>
                      <Text style={styles.historyVal}>{item.weight} kg</Text>
                    </View>
                    <View style={styles.historyCol}>
                      <Text style={styles.historyLabel}>Body Fat</Text>
                      <Text style={styles.historyVal}>{item.bodyFat ? `${item.bodyFat}%` : '--'}</Text>
                    </View>
                    <View style={styles.historyCol}>
                      <Text style={styles.historyLabel}>Waist</Text>
                      <Text style={styles.historyVal}>{item.waist ? `${item.waist} cm` : '--'}</Text>
                    </View>
                    <View style={styles.historyCol}>
                      <Text style={styles.historyLabel}>Biceps</Text>
                      <Text style={styles.historyVal}>{item.biceps ? `${item.biceps} cm` : '--'}</Text>
                    </View>
                    <View style={styles.historyCol}>
                      <Text style={styles.historyLabel}>Chest</Text>
                      <Text style={styles.historyVal}>{item.chest ? `${item.chest} cm` : '--'}</Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}



        {/* 4. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <View>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <Card style={styles.prefCard}>
              <View style={styles.prefRow}>
                <View style={styles.prefInfo}>
                  <Scale size={18} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                  <Text style={styles.prefName}>Use Metric Units (kg)</Text>
                </View>
                <Switch
                  value={useMetric}
                  onValueChange={setUseMetric}
                  trackColor={{ false: COLORS.cardHeader, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>

              <View style={styles.prefRow}>
                <View style={styles.prefInfo}>
                  <Bell size={18} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                  <Text style={styles.prefName}>Rest Alarm Sounds</Text>
                </View>
                <Switch
                  value={restSoundEnabled}
                  onValueChange={setRestSoundEnabled}
                  trackColor={{ false: COLORS.cardHeader, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>

              <View style={styles.prefRow}>
                <View style={styles.prefInfo}>
                  <Settings size={18} color={COLORS.textSecondary} style={{ marginRight: 10 }} />
                  <Text style={styles.prefName}>Haptic Vibrations</Text>
                </View>
                <Switch
                  value={hapticEnabled}
                  onValueChange={setHapticEnabled}
                  trackColor={{ false: COLORS.cardHeader, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>
            </Card>

            {/* Danger zone reset */}
            <Text style={styles.sectionTitle}>Danger Zone</Text>
            <Button
              title="Reset Account Details"
              onPress={handleResetData}
              variant="outline"
              style={styles.resetBtn}
              textStyle={{ color: COLORS.error }}
              icon={<ShieldAlert size={16} color={COLORS.error} />}
            />
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
  scrollContent: {
    padding: 20,
    paddingBottom: 120, // Give bottom spacing for navigation tabs
  },
  userCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarGradientBorder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(21, 30, 46, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  streakBadge: {
    position: 'absolute',
    bottom: -2,
    right: -6,
    backgroundColor: '#EF4444', // Flame color
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  streakText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
  },
  userName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  userGoal: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'center',
  },
  userLevel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  detailCol: {
    alignItems: 'center',
    flex: 1,
  },
  verticalDivider: {
    width: 1,
    height: '60%',
    backgroundColor: COLORS.border,
    alignSelf: 'center',
  },
  detailLabel: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  detailVal: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 4,
  },
  
  // Segmented Control styles
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 16,
    padding: 3,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 13,
  },
  tabActive: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.22)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 9,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // KPI cards
  kpiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  kpiVal: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
  },
  kpiLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },

  // Charts
  chartCard: {
    marginBottom: 16,
    padding: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // PR Card styles
  prCard: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  prRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    shadowColor: COLORS.warning,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  prLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prLiftName: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  prValBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prValueText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    marginRight: 6,
  },
  prEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prInput: {
    backgroundColor: COLORS.cardHeader,
    color: COLORS.text,
    height: 28,
    borderRadius: 4,
    paddingHorizontal: 8,
    width: 60,
    fontSize: 12,
    textAlign: 'center',
    marginRight: 6,
  },
  prSaveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  prSaveBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },

  // Measures Form
  metricsFormCard: {
    padding: 16,
    marginBottom: 20,
  },
  formGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  inputBox: {
    marginBottom: 12,
  },
  inputLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  formInput: {
    backgroundColor: COLORS.cardHeader,
    color: COLORS.text,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 38,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  formInputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.04)',
  },
  inputDateFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inputWeightFocused: {
    borderColor: COLORS.accentCyan,
    backgroundColor: 'rgba(6, 182, 212, 0.03)',
    shadowColor: COLORS.accentCyan,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inputFatFocused: {
    borderColor: COLORS.accentPink,
    backgroundColor: 'rgba(236, 72, 153, 0.03)',
    shadowColor: COLORS.accentPink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inputWaistFocused: {
    borderColor: COLORS.accentBlue,
    backgroundColor: 'rgba(59, 130, 246, 0.03)',
    shadowColor: COLORS.accentBlue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inputBicepsFocused: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(139, 92, 246, 0.03)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  inputChestFocused: {
    borderColor: COLORS.success,
    backgroundColor: 'rgba(16, 185, 129, 0.03)',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitMeasureBtn: {
    marginTop: 8,
    width: '100%',
  },

  // History List
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  historyItemCard: {
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accentCyan,
    backgroundColor: COLORS.card,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyDateWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyDate: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  historyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyCol: {
    alignItems: 'center',
    flex: 1,
  },
  historyLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  historyVal: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },

  // Workouts Tab
  workoutLogCard: {
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: COLORS.card,
  },
  workoutHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutLogName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  workoutLogDate: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  workoutStatsRow: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  workoutStatPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
    marginBottom: 4,
  },
  workoutStatLabel: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  workoutStatVal: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
  },
  workoutDetailsBody: {
    marginTop: 12,
  },
  workoutDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  workoutExercisesTitle: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  workoutExerciseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  exInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.6,
  },
  workoutExName: {
    color: COLORS.textSecondary,
    fontSize: 11,
  },
  workoutExDetails: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  workoutBestSetText: {
    color: COLORS.white,
    fontWeight: '600',
  },

  // Settings Tab
  prefCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  prefInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefName: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  resetBtn: {
    borderColor: COLORS.error,
    backgroundColor: 'transparent',
    marginBottom: 20,
  },
});
