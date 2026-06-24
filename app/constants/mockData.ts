export interface Exercise {
  id: string;
  name: string;
  category: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';
  equipment: 'Barbell' | 'Dumbbell' | 'Cable' | 'Machine' | 'Bodyweight';
  instructions: string;
  image?: string;
}

export interface SetLog {
  id: string;
  weight: number; // in kg
  reps: number;
  completed: boolean;
  previous?: string; // e.g. "60kg x 8"
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';
  sets: SetLog[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  durationMin: number;
  exercisesCount: number;
  exercises: WorkoutExercise[];
  lastPerformed?: string; // Date string
}

export interface WorkoutLog {
  id: string;
  templateId?: string;
  name: string;
  date: string; // YYYY-MM-DD
  durationMin: number;
  totalVolumeKg: number;
  exercises: {
    exerciseName: string;
    category: 'Chest' | 'Back' | 'Legs' | 'Shoulders' | 'Arms' | 'Core';
    setsCount: number;
    bestSet: string; // e.g. "80kg x 6"
  }[];
}

export interface BodyMetric {
  date: string; // YYYY-MM-DD
  weight: number; // in kg
  bodyFat?: number; // in %
  waist?: number; // in cm
  chest?: number; // in cm
  biceps?: number; // in cm
}

export interface UserProfile {
  name: string;
  goal: string;
  fitnessLevel: string;
  heightCm: number;
  targetWeightKg: number;
  currentWeightKg: number;
  streakDays: number;
  lastWorkoutDate?: string;
}

// 1. Exercise Library
export const EXERCISES: Exercise[] = [
  {
    id: 'ex-1',
    name: 'Flat Barbell Bench Press',
    category: 'Chest',
    equipment: 'Barbell',
    instructions: 'Lie flat on a bench. Grip the barbell slightly wider than shoulder-width. Lower the bar to your chest, then push it back up with control.'
  },
  {
    id: 'ex-2',
    name: 'Incline Dumbbell Press',
    category: 'Chest',
    equipment: 'Dumbbell',
    instructions: 'Set an incline bench to 30-45 degrees. Raise dumbbells to shoulder level and press upward until arms are extended, then slowly lower.'
  },
  {
    id: 'ex-3',
    name: 'Cable Crossover',
    category: 'Chest',
    equipment: 'Cable',
    instructions: 'Stand between high cable pulleys. Pull handles downward and inward in a wide arc, crossing your hands slightly in front of your waist.'
  },
  {
    id: 'ex-4',
    name: 'Bent Over Barbell Row',
    category: 'Back',
    equipment: 'Barbell',
    instructions: 'Hinge at your hips, keeping your back straight. Pull the barbell up toward your lower chest, squeezing your shoulder blades together.'
  },
  {
    id: 'ex-5',
    name: 'Lat Pulldown',
    category: 'Back',
    equipment: 'Machine',
    instructions: 'Sit at a lat pulldown machine. Pull the bar down to your collarbone while keeping your chest raised and elbows pointing down.'
  },
  {
    id: 'ex-6',
    name: 'Pull-up',
    category: 'Back',
    equipment: 'Bodyweight',
    instructions: 'Grip a pull-up bar wider than shoulder width. Pull your body up until your chin clears the bar, then lower with control.'
  },
  {
    id: 'ex-7',
    name: 'Barbell Back Squat',
    category: 'Legs',
    equipment: 'Barbell',
    instructions: 'Rest a barbell on your upper back. Squat down by pushing your hips back and bending your knees. Keep knees aligned over feet, then stand.'
  },
  {
    id: 'ex-8',
    name: 'Romanian Deadlift',
    category: 'Legs',
    equipment: 'Barbell',
    instructions: 'Hold a barbell. Hinge at hips, bending knees slightly, and lower the bar along your shins until you feel a hamstring stretch. Return.'
  },
  {
    id: 'ex-9',
    name: 'Leg Press',
    category: 'Legs',
    equipment: 'Machine',
    instructions: 'Sit in the leg press machine. Place feet shoulder-width on the sled. Lower the sled by bending knees, then press it away without locking knees.'
  },
  {
    id: 'ex-10',
    name: 'Overhead Barbell Press',
    category: 'Shoulders',
    equipment: 'Barbell',
    instructions: 'Stand straight, holding the barbell at your collarbone. Press the bar straight overhead, locking out your arms at the top.'
  },
  {
    id: 'ex-11',
    name: 'Dumbbell Lateral Raise',
    category: 'Shoulders',
    equipment: 'Dumbbell',
    instructions: 'Stand with dumbbells at your sides. Lift weights outward to shoulder height, keeping a slight bend in your elbows. Lower slowly.'
  },
  {
    id: 'ex-12',
    name: 'Dumbbell Bicep Curl',
    category: 'Arms',
    equipment: 'Dumbbell',
    instructions: 'Stand holding dumbbells. Curl weights up toward shoulders, rotating wrists so palms face up. Squeeze biceps, then lower.'
  },
  {
    id: 'ex-13',
    name: 'Tricep Rope Pushdown',
    category: 'Arms',
    equipment: 'Cable',
    instructions: 'Attach a rope to a cable pulley. Stand close, grip the rope, and push it down toward your thighs, extending your arms fully.'
  },
  {
    id: 'ex-14',
    name: 'Hanging Leg Raise',
    category: 'Core',
    equipment: 'Bodyweight',
    instructions: 'Hang from a pull-up bar. Keep legs straight and lift them up until they are parallel to the floor. Lower slowly without swinging.'
  },
  {
    id: 'ex-15',
    name: 'Ab Planks',
    category: 'Core',
    equipment: 'Bodyweight',
    instructions: 'Hold your body in a straight line from head to heels, supporting yourself on your elbows/forearms and toes. Keep core engaged.'
  }
];

// 2. Default Workout Templates
export const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'temp-push',
    name: 'Push Day (Chest/Shoulders/Triceps)',
    durationMin: 45,
    exercisesCount: 4,
    lastPerformed: '2026-06-22',
    exercises: [
      {
        id: 'we-p1',
        exerciseId: 'ex-1',
        exerciseName: 'Flat Barbell Bench Press',
        category: 'Chest',
        sets: [
          { id: 'p1-s1', weight: 60, reps: 10, completed: false, previous: '60kg x 10' },
          { id: 'p1-s2', weight: 65, reps: 8, completed: false, previous: '60kg x 9' },
          { id: 'p1-s3', weight: 65, reps: 8, completed: false, previous: '65kg x 7' }
        ]
      },
      {
        id: 'we-p2',
        exerciseId: 'ex-2',
        exerciseName: 'Incline Dumbbell Press',
        category: 'Chest',
        sets: [
          { id: 'p2-s1', weight: 22, reps: 12, completed: false, previous: '20kg x 12' },
          { id: 'p2-s2', weight: 24, reps: 10, completed: false, previous: '22kg x 10' },
          { id: 'p2-s3', weight: 24, reps: 8, completed: false, previous: '24kg x 8' }
        ]
      },
      {
        id: 'we-p3',
        exerciseId: 'ex-10',
        exerciseName: 'Overhead Barbell Press',
        category: 'Shoulders',
        sets: [
          { id: 'p3-s1', weight: 40, reps: 8, completed: false, previous: '40kg x 8' },
          { id: 'p3-s2', weight: 40, reps: 8, completed: false, previous: '40kg x 8' },
          { id: 'p3-s3', weight: 45, reps: 6, completed: false, previous: '40kg x 7' }
        ]
      },
      {
        id: 'we-p4',
        exerciseId: 'ex-13',
        exerciseName: 'Tricep Rope Pushdown',
        category: 'Arms',
        sets: [
          { id: 'p4-s1', weight: 18, reps: 15, completed: false, previous: '18kg x 12' },
          { id: 'p4-s2', weight: 20, reps: 12, completed: false, previous: '20kg x 10' },
          { id: 'p4-s3', weight: 20, reps: 12, completed: false, previous: '20kg x 10' }
        ]
      }
    ]
  },
  {
    id: 'temp-pull',
    name: 'Pull Day (Back/Biceps/Core)',
    durationMin: 50,
    exercisesCount: 4,
    lastPerformed: '2026-06-20',
    exercises: [
      {
        id: 'we-pl1',
        exerciseId: 'ex-4',
        exerciseName: 'Bent Over Barbell Row',
        category: 'Back',
        sets: [
          { id: 'pl1-s1', weight: 50, reps: 12, completed: false, previous: '50kg x 12' },
          { id: 'pl1-s2', weight: 55, reps: 10, completed: false, previous: '50kg x 10' },
          { id: 'pl1-s3', weight: 55, reps: 10, completed: false, previous: '55kg x 8' }
        ]
      },
      {
        id: 'we-pl2',
        exerciseId: 'ex-5',
        exerciseName: 'Lat Pulldown',
        category: 'Back',
        sets: [
          { id: 'pl2-s1', weight: 45, reps: 12, completed: false, previous: '45kg x 12' },
          { id: 'pl2-s2', weight: 50, reps: 10, completed: false, previous: '45kg x 10' },
          { id: 'pl2-s3', weight: 50, reps: 8, completed: false, previous: '50kg x 8' }
        ]
      },
      {
        id: 'we-pl3',
        exerciseId: 'ex-12',
        exerciseName: 'Dumbbell Bicep Curl',
        category: 'Arms',
        sets: [
          { id: 'pl3-s1', weight: 14, reps: 12, completed: false, previous: '12kg x 12' },
          { id: 'pl3-s2', weight: 14, reps: 12, completed: false, previous: '14kg x 10' },
          { id: 'pl3-s3', weight: 16, reps: 10, completed: false, previous: '14kg x 10' }
        ]
      },
      {
        id: 'we-pl4',
        exerciseId: 'ex-14',
        exerciseName: 'Hanging Leg Raise',
        category: 'Core',
        sets: [
          { id: 'pl4-s1', weight: 0, reps: 15, completed: false, previous: '12 reps' },
          { id: 'pl4-s2', weight: 0, reps: 12, completed: false, previous: '12 reps' }
        ]
      }
    ]
  },
  {
    id: 'temp-legs',
    name: 'Leg Day (Quads/Hamstrings/Calves)',
    durationMin: 55,
    exercisesCount: 3,
    lastPerformed: '2026-06-24',
    exercises: [
      {
        id: 'we-l1',
        exerciseId: 'ex-7',
        exerciseName: 'Barbell Back Squat',
        category: 'Legs',
        sets: [
          { id: 'l1-s1', weight: 80, reps: 8, completed: false, previous: '80kg x 8' },
          { id: 'l1-s2', weight: 85, reps: 8, completed: false, previous: '80kg x 8' },
          { id: 'l1-s3', weight: 90, reps: 6, completed: false, previous: '85kg x 6' }
        ]
      },
      {
        id: 'we-l2',
        exerciseId: 'ex-8',
        exerciseName: 'Romanian Deadlift',
        category: 'Legs',
        sets: [
          { id: 'l2-s1', weight: 70, reps: 10, completed: false, previous: '70kg x 10' },
          { id: 'l2-s2', weight: 75, reps: 8, completed: false, previous: '70kg x 8' },
          { id: 'l2-s3', weight: 75, reps: 8, completed: false, previous: '75kg x 8' }
        ]
      },
      {
        id: 'we-l3',
        exerciseId: 'ex-9',
        exerciseName: 'Leg Press',
        category: 'Legs',
        sets: [
          { id: 'l3-s1', weight: 150, reps: 12, completed: false, previous: '140kg x 12' },
          { id: 'l3-s2', weight: 160, reps: 10, completed: false, previous: '150kg x 10' },
          { id: 'l3-s3', weight: 180, reps: 8, completed: false, previous: '160kg x 8' }
        ]
      }
    ]
  }
];

// 3. Log History
export const WORKOUT_LOGS: WorkoutLog[] = [
  {
    id: 'log-1',
    templateId: 'temp-push',
    name: 'Push Day (Chest/Shoulders/Triceps)',
    date: '2026-06-22',
    durationMin: 46,
    totalVolumeKg: 1980,
    exercises: [
      { exerciseName: 'Flat Barbell Bench Press', category: 'Chest', setsCount: 3, bestSet: '65kg x 8' },
      { exerciseName: 'Incline Dumbbell Press', category: 'Chest', setsCount: 3, bestSet: '24kg x 8' },
      { exerciseName: 'Overhead Barbell Press', category: 'Shoulders', setsCount: 3, bestSet: '45kg x 6' },
      { exerciseName: 'Tricep Rope Pushdown', category: 'Arms', setsCount: 3, bestSet: '20kg x 12' }
    ]
  },
  {
    id: 'log-2',
    templateId: 'temp-pull',
    name: 'Pull Day (Back/Biceps/Core)',
    date: '2026-06-20',
    durationMin: 48,
    totalVolumeKg: 1560,
    exercises: [
      { exerciseName: 'Bent Over Barbell Row', category: 'Back', setsCount: 3, bestSet: '55kg x 10' },
      { exerciseName: 'Lat Pulldown', category: 'Back', setsCount: 3, bestSet: '50kg x 8' },
      { exerciseName: 'Dumbbell Bicep Curl', category: 'Arms', setsCount: 3, bestSet: '16kg x 10' },
      { exerciseName: 'Hanging Leg Raise', category: 'Core', setsCount: 2, bestSet: 'Bodyweight x 15' }
    ]
  },
  {
    id: 'log-3',
    templateId: 'temp-legs',
    name: 'Leg Day (Quads/Hamstrings/Calves)',
    date: '2026-06-18',
    durationMin: 54,
    totalVolumeKg: 3820,
    exercises: [
      { exerciseName: 'Barbell Back Squat', category: 'Legs', setsCount: 3, bestSet: '90kg x 6' },
      { exerciseName: 'Romanian Deadlift', category: 'Legs', setsCount: 3, bestSet: '75kg x 8' },
      { exerciseName: 'Leg Press', category: 'Legs', setsCount: 3, bestSet: '180kg x 8' }
    ]
  },
  {
    id: 'log-4',
    templateId: 'temp-push',
    name: 'Push Day (Chest/Shoulders/Triceps)',
    date: '2026-06-15',
    durationMin: 42,
    totalVolumeKg: 1850,
    exercises: [
      { exerciseName: 'Flat Barbell Bench Press', category: 'Chest', setsCount: 3, bestSet: '60kg x 10' },
      { exerciseName: 'Incline Dumbbell Press', category: 'Chest', setsCount: 3, bestSet: '22kg x 10' },
      { exerciseName: 'Overhead Barbell Press', category: 'Shoulders', setsCount: 3, bestSet: '40kg x 8' }
    ]
  },
  {
    id: 'log-5',
    templateId: 'temp-pull',
    name: 'Pull Day (Back/Biceps/Core)',
    date: '2026-06-12',
    durationMin: 45,
    totalVolumeKg: 1480,
    exercises: [
      { exerciseName: 'Bent Over Barbell Row', category: 'Back', setsCount: 3, bestSet: '50kg x 12' },
      { exerciseName: 'Lat Pulldown', category: 'Back', setsCount: 3, bestSet: '45kg x 10' }
    ]
  }
];

// 4. Body Metrics Log History (30 days)
export const BODY_METRICS: BodyMetric[] = [
  { date: '2026-06-01', weight: 78.5, bodyFat: 16.5, waist: 84.5 },
  { date: '2026-06-05', weight: 78.2, bodyFat: 16.3 },
  { date: '2026-06-10', weight: 77.9, bodyFat: 16.1, waist: 84.0 },
  { date: '2026-06-15', weight: 78.0, bodyFat: 16.0 },
  { date: '2026-06-20', weight: 77.6, bodyFat: 15.8, waist: 83.2 },
  { date: '2026-06-24', weight: 77.3, bodyFat: 15.6, waist: 82.8 }
];

// 5. User Profile
export const DEFAULT_USER: UserProfile = {
  name: 'Rohan',
  goal: 'Build Muscle & Lose Fat',
  fitnessLevel: 'Intermediate',
  heightCm: 178,
  targetWeightKg: 74.0,
  currentWeightKg: 77.3,
  streakDays: 5,
  lastWorkoutDate: '2026-06-24'
};
