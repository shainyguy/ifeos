// LifeOS Types - 2025 Edition

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  type: 'daily' | 'weekly' | 'custom' | 'quit';
  frequency?: number[]; // days of week for custom
  streak: number;
  bestStreak: number;
  completedDates: string[];
  createdAt: string;
  color: string;
  // For quit habits
  quitDate?: string;
  moneySavedPerDay?: number;
  healthBenefit?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  tags: string[];
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  recurring?: 'daily' | 'weekly' | 'monthly';
  subtasks?: { id: string; title: string; completed: boolean }[];
}

export interface FinanceCategory {
  id: string;
  name: string;
  emoji: string;
  budget: number;
  spent: number;
  color: string;
  isFixed?: boolean; // фиксированные расходы (аренда, подписки)
}

export interface IncomeSource {
  id: string;
  name: string;
  emoji: string;
  amount: number;
  isMonthly: boolean; // ежемесячный или разовый
  date: string;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  emoji: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  color: string;
}

export interface FinanceSettings {
  monthlyIncome: number;
  investmentPercent: number;
  savingsPercent: number;
  expensesPercent: number;
  emergencyPercent: number;
}

export interface PomodoroSession {
  id: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: 'work' | 'break';
  completed: boolean;
  taskId?: string;
}

export interface WaterEntry {
  id: string;
  amount: number;
  time: string;
  date: string;
}

// New: Sleep tracking
export interface SleepEntry {
  id: string;
  date: string;
  bedTime: string;
  wakeTime: string;
  duration: number; // in minutes
  quality: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  dreams?: string;
  factors?: ('caffeine' | 'exercise' | 'screen' | 'stress' | 'alcohol')[];
}

// New: Mood tracking
export interface MoodEntry {
  id: string;
  date: string;
  time: string;
  mood: 1 | 2 | 3 | 4 | 5; // 1=terrible, 5=amazing
  energy: 1 | 2 | 3 | 4 | 5;
  note?: string;
  activities?: string[];
}

// New: Journal/Gratitude
export interface JournalEntry {
  id: string;
  date: string;
  gratitude: string[];
  highlights: string;
  improvements: string;
  mood: number;
}

// New: Breathing exercise
export interface BreathingSession {
  id: string;
  date: string;
  technique: 'box' | '478' | 'calm' | 'energize';
  duration: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt?: string;
  xpReward: number;
  requirement: string;
  progress?: number;
  target?: number;
}

export interface UserProfile {
  name: string;
  avatar?: string;
  level: number;
  xp: number;
  totalXp: number;
  title: string;
  streak: number;
  achievements: string[];
  dailyBonusClaimed?: string;
  joinedAt: string;
  theme: 'light' | 'dark' | 'auto';
}

export interface DailyStats {
  date: string;
  habitsCompleted: number;
  habitsTotal: number;
  tasksCompleted: number;
  pomodoroMinutes: number;
  waterMl: number;
  sleepMinutes: number;
  sleepQuality: number;
  mood: number;
  energy: number;
  xpEarned: number;
}

export interface AppState {
  // User
  profile: UserProfile;
  
  // Habits
  habits: Habit[];
  
  // Tasks
  tasks: Task[];
  
  // Finance
  financeSettings: FinanceSettings;
  categories: FinanceCategory[];
  incomeSources: IncomeSource[];
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  
  // Pomodoro
  pomodoroSessions: PomodoroSession[];
  pomodoroSettings: {
    workDuration: number;
    breakDuration: number;
    longBreakDuration: number;
    sessionsUntilLongBreak: number;
    soundEnabled: boolean;
    autoStart: boolean;
  };
  
  // Water
  waterEntries: WaterEntry[];
  waterGoal: number;
  
  // Sleep
  sleepEntries: SleepEntry[];
  sleepGoal: number; // in minutes
  
  // Mood
  moodEntries: MoodEntry[];
  
  // Journal
  journalEntries: JournalEntry[];
  
  // Breathing
  breathingSessions: BreathingSession[];
  
  // Achievements
  achievements: Achievement[];
  
  // Daily Stats
  dailyStats: DailyStats[];
  
  // Quote of the day
  dailyQuote: {
    text: string;
    author: string;
    date: string;
  };
}

export type Page = 'dashboard' | 'habits' | 'tasks' | 'finance' | 'focus' | 'wellness' | 'stats' | 'profile';
