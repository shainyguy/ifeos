import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Page } from '@/types';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const {
    profile,
    habits,
    tasks,
    pomodoroSessions,
    waterEntries,
    waterGoal,
    sleepEntries,
    moodEntries,
    dailyQuote,
    claimDailyBonus,
  } = useStore();

  const today = new Date().toISOString().split('T')[0];

  // Calculations
  const todayHabits = habits.filter(h => h.completedDates.includes(today));
  const habitProgress = habits.length > 0 ? (todayHabits.length / habits.length) * 100 : 0;
  
  const todayTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completedAt?.startsWith(today));
  
  const todayPomodoro = pomodoroSessions.filter(
    s => s.startTime.startsWith(today) && s.type === 'work' && s.completed
  );
  const pomodoroMinutes = todayPomodoro.reduce((sum, s) => sum + s.duration, 0);
  
  const todayWater = waterEntries.filter(e => e.date === today);
  const waterTotal = todayWater.reduce((sum, e) => sum + e.amount, 0);
  const waterProgress = Math.min(100, (waterTotal / waterGoal) * 100);

  const todaySleep = sleepEntries.find(s => s.date === today);
  const todayMood = moodEntries.filter(m => m.date === today);
  const avgMood = todayMood.length > 0 
    ? todayMood.reduce((sum, m) => sum + m.mood, 0) / todayMood.length 
    : 0;

  const xpForLevel = (level: number) => level * 100 + (level - 1) * 50;
  const xpProgress = (profile.xp / xpForLevel(profile.level)) * 100;

  const canClaimBonus = profile.dailyBonusClaimed !== today;

  const moodEmojis = ['', '😢', '😕', '😐', '🙂', '😄'];
  const energyEmojis = ['', '🪫', '🔋', '⚡', '💪', '🚀'];

  const disciplineIndex = useMemo(() => {
    const habitScore = habitProgress;
    const taskScore = tasks.length > 0 
      ? (completedTasks.length / Math.max(1, tasks.filter(t => !t.completed || t.completedAt?.startsWith(today)).length)) * 100 
      : 100;
    const waterScore = waterProgress;
    const sleepScore = todaySleep ? (todaySleep.quality / 5) * 100 : 0;
    
    return Math.round((habitScore + taskScore + waterScore + sleepScore) / 4);
  }, [habitProgress, tasks, completedTasks, waterProgress, todaySleep, today]);

  return (
    <div className="min-h-screen pt-safe px-4 pb-4">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-500 text-sm">Привет,</p>
            <h1 className="text-2xl font-bold text-gray-800">{profile.name} 👋</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('profile')}
            className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white font-bold shadow-lg"
          >
            {profile.level}
          </motion.button>
        </div>

        {/* Daily Bonus */}
        {canClaimBonus && (
          <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={claimDailyBonus}
            className="w-full glass-card rounded-2xl p-4 border-2 border-indigo-200 shadow-glow mb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl animate-float">🎁</div>
                <div className="text-left">
                  <p className="font-semibold text-gray-800">Ежедневный бонус</p>
                  <p className="text-sm text-gray-500">+50 XP • Серия: {profile.streak} дней</p>
                </div>
              </div>
              <div className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl text-white font-medium text-sm">
                Забрать
              </div>
            </div>
          </motion.button>
        )}

        {/* Quote */}
        <div className="glass-card rounded-2xl p-4">
          <p className="text-gray-700 italic">"{dailyQuote.text}"</p>
          <p className="text-sm text-gray-500 mt-2">— {dailyQuote.author}</p>
        </div>
      </header>

      {/* XP Progress */}
      <section className="mb-6">
        <div className="glass-card rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚔️</span>
              <div>
                <p className="font-semibold text-gray-800">Уровень {profile.level}</p>
                <p className="text-xs text-gray-500">{profile.title}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold gradient-text">{profile.xp} / {xpForLevel(profile.level)} XP</p>
              <p className="text-xs text-gray-500">Всего: {profile.totalXp} XP</p>
            </div>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full gradient-primary rounded-full"
            />
          </div>
        </div>
      </section>

      {/* Discipline Index */}
      <section className="mb-6">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Индекс дисциплины</p>
              <p className="text-4xl font-bold gradient-text">{disciplineIndex}%</p>
            </div>
            <div className="relative w-24 h-24">
              <svg className="w-full h-full progress-ring" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={251.2}
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * disciplineIndex) / 100 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">
                  {disciplineIndex >= 80 ? '🔥' : disciplineIndex >= 50 ? '💪' : '📈'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="bento-grid mb-6">
        {/* Habits */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('habits')}
          className="glass-card glass-card-hover rounded-2xl p-4 text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">🎯</span>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-600">
              {todayHabits.length}/{habits.length}
            </span>
          </div>
          <p className="font-semibold text-gray-800 mb-1">Привычки</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full gradient-primary rounded-full transition-all"
              style={{ width: `${habitProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">{Math.round(habitProgress)}% выполнено</p>
        </motion.button>

        {/* Tasks */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('tasks')}
          className="glass-card glass-card-hover rounded-2xl p-4 text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">✅</span>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">
              +{completedTasks.length} сегодня
            </span>
          </div>
          <p className="font-semibold text-gray-800 mb-1">Задачи</p>
          <p className="text-2xl font-bold text-gray-800">{todayTasks.length}</p>
          <p className="text-xs text-gray-500">активных задач</p>
        </motion.button>

        {/* Pomodoro */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('focus')}
          className="glass-card glass-card-hover rounded-2xl p-4 text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">⏱️</span>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-600">
              {todayPomodoro.length} сессий
            </span>
          </div>
          <p className="font-semibold text-gray-800 mb-1">Фокус</p>
          <p className="text-2xl font-bold text-gray-800">{pomodoroMinutes}</p>
          <p className="text-xs text-gray-500">минут работы</p>
        </motion.button>

        {/* Water */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('wellness')}
          className="glass-card glass-card-hover rounded-2xl p-4 text-left"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">💧</span>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-cyan-100 text-cyan-600">
              {Math.round(waterProgress)}%
            </span>
          </div>
          <p className="font-semibold text-gray-800 mb-1">Вода</p>
          <p className="text-2xl font-bold text-gray-800">{waterTotal}</p>
          <p className="text-xs text-gray-500">из {waterGoal} мл</p>
        </motion.button>

        {/* Sleep - Full width */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('wellness')}
          className="glass-card glass-card-hover rounded-2xl p-4 text-left bento-item-full"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">😴</span>
                <p className="font-semibold text-gray-800">Сон</p>
              </div>
              {todaySleep ? (
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {Math.floor(todaySleep.duration / 60)}ч {todaySleep.duration % 60}м
                    </p>
                    <p className="text-xs text-gray-500">длительность</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {'⭐'.repeat(todaySleep.quality)}
                    </p>
                    <p className="text-xs text-gray-500">качество</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Добавьте запись о сне</p>
              )}
            </div>
            <div className="text-4xl opacity-20">🌙</div>
          </div>
        </motion.button>

        {/* Mood - Full width */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('wellness')}
          className="glass-card glass-card-hover rounded-2xl p-4 text-left bento-item-full"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🧠</span>
                <p className="font-semibold text-gray-800">Настроение и энергия</p>
              </div>
              {todayMood.length > 0 ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{moodEmojis[Math.round(avgMood)]}</span>
                    <span className="text-sm text-gray-500">настроение</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">
                      {energyEmojis[Math.round(todayMood[todayMood.length - 1].energy)]}
                    </span>
                    <span className="text-sm text-gray-500">энергия</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Как вы себя чувствуете?</p>
              )}
            </div>
            <div className="text-4xl opacity-20">✨</div>
          </div>
        </motion.button>
      </section>

      {/* Quick Actions */}
      <section className="mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Быстрые действия</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('focus')}
            className="flex-shrink-0 px-5 py-3 rounded-2xl gradient-primary text-white font-medium shadow-lg"
          >
            ▶️ Начать фокус
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('wellness')}
            className="flex-shrink-0 px-5 py-3 rounded-2xl gradient-cyan text-white font-medium shadow-lg"
          >
            💧 +250 мл воды
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('tasks')}
            className="flex-shrink-0 px-5 py-3 rounded-2xl gradient-success text-white font-medium shadow-lg"
          >
            ➕ Новая задача
          </motion.button>
        </div>
      </section>

      {/* Finance Preview */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigate('finance')}
        className="glass-card glass-card-hover rounded-2xl p-4 text-left w-full mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💰</span>
            <div>
              <p className="font-semibold text-gray-800">Финансы</p>
              <p className="text-sm text-gray-500">Управление бюджетом</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            →
          </div>
        </div>
      </motion.button>

      {/* Stats Preview */}
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigate('stats')}
        className="glass-card glass-card-hover rounded-2xl p-4 text-left w-full"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <p className="font-semibold text-gray-800">Аналитика</p>
              <p className="text-sm text-gray-500">Статистика и графики</p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            →
          </div>
        </div>
      </motion.button>
    </div>
  );
}
