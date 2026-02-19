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
  
  const activeTasks = tasks.filter(t => !t.completed);
  const completedToday = tasks.filter(t => t.completedAt?.startsWith(today));
  
  const todayPomodoro = pomodoroSessions.filter(
    s => s.startTime.startsWith(today) && s.type === 'work' && s.completed
  );
  const pomodoroMinutes = todayPomodoro.reduce((sum, s) => sum + s.duration, 0);
  
  const todayWater = waterEntries.filter(e => e.date === today);
  const waterTotal = todayWater.reduce((sum, e) => sum + e.amount, 0);
  const waterProgress = Math.min(100, (waterTotal / waterGoal) * 100);

  const todaySleep = sleepEntries.find(s => s.date === today);
  const todayMood = moodEntries.filter(m => m.date === today);
  const lastMood = todayMood[todayMood.length - 1];

  const xpForLevel = (level: number) => level * 100 + (level - 1) * 50;
  const xpProgress = (profile.xp / xpForLevel(profile.level)) * 100;

  const canClaimBonus = profile.dailyBonusClaimed !== today;

  const moodEmojis = ['', '😢', '😕', '😐', '🙂', '😄'];
  const energyEmojis = ['', '🪫', '🔋', '⚡', '💪', '🚀'];

  const disciplineIndex = useMemo(() => {
    const scores = [];
    if (habits.length > 0) scores.push(habitProgress);
    if (activeTasks.length > 0 || completedToday.length > 0) {
      scores.push(Math.min(100, completedToday.length * 25));
    }
    scores.push(waterProgress);
    if (todaySleep) scores.push(todaySleep.quality * 20);
    
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }, [habitProgress, activeTasks.length, completedToday.length, waterProgress, todaySleep]);

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs">Привет,</p>
            <h1 className="text-xl font-bold text-gray-800">{profile.name} 👋</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('profile')}
            className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-lg"
          >
            Lv.{profile.level}
          </motion.button>
        </div>
      </header>

      {/* Content */}
      <div className="page-content">
        {/* Daily Bonus */}
        {canClaimBonus && (
          <motion.button
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={claimDailyBonus}
            className="w-full glass-card rounded-2xl p-4 border-2 border-indigo-200 mb-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-float">🎁</span>
                <div className="text-left">
                  <p className="font-semibold text-gray-800 text-sm">Ежедневный бонус</p>
                  <p className="text-xs text-gray-500">+50 XP • Серия: {profile.streak} дней</p>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white font-medium text-xs">
                Забрать
              </div>
            </div>
          </motion.button>
        )}

        {/* Quote */}
        <div className="glass-card rounded-2xl p-4 mb-4">
          <p className="text-gray-700 text-sm italic leading-relaxed">"{dailyQuote.text}"</p>
          <p className="text-xs text-gray-400 mt-2">— {dailyQuote.author}</p>
        </div>

        {/* XP & Discipline */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* XP Progress */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⚔️</span>
              <span className="text-xs text-gray-500">{profile.title}</span>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-lg font-bold gradient-text">{profile.xp}</span>
              <span className="text-xs text-gray-400">/ {xpForLevel(profile.level)}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                className="h-full gradient-primary rounded-full"
              />
            </div>
          </div>

          {/* Discipline Index */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{disciplineIndex >= 80 ? '🔥' : disciplineIndex >= 50 ? '💪' : '📈'}</span>
              <span className="text-xs text-gray-500">Дисциплина</span>
            </div>
            <p className="text-2xl font-bold gradient-text">{disciplineIndex}%</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="bento-grid mb-4">
          {/* Habits */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('habits')}
            className="glass-card rounded-2xl p-4 text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">🎯</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
                {todayHabits.length}/{habits.length}
              </span>
            </div>
            <p className="font-semibold text-gray-800 text-sm mb-1">Привычки</p>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full gradient-primary rounded-full"
                style={{ width: `${habitProgress}%` }}
              />
            </div>
          </motion.button>

          {/* Tasks */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('tasks')}
            className="glass-card rounded-2xl p-4 text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">✅</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600">
                +{completedToday.length}
              </span>
            </div>
            <p className="font-semibold text-gray-800 text-sm">Задачи</p>
            <p className="text-lg font-bold text-gray-800">{activeTasks.length}</p>
          </motion.button>

          {/* Pomodoro */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('focus')}
            className="glass-card rounded-2xl p-4 text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">⏱️</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                {todayPomodoro.length}
              </span>
            </div>
            <p className="font-semibold text-gray-800 text-sm">Фокус</p>
            <p className="text-lg font-bold text-gray-800">{pomodoroMinutes} мин</p>
          </motion.button>

          {/* Water */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('wellness')}
            className="glass-card rounded-2xl p-4 text-left"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">💧</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-600">
                {Math.round(waterProgress)}%
              </span>
            </div>
            <p className="font-semibold text-gray-800 text-sm">Вода</p>
            <p className="text-lg font-bold text-gray-800">{waterTotal} мл</p>
          </motion.button>
        </div>

        {/* Sleep & Mood */}
        <div className="glass-card rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('wellness')}
              className="flex-1 text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">😴</span>
                <div>
                  <p className="text-xs text-gray-500">Сон</p>
                  {todaySleep ? (
                    <p className="font-semibold text-gray-800">
                      {Math.floor(todaySleep.duration / 60)}ч {todaySleep.duration % 60}м
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">Не записан</p>
                  )}
                </div>
              </div>
            </motion.button>
            
            <div className="w-px h-10 bg-gray-200" />
            
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => onNavigate('wellness')}
              className="flex-1 text-right"
            >
              <div className="flex items-center justify-end gap-3">
                <div>
                  <p className="text-xs text-gray-500">Настроение</p>
                  {lastMood ? (
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-lg">{moodEmojis[lastMood.mood]}</span>
                      <span className="text-lg">{energyEmojis[lastMood.energy]}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Не записано</p>
                  )}
                </div>
                <span className="text-2xl">🧠</span>
              </div>
            </motion.button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('focus')}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg"
          >
            ▶️ Фокус
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('wellness')}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl gradient-cyan text-white text-sm font-medium shadow-lg"
          >
            💧 +250мл
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('finance')}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl gradient-success text-white text-sm font-medium shadow-lg"
          >
            💰 Финансы
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('stats')}
            className="flex-shrink-0 px-4 py-2.5 rounded-xl gradient-warning text-white text-sm font-medium shadow-lg"
          >
            📊 Статистика
          </motion.button>
        </div>
      </div>
    </div>
  );
}
