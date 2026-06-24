import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface CustomCalendarProps {
  onDateSelect: (dateStr: string) => void;
  selectedDate: string; // YYYY-MM-DD
  workoutDates: string[]; // List of YYYY-MM-DD where workouts occurred
}

export default function CustomCalendar({
  onDateSelect,
  selectedDate,
  workoutDates,
}: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Generate days of the month
  const getDaysInMonth = (y: number, m: number) => {
    const firstDay = new Date(y, m, 1);
    const days = [];
    
    // Day of the week the month starts on (0 for Sun, 6 for Sat)
    const startDay = firstDay.getDay();
    
    // Empty slots for previous month's wrapping
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    const lastDay = new Date(y, m + 1, 0).getDate();
    for (let i = 1; i <= lastDay; i++) {
      days.push(new Date(y, m, i));
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = getDaysInMonth(year, month);

  const formatDateStr = (date: Date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${y}-${m}-${d}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.monthText}>{`${monthNames[month]} ${year}`}</Text>
        <View style={styles.navigation}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <ChevronLeft size={18} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <ChevronRight size={18} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Days of week header */}
      <View style={styles.weekRow}>
        {daysOfWeek.map((day, idx) => (
          <Text key={idx} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Dates Grid */}
      <View style={styles.grid}>
        {days.map((date, idx) => {
          if (!date) {
            return <View key={`empty-${idx}`} style={styles.daySlot} />;
          }

          const dateStr = formatDateStr(date);
          const isSelected = dateStr === selectedDate;
          const hasWorkout = workoutDates.includes(dateStr);
          const isToday = formatDateStr(new Date()) === dateStr;

          return (
            <TouchableOpacity
              key={dateStr}
              onPress={() => onDateSelect(dateStr)}
              style={[
                styles.daySlot,
                isSelected && styles.selectedDaySlot,
                isToday && !isSelected && styles.todayDaySlot,
              ]}
            >
              <Text
                style={[
                  styles.dayText,
                  isSelected && styles.selectedDayText,
                  hasWorkout && !isSelected && styles.workoutDayText,
                  isToday && !isSelected && styles.todayDayText,
                ]}
              >
                {date.getDate()}
              </Text>
              
              {/* Workout indicator dot */}
              {hasWorkout && (
                <View
                  style={[
                    styles.workoutDot,
                    isSelected ? styles.selectedWorkoutDot : styles.normalWorkoutDot,
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_lg,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  navigation: {
    flexDirection: 'row',
  },
  navButton: {
    padding: 6,
    marginLeft: 8,
    borderRadius: SIZES.radius_sm,
    backgroundColor: COLORS.cardHeader,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekDayText: {
    width: '14.28%',
    textAlign: 'center',
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  daySlot: {
    width: '14.28%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderRadius: SIZES.radius_md,
    position: 'relative',
  },
  selectedDaySlot: {
    backgroundColor: COLORS.primary,
  },
  todayDaySlot: {
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  dayText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  selectedDayText: {
    color: COLORS.white,
    fontWeight: '700',
  },
  workoutDayText: {
    color: COLORS.accentCyan,
    fontWeight: '700',
  },
  todayDayText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  workoutDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 6,
  },
  normalWorkoutDot: {
    backgroundColor: COLORS.accentCyan,
  },
  selectedWorkoutDot: {
    backgroundColor: COLORS.white,
  },
});
