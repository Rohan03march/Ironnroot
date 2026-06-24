import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SIZES, SPACING } from '../../constants/theme';
import Card from '../../components/Card';
import { VolumeBarChart, WeightLineChart, MuscleSplitDonutChart } from '../../components/AnalyticsCharts';
import { WORKOUT_LOGS, BODY_METRICS } from '../../constants/mockData';
import { TrendingUp, BarChart, PieChart } from 'lucide-react-native';

const TIMEFRAMES = ['1W', '1M', '3M', 'ALL'];

export default function Analytics() {
  const [timeframe, setTimeframe] = useState('1M');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Metrics & Analytics</Text>
        <Text style={styles.subtitle}>Analyze your training volume, weight shifts, and set counts.</Text>

        {/* Timeframe pill selector */}
        <View style={styles.timeframeRow}>
          {TIMEFRAMES.map((tf) => {
            const isSelected = timeframe === tf;
            return (
              <TouchableOpacity
                key={tf}
                onPress={() => setTimeframe(tf)}
                style={[
                  styles.timeframePill,
                  isSelected && styles.timeframePillActive,
                ]}
              >
                <Text style={[styles.timeframeText, isSelected && styles.timeframeTextActive]}>
                  {tf}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 1. Volume Bar Chart Card */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <BarChart size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.cardHeaderTitle}>Session Volume</Text>
          </View>
          <VolumeBarChart logs={WORKOUT_LOGS} />
          <Text style={styles.chartExplain}>
            Lifting volume shows cumulative weight x reps. Higher peaks indicate increased overall workload and progressive overload.
          </Text>
        </Card>

        {/* 2. Weight Line Chart Card */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <TrendingUp size={18} color={COLORS.accentCyan} style={{ marginRight: 8 }} />
            <Text style={styles.cardHeaderTitle}>Weight Trend</Text>
          </View>
          <WeightLineChart metrics={BODY_METRICS} />
          <Text style={styles.chartExplain}>
            Tracked weight records demonstrate consistent body recomposition and mass changes relative to goals.
          </Text>
        </Card>

        {/* 3. Muscle Split Donut Chart Card */}
        <Card style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <PieChart size={18} color={COLORS.accentPink} style={{ marginRight: 8 }} />
            <Text style={styles.cardHeaderTitle}>Set Allocation</Text>
          </View>
          <MuscleSplitDonutChart logs={WORKOUT_LOGS} />
          <Text style={styles.chartExplain}>
            Ensure structured balanced development by distributing set metrics equally between push, pull, core, and leg patterns.
          </Text>
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
  timeframeRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_xl,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  timeframePill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: SIZES.radius_xl,
  },
  timeframePillActive: {
    backgroundColor: COLORS.primary,
  },
  timeframeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  timeframeTextActive: {
    color: COLORS.white,
  },
  chartCard: {
    marginBottom: 20,
    padding: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartExplain: {
    color: COLORS.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 12,
  },
});
