import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Habit } from '@/types';

const habitEmojis = ['💪', '📚', '🏃', '🧘', '💊', '🍎', '💤', '🚰', '✍️', '🎵', '🧹', '💰'];
const habitColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export default function Habits() {
  const { habits, addHabit, toggleHabit, deleteHabit } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'daily' | 'quit'>('all');
  const [newHabit, setNewHabit] = useState({
    name: '',
    emoji: '💪',
    type: 'daily' as Habit['type'],
    color: '#6366f1',
    moneySavedPerDay: '',
    healthBenefit: '',
  });

  const today = new Date().toISOString().split('T')[0];
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  const filteredHabits = habits.filter(h => {
    if (filter === 'all') return true;
    if (filter === 'daily') return h.type !== 'quit';
    if (filter === 'quit') return h.type === 'quit';
    return true;
  });

  const buildHabits = filteredHabits.filter(h => h.type !== 'quit');
  const quitHabits = filteredHabits.filter(h => h.type === 'quit');

  const handleAddHabit = () => {
    if (!newHabit.name.trim()) return;
    addHabit({
      name: newHabit.name,
      emoji: newHabit.emoji,
      type: newHabit.type,
      color: newHabit.color,
      moneySavedPerDay: parseFloat(newHabit.moneySavedPerDay) || 0,
      healthBenefit: newHabit.healthBenefit,
      quitDate: newHabit.type === 'quit' ? today : undefined,
    });
    setNewHabit({
      name: '',
      emoji: '💪',
      type: 'daily',
      color: '#6366f1',
      moneySavedPerDay: '',
      healthBenefit: '',
    });
    setShowAdd(false);
  };

  const calculateQuitDays = (habit: Habit) => {
    if (!habit.quitDate) return 0;
    const start = new Date(habit.quitDate);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const todayCompleted = habits.filter(h => h.completedDates.includes(today)).length;

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Привычки 🎯</h1>
            <p className="text-xs text-gray-500">Сегодня: {todayCompleted}/{habits.length}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="page-content">
        {/* Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-5 px-5">
          {[
            { id: 'all', label: 'Все', icon: '📋' },
            { id: 'daily', label: 'Развитие', icon: '🚀' },
            { id: 'quit', label: 'Бросить', icon: '🚫' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as typeof filter)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                filter === f.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'glass-card text-gray-600'
              }`}
            >
              <span>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="stats-grid mb-4">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xl font-bold gradient-text">{habits.length}</p>
            <p className="text-[10px] text-gray-500">привычек</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xl font-bold gradient-text">
              {Math.max(...habits.map(h => h.streak), 0)}
            </p>
            <p className="text-[10px] text-gray-500">макс. серия</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xl font-bold gradient-text">{todayCompleted}</p>
            <p className="text-[10px] text-gray-500">сегодня</p>
          </div>
        </div>

        {/* Build Habits */}
        {(filter === 'all' || filter === 'daily') && buildHabits.length > 0 && (
          <section className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Для развития</h2>
            <div className="list-spacing">
              {buildHabits.map((habit) => {
                const completedToday = habit.completedDates.includes(today);
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    className="glass-card rounded-xl p-3"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${habit.color}20` }}
                        >
                          {habit.emoji}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{habit.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-orange-500">🔥 {habit.streak}</span>
                            <span className="text-[10px] text-gray-400">Лучшая: {habit.bestStreak}</span>
                          </div>
                        </div>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => toggleHabit(habit.id, today)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all ${
                          completedToday
                            ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {completedToday ? '✓' : '○'}
                      </motion.button>
                    </div>

                    {/* Week Calendar */}
                    <div className="flex justify-between gap-1">
                      {days.map((date) => {
                        const dayOfWeek = new Date(date).getDay();
                        const completed = habit.completedDates.includes(date);
                        const isToday = date === today;
                        return (
                          <button
                            key={date}
                            onClick={() => toggleHabit(habit.id, date)}
                            className={`flex flex-col items-center gap-0.5 p-1 rounded-lg flex-1 ${
                              isToday ? 'bg-indigo-50' : ''
                            }`}
                          >
                            <span className="text-[9px] text-gray-400">{dayNames[dayOfWeek]}</span>
                            <div
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] transition-all ${
                                completed
                                  ? 'text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                              style={{
                                backgroundColor: completed ? habit.color : undefined,
                              }}
                            >
                              {completed ? '✓' : date.slice(-2)}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="mt-2 text-[10px] text-red-400"
                    >
                      Удалить
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Quit Habits */}
        {(filter === 'all' || filter === 'quit') && quitHabits.length > 0 && (
          <section className="mb-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Бросаю 🚫</h2>
            <div className="list-spacing">
              {quitHabits.map((habit) => {
                const quitDays = calculateQuitDays(habit);
                const moneySaved = quitDays * (habit.moneySavedPerDay || 0);
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    className="glass-card rounded-xl p-3 border border-red-100"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-lg">
                        {habit.emoji}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{habit.name}</p>
                        <p className="text-[10px] text-gray-500">{habit.healthBenefit}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-emerald-50 rounded-lg p-2 text-center">
                        <p className="text-xl font-bold text-emerald-600">{quitDays}</p>
                        <p className="text-[10px] text-emerald-600">дней без</p>
                      </div>
                      {habit.moneySavedPerDay && habit.moneySavedPerDay > 0 && (
                        <div className="bg-amber-50 rounded-lg p-2 text-center">
                          <p className="text-xl font-bold text-amber-600">{moneySaved.toLocaleString()}₽</p>
                          <p className="text-[10px] text-amber-600">сэкономлено</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="mt-2 text-[10px] text-red-400"
                    >
                      Удалить
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </section>
        )}

        {/* Empty State */}
        {filteredHabits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🎯</p>
            <p className="text-gray-500 text-sm">Пока нет привычек</p>
            <p className="text-xs text-gray-400">Нажмите + чтобы добавить</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAdd(true)}
        className="fab w-14 h-14 rounded-2xl gradient-primary text-white shadow-lg flex items-center justify-center text-2xl"
      >
        +
      </motion.button>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-content"
            >
              <div className="modal-handle" />
              <h2 className="text-lg font-bold text-gray-800 mb-4">Новая привычка</h2>

              {/* Type */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setNewHabit({ ...newHabit, type: 'daily' })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${
                    newHabit.type === 'daily'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🚀 Развитие
                </button>
                <button
                  onClick={() => setNewHabit({ ...newHabit, type: 'quit' })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${
                    newHabit.type === 'quit'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🚫 Бросить
                </button>
              </div>

              {/* Name */}
              <input
                type="text"
                placeholder="Название"
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-gray-100 text-gray-800 mb-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />

              {/* Emoji */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Иконка</p>
                <div className="flex flex-wrap gap-1.5">
                  {habitEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewHabit({ ...newHabit, emoji })}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
                        newHabit.emoji === emoji ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Цвет</p>
                <div className="flex gap-2">
                  {habitColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewHabit({ ...newHabit, color })}
                      className={`w-7 h-7 rounded-full ${
                        newHabit.color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Quit fields */}
              {newHabit.type === 'quit' && (
                <>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Экономия в день (₽)"
                    value={newHabit.moneySavedPerDay}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d]/g, '');
                      setNewHabit({ ...newHabit, moneySavedPerDay: val });
                    }}
                    className="w-full p-3 rounded-xl bg-gray-100 text-gray-800 mb-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Польза для здоровья"
                    value={newHabit.healthBenefit}
                    onChange={(e) => setNewHabit({ ...newHabit, healthBenefit: e.target.value })}
                    className="w-full p-3 rounded-xl bg-gray-100 text-gray-800 mb-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </>
              )}

              <button
                onClick={handleAddHabit}
                disabled={!newHabit.name.trim()}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm disabled:opacity-50"
              >
                Добавить
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
