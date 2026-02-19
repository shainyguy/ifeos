import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart
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

  // Generate last 7 days
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });
  }, []);

  // Habits data
  const habitsData = useMemo(() => {
    return last7Days.map((date) => {
      const completed = habits.filter((h) => h.completedDates.includes(date)).length;
      const total = habits.length;
      return {
        date: new Date(date).toLocaleDateString('ru', { weekday: 'short' }),
        completed,
        total,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }, [last7Days, habits]);

  // Pomodoro data
  const pomodoroData = useMemo(() => {
    return last7Days.map((date) => {
      const sessions = pomodoroSessions.filter(
        (s) => s.startTime.startsWith(date) && s.type === 'work' && s.completed
      );
      return {
        date: new Date(date).toLocaleDateString('ru', { weekday: 'short' }),
        minutes: sessions.reduce((sum, s) => sum + s.duration, 0),
        sessions: sessions.length,
      };
    });
  }, [last7Days, pomodoroSessions]);

  // Water data
  const waterData = useMemo(() => {
    return last7Days.map((date) => {
      const entries = waterEntries.filter((e) => e.date === date);
      return {
        date: new Date(date).toLocaleDateString('ru', { weekday: 'short' }),
        amount: entries.reduce((sum, e) => sum + e.amount, 0),
        goal: waterGoal,
      };
    });
  }, [last7Days, waterEntries, waterGoal]);

  // Sleep data
  const sleepData = useMemo(() => {
    return last7Days.map((date) => {
      const entry = sleepEntries.find((s) => s.date === date);
      return {
        date: new Date(date).toLocaleDateString('ru', { weekday: 'short' }),
        hours: entry ? Math.round((entry.duration / 60) * 10) / 10 : 0,
        quality: entry ? entry.quality : 0,
      };
    });
  }, [last7Days, sleepEntries]);

  // Mood data
  const moodData = useMemo(() => {
    return last7Days.map((date) => {
      const entries = moodEntries.filter((m) => m.date === date);
      const avgMood = entries.length > 0
        ? entries.reduce((sum, m) => sum + m.mood, 0) / entries.length
        : 0;
      const avgEnergy = entries.length > 0
        ? entries.reduce((sum, m) => sum + m.energy, 0) / entries.length
        : 0;
      return {
        date: new Date(date).toLocaleDateString('ru', { weekday: 'short' }),
        mood: Math.round(avgMood * 10) / 10,
        energy: Math.round(avgEnergy * 10) / 10,
      };
    });
  }, [last7Days, moodEntries]);

  // Discipline heatmap (last 28 days)
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

  // Finance data
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const financeData = [
    { name: 'Инвестиции', value: financeSettings.investmentPercent, color: '#6366f1' },
    { name: 'Накопления', value: financeSettings.savingsPercent, color: '#10b981' },
    { name: 'Расходы', value: financeSettings.expensesPercent, color: '#f59e0b' },
    { name: 'Подушка', value: financeSettings.emergencyPercent, color: '#ef4444' },
  ];

  // Overall discipline index
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

  return (
    <div className="min-h-screen pt-safe px-4 pb-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Аналитика 📊</h1>
        <p className="text-gray-500 text-sm">Статистика и прогресс</p>
      </header>

      {/* Discipline Index */}
      <div className="glass-card rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm mb-1">Индекс дисциплины</p>
            <p className="text-5xl font-bold gradient-text">{disciplineIndex}%</p>
            <p className="text-sm text-gray-500 mt-1">Уровень {profile.level} • {profile.totalXp} XP</p>
          </div>
          <div className="relative w-24 h-24">
            <svg className="w-full h-full progress-ring" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="40"
                fill="none"
                stroke="url(#statsGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={251.2}
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * disciplineIndex) / 100 }}
              />
              <defs>
                <linearGradient id="statsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
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

      {/* Heatmap */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <p className="font-semibold text-gray-800 mb-3">Карта дисциплины (28 дней)</p>
        <div className="grid grid-cols-7 gap-1">
          {heatmapData.map((day, i) => (
            <motion.div
              key={day.date}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className="aspect-square rounded-md flex items-center justify-center text-xs text-white font-medium"
              style={{ backgroundColor: getHeatmapColor(day.score) }}
              title={`${day.date}: ${day.score}%`}
            >
              {day.day}
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-xs text-gray-500">Меньше</span>
          {[0, 20, 40, 60, 80].map((score) => (
            <div
              key={score}
              className="w-4 h-4 rounded"
              style={{ backgroundColor: getHeatmapColor(score + 10) }}
            />
          ))}
          <span className="text-xs text-gray-500">Больше</span>
        </div>
      </div>

      {/* Habits Chart */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <p className="font-semibold text-gray-800 mb-3">Привычки</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={habitsData}>
              <defs>
                <linearGradient id="habitGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="percent" stroke="#6366f1" fill="url(#habitGradient)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pomodoro Chart */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <p className="font-semibold text-gray-800 mb-3">Фокус (минуты)</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pomodoroData}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="minutes" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Water Chart */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <p className="font-semibold text-gray-800 mb-3">Вода (мл)</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={waterData}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="amount" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sleep Chart */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <p className="font-semibold text-gray-800 mb-3">Сон (часы)</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sleepData}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis hide domain={[0, 12]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mood Chart */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <p className="font-semibold text-gray-800 mb-3">Настроение и энергия</p>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={moodData}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
              <YAxis hide domain={[0, 5]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
              />
              <Line type="monotone" dataKey="mood" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 0 }} name="Настроение" />
              <Line type="monotone" dataKey="energy" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', strokeWidth: 0 }} name="Энергия" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Finance Overview */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <p className="font-semibold text-gray-800 mb-3">Финансы</p>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
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
          <div className="flex-1">
            <p className="text-2xl font-bold gradient-text">{totalSaved.toLocaleString()}₽</p>
            <p className="text-sm text-gray-500">накоплено</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {financeData.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-500">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">{habits.reduce((sum, h) => sum + h.streak, 0)}</p>
          <p className="text-xs text-gray-500">общая серия</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">{tasks.filter(t => t.completed).length}</p>
          <p className="text-xs text-gray-500">задач выполнено</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">
            {pomodoroSessions.filter(s => s.type === 'work' && s.completed).reduce((sum, s) => sum + s.duration, 0)}
          </p>
          <p className="text-xs text-gray-500">минут фокуса</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">{profile.achievements.length}</p>
          <p className="text-xs text-gray-500">достижений</p>
        </div>
      </div>
    </div>
  );
}
