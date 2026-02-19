import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import {
  AreaChart, Area, XAxis, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

export default function Stats() {
  const {
    profile,
    habits,
    tasks,
    pomodoroSessions,
    waterEntries,
    waterGoal,
    sleepEntries,
    moodEntries,
    savingsGoals,
    financeSettings,
  } = useStore();

  const today = new Date().toISOString().split('T')[0];

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
  }, []);

  const habitsData = useMemo(() => {
    return last7Days.map((date) => {
      const completed = habits.filter((h) => h.completedDates.includes(date)).length;
      const total = habits.length;
      return {
        date: new Date(date).toLocaleDateString('ru', { weekday: 'short' }),
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [last7Days, habits]);

  const pomodoroData = useMemo(() => {
    return last7Days.map((date) => {
      const sessions = pomodoroSessions.filter(
        (s) => s.startTime.startsWith(date) && s.type === 'work' && s.completed
      );
      return {
        date: new Date(date).toLocaleDateString('ru', { weekday: 'short' }),
        minutes: sessions.reduce((sum, s) => sum + s.duration, 0),
      };
    });
  }, [last7Days, pomodoroSessions]);

  const waterData = useMemo(() => {
    return last7Days.map((date) => {
      const entries = waterEntries.filter((e) => e.date === date);
      return {
        date: new Date(date).toLocaleDateString('ru', { weekday: 'short' }),
        amount: entries.reduce((sum, e) => sum + e.amount, 0),
      };
    });
  }, [last7Days, waterEntries]);

  const heatmapData = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (27 - i));
      const dateStr = date.toISOString().split('T')[0];
      
      const habitsCompleted = habits.filter((h) => h.completedDates.includes(dateStr)).length;
      const habitScore = habits.length > 0 ? habitsCompleted / habits.length : 0;
      
      const tasksCompleted = tasks.filter((t) => t.completedAt?.startsWith(dateStr)).length;
      
      const waterAmount = waterEntries
        .filter((e) => e.date === dateStr)
        .reduce((sum, e) => sum + e.amount, 0);
      const waterScore = waterAmount >= waterGoal ? 1 : waterAmount / waterGoal;
      
      const score = (habitScore * 0.4 + Math.min(1, tasksCompleted / 5) * 0.3 + waterScore * 0.3) * 100;
      
      return {
        date: dateStr,
        score: Math.round(score),
        day: date.getDate(),
      };
    });
  }, [habits, tasks, waterEntries, waterGoal]);

  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const financeData = [
    { name: 'Инв', value: financeSettings.investmentPercent, color: '#6366f1' },
    { name: 'Нак', value: financeSettings.savingsPercent, color: '#10b981' },
    { name: 'Рас', value: financeSettings.expensesPercent, color: '#f59e0b' },
    { name: 'Под', value: financeSettings.emergencyPercent, color: '#ef4444' },
  ];

  const disciplineIndex = useMemo(() => {
    const todayHabits = habits.filter((h) => h.completedDates.includes(today));
    const habitScore = habits.length > 0 ? (todayHabits.length / habits.length) * 100 : 100;
    
    const todayTasks = tasks.filter((t) => t.completedAt?.startsWith(today)).length;
    const taskScore = Math.min(100, todayTasks * 20);
    
    const todayWater = waterEntries.filter((e) => e.date === today);
    const waterTotal = todayWater.reduce((sum, e) => sum + e.amount, 0);
    const waterScore = Math.min(100, (waterTotal / waterGoal) * 100);
    
    const todaySleep = sleepEntries.find((s) => s.date === today);
    const sleepScore = todaySleep ? todaySleep.quality * 20 : 0;
    
    return Math.round((habitScore + taskScore + waterScore + sleepScore) / 4);
  }, [habits, tasks, waterEntries, waterGoal, sleepEntries, today]);

  const getHeatmapColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#22d3ee';
    if (score >= 40) return '#fbbf24';
    if (score >= 20) return '#f97316';
    if (score > 0) return '#ef4444';
    return '#e5e7eb';
  };

  const avgMood = moodEntries.length > 0
    ? moodEntries.reduce((sum, m) => sum + m.mood, 0) / moodEntries.length
    : 0;

  const totalFocusMinutes = pomodoroSessions
    .filter(s => s.type === 'work' && s.completed)
    .reduce((sum, s) => sum + s.duration, 0);

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <h1 className="text-xl font-bold text-gray-800">Аналитика 📊</h1>
        <p className="text-xs text-gray-500">Уровень {profile.level} • {profile.totalXp} XP</p>
      </header>

      {/* Content */}
      <div className="page-content">
        {/* Discipline Index */}
        <div className="glass-card rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-1">Индекс дисциплины</p>
              <p className="text-4xl font-bold gradient-text">{disciplineIndex}%</p>
            </div>
            <div className="relative w-20 h-20">
              <svg className="w-full h-full progress-ring" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                <motion.circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="url(#statsGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={251.2}
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * disciplineIndex) / 100 }}
                />
                <defs>
                  <linearGradient id="statsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xl">
                {disciplineIndex >= 80 ? '🔥' : disciplineIndex >= 50 ? '💪' : '📈'}
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="glass-card rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 mb-2">Карта дисциплины (28 дней)</p>
          <div className="grid grid-cols-7 gap-1">
            {heatmapData.map((day, i) => (
              <motion.div
                key={day.date}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.01 }}
                className="aspect-square rounded flex items-center justify-center text-[10px] text-white font-medium"
                style={{ backgroundColor: getHeatmapColor(day.score) }}
              >
                {day.day}
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <span className="text-[10px] text-gray-400">Меньше</span>
            {[0, 20, 40, 60, 80].map((score) => (
              <div
                key={score}
                className="w-3 h-3 rounded"
                style={{ backgroundColor: getHeatmapColor(score + 10) }}
              />
            ))}
            <span className="text-[10px] text-gray-400">Больше</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Habits */}
          <div className="glass-card rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Привычки %</p>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={habitsData}>
                  <defs>
                    <linearGradient id="habitFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" hide />
                  <Area type="monotone" dataKey="percent" stroke="#6366f1" fill="url(#habitFill)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pomodoro */}
          <div className="glass-card rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Фокус (мин)</p>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pomodoroData}>
                  <XAxis dataKey="date" hide />
                  <Bar dataKey="minutes" fill="#f97316" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Water */}
          <div className="glass-card rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Вода (мл)</p>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterData}>
                  <XAxis dataKey="date" hide />
                  <Bar dataKey="amount" fill="#06b6d4" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Finance */}
          <div className="glass-card rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Финансы</p>
            <div className="flex items-center gap-2">
              <div className="w-14 h-14">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={15}
                      outerRadius={26}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {financeData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-sm font-bold gradient-text">{totalSaved.toLocaleString()}₽</p>
                <p className="text-[10px] text-gray-500">накоплено</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="glass-card rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 mb-2">Общая статистика</p>
          <div className="grid grid-cols-4 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold gradient-text">{habits.reduce((sum, h) => sum + h.streak, 0)}</p>
              <p className="text-[10px] text-gray-500">серия</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold gradient-text">{tasks.filter(t => t.completed).length}</p>
              <p className="text-[10px] text-gray-500">задач</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold gradient-text">{totalFocusMinutes}</p>
              <p className="text-[10px] text-gray-500">мин фокус</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold gradient-text">{avgMood.toFixed(1)}</p>
              <p className="text-[10px] text-gray-500">настрой</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-card rounded-xl p-3">
          <p className="text-xs text-gray-500 mb-2">RPG прогресс</p>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center text-white text-xl font-bold">
              {profile.level}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{profile.title}</p>
              <p className="text-xs text-gray-500">{profile.totalXp} XP всего</p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full gradient-primary rounded-full"
                  style={{ width: `${(profile.xp / (profile.level * 100 + (profile.level - 1) * 50)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
