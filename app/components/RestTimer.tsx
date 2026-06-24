import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { COLORS, SIZES, SPACING } from '../constants/theme';
import { Play, Pause, Plus, Square } from 'lucide-react-native';
import CircularProgress from './CircularProgress';

interface RestTimerProps {
  visible: boolean;
  initialSeconds?: number;
  onClose: () => void;
}

export default function RestTimer({
  visible,
  initialSeconds = 90,
  onClose,
}: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (visible) {
      setSecondsLeft(initialSeconds);
      setIsActive(true);
    }
  }, [visible, initialSeconds]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (visible && isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      onClose();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [visible, isActive, secondsLeft, onClose]);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const handleAdd30s = () => {
    setSecondsLeft((prev) => prev + 30);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Guard percentage to be standard decimal
  const progress = Math.max(0, secondsLeft / (secondsLeft > initialSeconds ? secondsLeft : initialSeconds));

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>REST TIMER</Text>
          
          <View style={styles.progressContainer}>
            <CircularProgress
              size={160}
              strokeWidth={12}
              progress={progress}
              label={formatTime(secondsLeft)}
              subLabel="seconds left"
            />
          </View>

          <View style={styles.controlsRow}>
            {/* Play/Pause */}
            <TouchableOpacity onPress={handleToggle} style={styles.controlButton}>
              {isActive ? (
                <Pause size={20} color={COLORS.white} />
              ) : (
                <Play size={20} color={COLORS.white} />
              )}
            </TouchableOpacity>

            {/* +30s */}
            <TouchableOpacity onPress={handleAdd30s} style={styles.controlButton}>
              <Plus size={18} color={COLORS.white} />
              <Text style={styles.controlBtnText}>30s</Text>
            </TouchableOpacity>

            {/* Skip */}
            <TouchableOpacity onPress={onClose} style={[styles.controlButton, styles.skipButton]}>
              <Square size={16} color={COLORS.white} />
              <Text style={styles.controlBtnText}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 12, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.radius_xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  title: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 20,
  },
  progressContainer: {
    marginVertical: 10,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 24,
  },
  controlButton: {
    backgroundColor: COLORS.cardHeader,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: SIZES.radius_md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
  },
  skipButton: {
    backgroundColor: COLORS.error,
  },
  controlBtnText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
});
