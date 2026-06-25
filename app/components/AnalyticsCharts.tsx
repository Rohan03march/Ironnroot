import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import Svg, { Rect, Circle, Path, Defs, LinearGradient, Stop, Line, Text as SvgText, G } from 'react-native-svg';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { WorkoutLog, BodyMetric } from '../constants/mockData';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 64; // Adjusting for card padding
const CHART_HEIGHT = 160;

interface VolumeChartProps {
  logs: WorkoutLog[];
}

export function VolumeBarChart({ logs }: VolumeChartProps) {
  // Sort logs by date ascending, take last 5
  const chartData = [...logs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-5);

  if (chartData.length === 0) return null;

  const maxVolume = Math.max(...chartData.map(d => d.totalVolumeKg), 1000);
  
  const paddingLeft = 45;
  const paddingBottom = 25;
  const paddingTop = 15;
  const paddingRight = 10;
  
  const graphWidth = CHART_WIDTH - paddingLeft - paddingRight;
  const graphHeight = CHART_HEIGHT - paddingTop - paddingBottom;
  
  const barWidth = 24;
  const barSpacing = (graphWidth - (barWidth * chartData.length)) / (chartData.length + 1);

  // Y-axis grid points (3 levels)
  const gridLevels = [0, 0.5, 1];

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Workout Volume (kg)</Text>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#8B5CF6" />
            <Stop offset="100%" stopColor="#EC4899" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {gridLevels.map((lvl, idx) => {
          const y = paddingTop + graphHeight * (1 - lvl);
          const value = Math.round(maxVolume * lvl);
          return (
            <G key={`grid-${idx}`}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={CHART_WIDTH - paddingRight}
                y2={y}
                stroke={COLORS.border}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <SvgText
                x={paddingLeft - 8}
                y={y + 4}
                fill={COLORS.textSecondary}
                fontSize={10}
                textAnchor="end"
              >
                {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
              </SvgText>
            </G>
          );
        })}

        {/* Bars */}
        {chartData.map((d, idx) => {
          const barHeight = (d.totalVolumeKg / maxVolume) * graphHeight;
          const x = paddingLeft + barSpacing + idx * (barWidth + barSpacing);
          const y = paddingTop + graphHeight - barHeight;

          // Format Date for label: MM/DD
          const dateObj = new Date(d.date);
          const dateLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;

          return (
            <G key={`bar-group-${idx}`}>
              {/* Rounded top rect */}
              <Rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 4)} // Ensure at least a sliver is visible
                rx={4}
                ry={4}
                fill="url(#barGrad)"
              />
              {/* Label */}
              <SvgText
                x={x + barWidth / 2}
                y={CHART_HEIGHT - 6}
                fill={COLORS.textSecondary}
                fontSize={10}
                textAnchor="middle"
              >
                {dateLabel}
              </SvgText>
              {/* Volume value tooltip style */}
              <SvgText
                x={x + barWidth / 2}
                y={y - 4}
                fill={COLORS.text}
                fontSize={9}
                fontWeight="bold"
                textAnchor="middle"
              >
                {d.totalVolumeKg}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

interface WeightChartProps {
  metrics: BodyMetric[];
}

export function WeightLineChart({ metrics }: WeightChartProps) {
  // Sort metrics by date ascending, take last 6
  const chartData = [...metrics]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-6);

  if (chartData.length === 0) return null;

  const weights = chartData.map(d => d.weight);
  const maxWeight = Math.max(...weights) + 1;
  const minWeight = Math.min(...weights) - 1;
  const weightRange = maxWeight - minWeight;

  const paddingLeft = 40;
  const paddingBottom = 25;
  const paddingTop = 15;
  const paddingRight = 15;
  
  const graphWidth = CHART_WIDTH - paddingLeft - paddingRight;
  const graphHeight = CHART_HEIGHT - paddingTop - paddingBottom;

  const points = chartData.map((d, idx) => {
    const x = paddingLeft + (idx / (chartData.length - 1)) * graphWidth;
    const y = paddingTop + graphHeight - ((d.weight - minWeight) / weightRange) * graphHeight;
    return { x, y, weight: d.weight, date: d.date };
  });

  // Build path string
  let pathD = '';
  let fillD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y}`;
    fillD = `M ${points[0].x} ${paddingTop + graphHeight} L ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      pathD += ` L ${points[i].x} ${points[i].y}`;
      fillD += ` L ${points[i].x} ${points[i].y}`;
    }
    fillD += ` L ${points[points.length - 1].x} ${paddingTop + graphHeight} Z`;
  }

  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Weight Progress (kg)</Text>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
        <Defs>
          <LinearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#00F2FE" />
            <Stop offset="100%" stopColor="#4FACFE" />
          </LinearGradient>
          <LinearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#00F2FE" stopOpacity="0.4" />
            <Stop offset="100%" stopColor="#4FACFE" stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((lvl, idx) => {
          const y = paddingTop + graphHeight * (1 - lvl);
          const val = (minWeight + weightRange * lvl).toFixed(1);
          return (
            <G key={`grid-${idx}`}>
              <Line
                x1={paddingLeft}
                y1={y}
                x2={CHART_WIDTH - paddingRight}
                y2={y}
                stroke={COLORS.border}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <SvgText
                x={paddingLeft - 8}
                y={y + 4}
                fill={COLORS.textSecondary}
                fontSize={10}
                textAnchor="end"
              >
                {val}
              </SvgText>
            </G>
          );
        })}

        {/* Gradient Fill Area */}
        {fillD ? <Path d={fillD} fill="url(#areaGrad)" /> : null}

        {/* Main Line */}
        {pathD ? (
          <Path
            d={pathD}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth={3}
            strokeLinecap="round"
          />
        ) : null}

        {/* Points */}
        {points.map((p, idx) => {
          const dateObj = new Date(p.date);
          const dateLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
          return (
            <G key={`point-${idx}`}>
              <Circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill={COLORS.white}
                stroke={COLORS.accentCyan}
                strokeWidth={2}
              />
              {/* Weight text tooltips */}
              <SvgText
                x={p.x}
                y={p.y - 8}
                fill={COLORS.text}
                fontSize={9}
                fontWeight="bold"
                textAnchor="middle"
              >
                {p.weight}
              </SvgText>
              {/* Date Label */}
              <SvgText
                x={p.x}
                y={CHART_HEIGHT - 6}
                fill={COLORS.textSecondary}
                fontSize={10}
                textAnchor="middle"
              >
                {dateLabel}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

interface MuscleSplitProps {
  logs: WorkoutLog[];
}

export function MuscleSplitDonutChart({ logs }: MuscleSplitProps) {
  // Aggregate sets by category
  const categories: Record<string, number> = {
    Chest: 0,
    Back: 0,
    Legs: 0,
    Shoulders: 0,
    Arms: 0,
    Core: 0
  };

  let totalSets = 0;
  logs.forEach(log => {
    log.exercises.forEach(ex => {
      if (categories[ex.category] !== undefined) {
        categories[ex.category] += ex.setsCount;
        totalSets += ex.setsCount;
      }
    });
  });

  // Fallback if no logs
  if (totalSets === 0) {
    categories.Chest = 10;
    categories.Back = 8;
    categories.Legs = 12;
    categories.Shoulders = 6;
    categories.Arms = 8;
    categories.Core = 4;
    totalSets = 48;
  }

  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const handleSelectCat = (category: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedCat(prev => prev === category ? null : category);
  };

  const COLORS_MAP: Record<string, string> = {
    Chest: '#8B5CF6',      // Violet
    Back: '#00F2FE',       // Cyan
    Legs: '#10B981',       // Emerald
    Shoulders: '#F59E0B',  // Amber
    Arms: '#EC4899',       // Pink
    Core: '#3B82F6',       // Blue
  };

  const donutSize = 110;
  const strokeWidth = 16;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  let accumulatedAngle = 0;
  const segments = Object.entries(categories)
    .filter(([_, count]) => count > 0)
    .map(([category, count]) => {
      const percentage = count / totalSets;
      const strokeOffset = circumference - percentage * circumference;
      const rotateAngle = (accumulatedAngle / totalSets) * 360;
      accumulatedAngle += count;

      return {
        category,
        count,
        percentage,
        strokeOffset,
        rotateAngle,
        color: COLORS_MAP[category] || COLORS.primary,
      };
    });

  // Determine displayed number and label in the center
  const displayNum = selectedCat ? categories[selectedCat] : totalSets;
  const displayLabel = selectedCat ? `${selectedCat}` : 'TOTAL SETS';

  const svgHeight = 180;
  const cx = CHART_WIDTH / 2;
  const cy = svgHeight / 2;

  return (
    <View style={styles.chartContainer}>
      {/* Tap anywhere on donut container to reset filter */}
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => setSelectedCat(null)}
        style={[styles.donutContainer, { width: CHART_WIDTH, height: svgHeight }]}
      >
        <Svg width={CHART_WIDTH} height={svgHeight}>
          {/* Background Ring for Premium Track look */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke="rgba(255, 255, 255, 0.03)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {segments.map((seg, idx) => {
            const isDimmed = selectedCat !== null && selectedCat !== seg.category;
            return (
              <Circle
                key={`donut-seg-${idx}`}
                cx={cx}
                cy={cy}
                r={radius}
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={seg.strokeOffset}
                strokeOpacity={isDimmed ? 0.15 : 1}
                fill="transparent"
                transform={`rotate(${seg.rotateAngle - 90} ${cx} ${cy})`}
              />
            );
          })}
          {/* Center inner mask circle */}
          <Circle
            cx={cx}
            cy={cy}
            r={radius - strokeWidth / 2 - 2}
            fill={COLORS.card}
          />

          {/* Segment outer text labels */}
          {segments.map((seg, idx) => {
            const isDimmed = selectedCat !== null && selectedCat !== seg.category;
            if (isDimmed) return null;
            
            const midAngle = seg.rotateAngle + (seg.percentage * 360) / 2 - 90;
            const rad = (midAngle * Math.PI) / 180;
            
            const labelRadius = radius + strokeWidth / 2 + 12;
            const lx = cx + labelRadius * Math.cos(rad);
            const ly = cy + labelRadius * Math.sin(rad) + 3; // vertical centering adjustment
            
            const textAnchor = Math.cos(rad) > 0.15 ? 'start' : Math.cos(rad) < -0.15 ? 'end' : 'middle';
            
            return (
              <SvgText
                key={`label-${idx}`}
                x={lx}
                y={ly}
                fill={seg.color}
                fontSize={10}
                fontWeight="800"
                textAnchor={textAnchor}
              >
                {seg.category}
              </SvgText>
            );
          })}
        </Svg>
        
        {/* Center label content */}
        <View style={[styles.donutCenterContent, { left: cx - 45, top: cy - 25, width: 90, height: 50 }]}>
          <Text style={styles.donutCenterNum}>{displayNum}</Text>
          <Text style={styles.donutCenterLabel} numberOfLines={1}>{displayLabel}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.fullWidthLegendContainer}>
        <Text style={styles.legendHeader}>Target Split</Text>
        <View style={styles.legendGrid}>
          {segments.map((seg, idx) => {
            const isSelected = selectedCat === seg.category;
            const isAnySelected = selectedCat !== null;
            const opacity = isAnySelected && !isSelected ? 0.45 : 1;
            
            return (
              <TouchableOpacity
                key={`legend-${idx}`}
                activeOpacity={0.7}
                onPress={() => handleSelectCat(seg.category)}
                style={[
                  styles.legendItem, 
                  isSelected && styles.legendItemActive,
                  { opacity }
                ]}
              >
                <View style={styles.legendItemLeft}>
                  <View style={[styles.legendIndicator, { backgroundColor: seg.color }]} />
                  <Text style={[styles.legendName, isSelected && styles.legendNameActive]} numberOfLines={1}>
                    {seg.category}
                  </Text>
                </View>
                <View style={[styles.pctBadge, { backgroundColor: isSelected ? seg.color : `${seg.color}15` }]}>
                  <Text style={[styles.legendPct, { color: isSelected ? COLORS.white : seg.color }]}>
                    {Math.round(seg.percentage * 100)}%
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_lg,
    alignItems: 'center',
  },
  chartTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  donutRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  donutCenterContent: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutCenterNum: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: '800',
  },
  donutCenterLabel: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginTop: 2,
    textTransform: 'uppercase',
    maxWidth: 90,
    textAlign: 'center',
  },
  fullWidthLegendContainer: {
    width: '100%',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  legendHeader: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '48%',
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  legendItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  legendItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 4,
  },
  legendIndicator: {
    width: 4,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  legendName: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  legendNameActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  pctBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendPct: {
    fontSize: 9,
    fontWeight: '700',
  },
});
