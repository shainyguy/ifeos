import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppState, Habit, Task, Expense, SavingsGoal, WaterEntry,
  PomodoroSession, Achievement, SleepEntry, MoodEntry, JournalEntry,
  BreathingSession, FinanceCategory
} from '@/types';

// Inspirational quotes
const quotes = [
  { text: "Дисциплина — это мост между целями и достижениями.", author: "Джим Рон" },
  { text: "Маленькие ежедневные улучшения — ключ к потрясающим долгосрочным результатам.", author: "Робин Шарма" },
  { text: "Ты не поднимаешься до уровня своих целей. Ты падаешь до уровня своих систем.", author: "Джеймс Клир" },
  { text: "Успех — это сумма небольших усилий, повторяемых изо дня в день.", author: "Роберт Кольер" },
  { text: "Единственный способ сделать великую работу — любить то, что делаешь.", author: "Стив Джобс" },
  { text: "Не жди идеального момента. Возьми момент и сделай его идеальным.", author: "Зиг Зиглар" },
  { text: "Инвестируй в себя. Твоя карьера — это двигатель твоего богатства.", author: "Пол Клитеро" },
  { text: "Здоровье — это инвестиция, а не расход.", author: "Неизвестный" },
];

const getRandomQuote = () => quotes[Math.floor(Math.random() * quotes.length)];

// Initial achievements with proper structure
const initialAchievements: Achievement[] = [
  { id: '1', name: 'Первые шаги', description: 'Выполни первую привычку', emoji: '👣', xpReward: 50, requirement: 'habit_1', target: 1, progress: 0 },
  { id: '2', name: 'На неделе', description: '7-дневная серия привычек', emoji: '🔥', xpReward: 200, requirement: 'streak_7', target: 7, progress: 0 },
  { id: '3', name: 'Месяц силы', description: '30-дневная серия', emoji: '💪', xpReward: 500, requirement: 'streak_30', target: 30, progress: 0 },
  { id: '4', name: 'Мастер задач', description: 'Выполни 50 задач', emoji: '✅', xpReward: 300, requirement: 'tasks_50', target: 50, progress: 0 },
  { id: '5', name: 'Фокус-мастер', description: '10 часов в Pomodoro', emoji: '🎯', xpReward: 400, requirement: 'pomodoro_600', target: 600, progress: 0 },
  { id: '6', name: 'Водный баланс', description: '7 дней с нормой воды', emoji: '💧', xpReward: 150, requirement: 'water_7', target: 7, progress: 0 },
  { id: '7', name: 'Финансовый гуру', description: 'Накопи 100,000₽', emoji: '💰', xpReward: 1000, requirement: 'savings_100000', target: 100000, progress: 0 },
  { id: '8', name: 'Сонное царство', description: '7 дней качественного сна', emoji: '😴', xpReward: 200, requirement: 'sleep_7', target: 7, progress: 0 },
  { id: '9', name: 'Дзен мастер', description: '10 сессий дыхания', emoji: '🧘', xpReward: 150, requirement: 'breathing_10', target: 10, progress: 0 },
  { id: '10', name: 'Писатель', description: '7 записей в дневнике', emoji: '📝', xpReward: 200, requirement: 'journal_7', target: 7, progress: 0 },
];

// Default finance categories
const defaultCategories: FinanceCategory[] = [
  { id: '1', name: 'Еда', emoji: '🍕', budget: 15000, spent: 0, color: '#f97316' },
  { id: '2', name: 'Транспорт', emoji: '🚗', budget: 5000, spent: 0, color: '#3b82f6' },
  { id: '3', name: 'Развлечения', emoji: '🎮', budget: 5000, spent: 0, color: '#8b5cf6' },
  { id: '4', name: 'Здоровье', emoji: '💊', budget: 3000, spent: 0, color: '#10b981' },
  { id: '5', name: 'Подписки', emoji: '📱', budget: 2000, spent: 0, color: '#ec4899' },
  { id: '6', name: 'Другое', emoji: '📦', budget: 5000, spent: 0, color: '#6b7280' },
];

interface StoreActions {
  // Habits
  addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates' | 'createdAt'>) => void;
  toggleHabit: (id: string, date: string) => void;
  deleteHabit: (id: string) => void;
  resetHabitStreak: (id: string) => void;
  
  // Tasks
  addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  
  // Finance
  updateFinanceSettings: (settings: Partial<AppState['financeSettings']>) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  updateSavingsGoal: (id: string, amount: number) => void;
  deleteSavingsGoal: (id: string) => void;
  addCategory: (category: Omit<FinanceCategory, 'id' | 'spent'>) => void;
  
  // Pomodoro
  addPomodoroSession: (session: Omit<PomodoroSession, 'id'>) => void;
  
  // Water
  addWaterEntry: (amount: number) => void;
  setWaterGoal: (goal: number) => void;
  
  // Sleep
  addSleepEntry: (entry: Omit<SleepEntry, 'id'>) => void;
  updateSleepEntry: (id: string, updates: Partial<SleepEntry>) => void;
  setSleepGoal: (goal: number) => void;
  
  // Mood
  addMoodEntry: (entry: Omit<MoodEntry, 'id'>) => void;
  
  // Journal
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  
  // Breathing
  addBreathingSession: (session: Omit<BreathingSession, 'id'>) => void;
  
  // Profile & XP
  addXp: (amount: number) => void;
  claimDailyBonus: () => void;
  updateProfile: (updates: Partial<AppState['profile']>) => void;
  
  // Achievements
  checkAchievements: () => void;
  
  // Utils
  getDailyStats: (date: string) => AppState['dailyStats'][0] | undefined;
  refreshQuote: () => void;
  exportData: () => string;
  importData: (data: string) => void;
  resetAll: () => void;
}

const today = () => new Date().toISOString().split('T')[0];

const initialState: AppState = {
  profile: {
    name: 'User',
    level: 1,
    xp: 0,
    totalXp: 0,
    title: 'Новичок',
    streak: 0,
    achievements: [],
    joinedAt: new Date().toISOString(),
    theme: 'light',
  },
  habits: [],
  tasks: [],
  financeSettings: {
    monthlyIncome: 100000,
    investmentPercent: 20,
    savingsPercent: 20,
    expensesPercent: 50,
    emergencyPercent: 10,
  },
  categories: defaultCategories,
  expenses: [],
  savingsGoals: [],
  pomodoroSessions: [],
  pomodoroSettings: {
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    soundEnabled: true,
    autoStart: false,
  },
  waterEntries: [],
  waterGoal: 2000,
  sleepEntries: [],
  sleepGoal: 480, // 8 hours in minutes
  moodEntries: [],
  journalEntries: [],
  breathingSessions: [],
  achievements: initialAchievements,
  dailyStats: [],
  dailyQuote: { ...getRandomQuote(), date: today() },
};

export const useStore = create<AppState & StoreActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Habits
      addHabit: (habit) => {
        const newHabit: Habit = {
          ...habit,
          id: crypto.randomUUID(),
          streak: 0,
          bestStreak: 0,
          completedDates: [],
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
      },

      toggleHabit: (id, date) => {
        set((state) => {
          const habits = state.habits.map((h) => {
            if (h.id !== id) return h;
            
            const completed = h.completedDates.includes(date);
            let newDates: string[];
            let newStreak = h.streak;
            
            if (completed) {
              newDates = h.completedDates.filter((d) => d !== date);
              newStreak = Math.max(0, h.streak - 1);
            } else {
              newDates = [...h.completedDates, date];
              newStreak = h.streak + 1;
            }
            
            return {
              ...h,
              completedDates: newDates,
              streak: newStreak,
              bestStreak: Math.max(h.bestStreak, newStreak),
            };
          });
          
          // Add XP for completing habit
          const habit = state.habits.find(h => h.id === id);
          if (habit && !habit.completedDates.includes(date)) {
            setTimeout(() => get().addXp(15), 0);
          }
          
          return { habits };
        });
      },

      deleteHabit: (id) => {
        set((state) => ({ habits: state.habits.filter((h) => h.id !== id) }));
      },

      resetHabitStreak: (id) => {
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, streak: 0 } : h
          ),
        }));
      },

      // Tasks
      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: crypto.randomUUID(),
          completed: false,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      toggleTask: (id) => {
        set((state) => {
          const tasks = state.tasks.map((t) => {
            if (t.id !== id) return t;
            const completing = !t.completed;
            if (completing) {
              setTimeout(() => get().addXp(t.priority === 'high' ? 30 : t.priority === 'medium' ? 20 : 10), 0);
            }
            return {
              ...t,
              completed: completing,
              completedAt: completing ? new Date().toISOString() : undefined,
            };
          });
          return { tasks };
        });
      },

      deleteTask: (id) => {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      // Finance
      updateFinanceSettings: (settings) => {
        set((state) => ({
          financeSettings: { ...state.financeSettings, ...settings },
        }));
      },

      addExpense: (expense) => {
        const newExpense: Expense = {
          ...expense,
          id: crypto.randomUUID(),
        };
        set((state) => {
          // Update category spent
          const categories = state.categories.map(c => 
            c.id === expense.categoryId 
              ? { ...c, spent: c.spent + expense.amount }
              : c
          );
          return { 
            expenses: [...state.expenses, newExpense],
            categories 
          };
        });
      },

      deleteExpense: (id) => {
        set((state) => {
          const expense = state.expenses.find(e => e.id === id);
          if (!expense) return state;
          
          const categories = state.categories.map(c =>
            c.id === expense.categoryId
              ? { ...c, spent: Math.max(0, c.spent - expense.amount) }
              : c
          );
          return { 
            expenses: state.expenses.filter((e) => e.id !== id),
            categories 
          };
        });
      },

      addSavingsGoal: (goal) => {
        const newGoal: SavingsGoal = {
          ...goal,
          id: crypto.randomUUID(),
          currentAmount: 0,
        };
        set((state) => ({ savingsGoals: [...state.savingsGoals, newGoal] }));
      },

      updateSavingsGoal: (id, amount) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.map((g) =>
            g.id === id ? { ...g, currentAmount: Math.max(0, g.currentAmount + amount) } : g
          ),
        }));
      },

      deleteSavingsGoal: (id) => {
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((g) => g.id !== id),
        }));
      },

      addCategory: (category) => {
        const newCategory: FinanceCategory = {
          ...category,
          id: crypto.randomUUID(),
          spent: 0,
        };
        set((state) => ({ categories: [...state.categories, newCategory] }));
      },

      // Pomodoro
      addPomodoroSession: (session) => {
        const newSession: PomodoroSession = {
          ...session,
          id: crypto.randomUUID(),
        };
        set((state) => {
          if (session.type === 'work' && session.completed) {
            setTimeout(() => get().addXp(25), 0);
          }
          return { pomodoroSessions: [...state.pomodoroSessions, newSession] };
        });
      },

      // Water
      addWaterEntry: (amount) => {
        const entry: WaterEntry = {
          id: crypto.randomUUID(),
          amount,
          time: new Date().toISOString(),
          date: today(),
        };
        set((state) => {
          const todayTotal = state.waterEntries
            .filter((e) => e.date === today())
            .reduce((sum, e) => sum + e.amount, 0);
          
          if (todayTotal < state.waterGoal && todayTotal + amount >= state.waterGoal) {
            setTimeout(() => get().addXp(20), 0);
          }
          
          return { waterEntries: [...state.waterEntries, entry] };
        });
      },

      setWaterGoal: (goal) => {
        set({ waterGoal: goal });
      },

      // Sleep
      addSleepEntry: (entry) => {
        const newEntry: SleepEntry = {
          ...entry,
          id: crypto.randomUUID(),
        };
        set((state) => {
          if (entry.quality >= 4) {
            setTimeout(() => get().addXp(20), 0);
          }
          return { sleepEntries: [...state.sleepEntries, newEntry] };
        });
      },

      updateSleepEntry: (id, updates) => {
        set((state) => ({
          sleepEntries: state.sleepEntries.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      setSleepGoal: (goal) => {
        set({ sleepGoal: goal });
      },

      // Mood
      addMoodEntry: (entry) => {
        const newEntry: MoodEntry = {
          ...entry,
          id: crypto.randomUUID(),
        };
        set((state) => ({ moodEntries: [...state.moodEntries, newEntry] }));
      },

      // Journal
      addJournalEntry: (entry) => {
        const newEntry: JournalEntry = {
          ...entry,
          id: crypto.randomUUID(),
        };
        set((state) => {
          setTimeout(() => get().addXp(30), 0);
          return { journalEntries: [...state.journalEntries, newEntry] };
        });
      },

      // Breathing
      addBreathingSession: (session) => {
        const newSession: BreathingSession = {
          ...session,
          id: crypto.randomUUID(),
        };
        set((state) => {
          if (session.completed) {
            setTimeout(() => get().addXp(15), 0);
          }
          return { breathingSessions: [...state.breathingSessions, newSession] };
        });
      },

      // Profile & XP
      addXp: (amount) => {
        set((state) => {
          let newXp = state.profile.xp + amount;
          let newLevel = state.profile.level;
          let newTotalXp = state.profile.totalXp + amount;
          
          const xpForLevel = (level: number) => level * 100 + (level - 1) * 50;
          
          while (newXp >= xpForLevel(newLevel)) {
            newXp -= xpForLevel(newLevel);
            newLevel++;
          }
          
          const titles = [
            'Новичок', 'Ученик', 'Практик', 'Воин', 'Мастер',
            'Эксперт', 'Гуру', 'Легенда', 'Титан', 'Бог дисциплины'
          ];
          const titleIndex = Math.min(Math.floor(newLevel / 5), titles.length - 1);
          
          return {
            profile: {
              ...state.profile,
              xp: newXp,
              level: newLevel,
              totalXp: newTotalXp,
              title: titles[titleIndex],
            },
          };
        });
        
        setTimeout(() => get().checkAchievements(), 100);
      },

      claimDailyBonus: () => {
        const todayStr = today();
        set((state) => {
          if (state.profile.dailyBonusClaimed === todayStr) return state;
          
          setTimeout(() => get().addXp(50), 0);
          
          return {
            profile: {
              ...state.profile,
              dailyBonusClaimed: todayStr,
              streak: state.profile.streak + 1,
            },
          };
        });
      },

      updateProfile: (updates) => {
        set((state) => ({
          profile: { ...state.profile, ...updates },
        }));
      },

      // Achievements
      checkAchievements: () => {
        set((state) => {
          const achievements = state.achievements.map((a) => {
            if (a.unlockedAt) return a;
            
            let progress = 0;
            let unlocked = false;
            
            switch (a.requirement) {
              case 'habit_1':
                progress = state.habits.reduce((sum, h) => sum + h.completedDates.length, 0);
                unlocked = progress >= 1;
                break;
              case 'streak_7':
                progress = Math.max(...state.habits.map(h => h.streak), 0);
                unlocked = progress >= 7;
                break;
              case 'streak_30':
                progress = Math.max(...state.habits.map(h => h.streak), 0);
                unlocked = progress >= 30;
                break;
              case 'tasks_50':
                progress = state.tasks.filter(t => t.completed).length;
                unlocked = progress >= 50;
                break;
              case 'pomodoro_600':
                progress = state.pomodoroSessions
                  .filter(s => s.type === 'work' && s.completed)
                  .reduce((sum, s) => sum + s.duration, 0);
                unlocked = progress >= 600;
                break;
              case 'water_7':
                const waterDays = new Set(
                  state.waterEntries
                    .filter(e => {
                      const dayTotal = state.waterEntries
                        .filter(we => we.date === e.date)
                        .reduce((sum, we) => sum + we.amount, 0);
                      return dayTotal >= state.waterGoal;
                    })
                    .map(e => e.date)
                ).size;
                progress = waterDays;
                unlocked = waterDays >= 7;
                break;
              case 'savings_100000':
                progress = state.savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
                unlocked = progress >= 100000;
                break;
              case 'sleep_7':
                progress = state.sleepEntries.filter(s => s.quality >= 4).length;
                unlocked = progress >= 7;
                break;
              case 'breathing_10':
                progress = state.breathingSessions.filter(s => s.completed).length;
                unlocked = progress >= 10;
                break;
              case 'journal_7':
                progress = state.journalEntries.length;
                unlocked = progress >= 7;
                break;
            }
            
            if (unlocked && !a.unlockedAt) {
              setTimeout(() => get().addXp(a.xpReward), 0);
              return { ...a, progress, unlockedAt: new Date().toISOString() };
            }
            
            return { ...a, progress };
          });
          
          return { achievements };
        });
      },

      // Utils
      getDailyStats: (date) => {
        const state = get();
        const habits = state.habits;
        const todayHabits = habits.filter(h => h.completedDates.includes(date));
        const todayTasks = state.tasks.filter(t => t.completedAt?.startsWith(date));
        const todayPomodoro = state.pomodoroSessions.filter(
          s => s.startTime.startsWith(date) && s.type === 'work' && s.completed
        );
        const todayWater = state.waterEntries.filter(e => e.date === date);
        const todaySleep = state.sleepEntries.find(s => s.date === date);
        const todayMood = state.moodEntries.filter(m => m.date === date);
        
        return {
          date,
          habitsCompleted: todayHabits.length,
          habitsTotal: habits.length,
          tasksCompleted: todayTasks.length,
          pomodoroMinutes: todayPomodoro.reduce((sum, s) => sum + s.duration, 0),
          waterMl: todayWater.reduce((sum, e) => sum + e.amount, 0),
          sleepMinutes: todaySleep?.duration || 0,
          sleepQuality: todaySleep?.quality || 0,
          mood: todayMood.length > 0 
            ? todayMood.reduce((sum, m) => sum + m.mood, 0) / todayMood.length 
            : 0,
          energy: todayMood.length > 0
            ? todayMood.reduce((sum, m) => sum + m.energy, 0) / todayMood.length
            : 0,
          xpEarned: 0,
        };
      },

      refreshQuote: () => {
        const todayStr = today();
        set((state) => {
          if (state.dailyQuote.date === todayStr) return state;
          return { dailyQuote: { ...getRandomQuote(), date: todayStr } };
        });
      },

      exportData: () => {
        const state = get();
        return JSON.stringify({
          profile: state.profile,
          habits: state.habits,
          tasks: state.tasks,
          financeSettings: state.financeSettings,
          categories: state.categories,
          expenses: state.expenses,
          savingsGoals: state.savingsGoals,
          pomodoroSessions: state.pomodoroSessions,
          waterEntries: state.waterEntries,
          sleepEntries: state.sleepEntries,
          moodEntries: state.moodEntries,
          journalEntries: state.journalEntries,
          breathingSessions: state.breathingSessions,
        }, null, 2);
      },

      importData: (data) => {
        try {
          const parsed = JSON.parse(data);
          set((state) => ({ ...state, ...parsed }));
        } catch (e) {
          console.error('Failed to import data:', e);
        }
      },

      resetAll: () => {
        set(initialState);
      },
    }),
    {
      name: 'lifeos-storage',
      version: 2,
    }
  )
);
