import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SIZES, SPACING } from '../../constants/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { DEFAULT_USER } from '../../constants/mockData';
import { User, Award, Settings, ShieldAlert, LogOut, ChevronRight, Scale, Bell } from 'lucide-react-native';

export default function Profile() {
  const router = useRouter();
  
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
          <View style={styles.avatarCircle}>
            <User size={36} color={COLORS.primary} />
          </View>
          <Text style={styles.userName}>{DEFAULT_USER.name}</Text>
          <Text style={styles.userGoal}>{DEFAULT_USER.goal}</Text>
          <Text style={styles.userLevel}>{DEFAULT_USER.fitnessLevel} Athlete</Text>

          <View style={styles.divider} />

          <View style={styles.detailsRow}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Height</Text>
              <Text style={styles.detailVal}>{DEFAULT_USER.heightCm} cm</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Weight</Text>
              <Text style={styles.detailVal}>{DEFAULT_USER.currentWeightKg} kg</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Target</Text>
              <Text style={styles.detailVal}>{DEFAULT_USER.targetWeightKg} kg</Text>
            </View>
          </View>
        </Card>

        {/* Personal Records */}
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

        {/* Preferences */}
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
        <Button
          title="Reset Account Details"
          onPress={handleResetData}
          variant="outline"
          style={styles.resetBtn}
          textStyle={{ color: COLORS.error }}
          icon={<ShieldAlert size={16} color={COLORS.error} />}
        />
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
  userCard: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 20,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.cardHeader,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    marginBottom: 12,
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
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  prCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
  },
  prRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  prefCard: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 24,
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
