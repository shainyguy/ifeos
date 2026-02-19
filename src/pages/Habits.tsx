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
    moneySavedPerDay: 0,
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
      moneySavedPerDay: newHabit.moneySavedPerDay,
      healthBenefit: newHabit.healthBenefit,
      quitDate: newHabit.type === 'quit' ? today : undefined,
    });
    setNewHabit({
      name: '',
      emoji: '💪',
      type: 'daily',
      color: '#6366f1',
      moneySavedPerDay: 0,
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

  return (
    <div className="min-h-screen pt-safe px-4 pb-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Привычки 🎯</h1>
        <p className="text-gray-500 text-sm">Создавай или меняй свою жизнь</p>
      </header>

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        {[
          { id: 'all', label: 'Все', icon: '📋' },
          { id: 'daily', label: 'Развитие', icon: '🚀' },
          { id: 'quit', label: 'Бросить', icon: '🚫' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
              filter === f.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'glass-card text-gray-600'
            }`}
          >
            <span>{f.icon}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">{habits.length}</p>
          <p className="text-xs text-gray-500">привычек</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">
            {Math.max(...habits.map(h => h.streak), 0)}
          </p>
          <p className="text-xs text-gray-500">макс. серия</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">
            {habits.filter(h => h.completedDates.includes(today)).length}
          </p>
          <p className="text-xs text-gray-500">сегодня</p>
        </div>
      </div>

      {/* Build Habits */}
      {(filter === 'all' || filter === 'daily') && buildHabits.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Привычки для развития</h2>
          <div className="space-y-3">
            {buildHabits.map((habit) => {
              const completedToday = habit.completedDates.includes(today);
              return (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${habit.color}20` }}
                      >
                        {habit.emoji}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{habit.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-orange-500">🔥 {habit.streak}</span>
                          <span className="text-xs text-gray-400">Лучшая: {habit.bestStreak}</span>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleHabit(habit.id, today)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                        completedToday
                          ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {completedToday ? '✓' : '○'}
                    </motion.button>
                  </div>

                  {/* Week Calendar */}
                  <div className="flex justify-between">
                    {days.map((date) => {
                      const dayOfWeek = new Date(date).getDay();
                      const completed = habit.completedDates.includes(date);
                      const isToday = date === today;
                      return (
                        <button
                          key={date}
                          onClick={() => toggleHabit(habit.id, date)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                            isToday ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <span className="text-xs text-gray-400">{dayNames[dayOfWeek]}</span>
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                              completed
                                ? 'text-white shadow-md'
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

                  {/* Delete button */}
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="mt-3 text-xs text-red-400 hover:text-red-600"
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
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Привычки, которые бросаю 🚫</h2>
          <div className="space-y-3">
            {quitHabits.map((habit) => {
              const quitDays = calculateQuitDays(habit);
              const moneySaved = quitDays * (habit.moneySavedPerDay || 0);
              return (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-4 border-2 border-red-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-2xl">
                        {habit.emoji}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{habit.name}</p>
                        <p className="text-xs text-gray-500">{habit.healthBenefit}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3">
                      <p className="text-3xl font-bold text-emerald-600">{quitDays}</p>
                      <p className="text-xs text-emerald-600">дней без этого</p>
                    </div>
                    {habit.moneySavedPerDay && habit.moneySavedPerDay > 0 && (
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-3">
                        <p className="text-3xl font-bold text-amber-600">{moneySaved.toLocaleString()}₽</p>
                        <p className="text-xs text-amber-600">сэкономлено</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="mt-3 text-xs text-red-400 hover:text-red-600"
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
          <p className="text-4xl mb-4">🎯</p>
          <p className="text-gray-500">Пока нет привычек</p>
          <p className="text-sm text-gray-400">Добавьте первую привычку!</p>
        </div>
      )}

      {/* Add Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAdd(true)}
        className="fixed bottom-28 right-4 w-14 h-14 rounded-2xl gradient-primary text-white shadow-lg flex items-center justify-center text-2xl"
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
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-3xl p-6 safe-area-bottom"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
              <h2 className="text-xl font-bold text-gray-800 mb-6">Новая привычка</h2>

              {/* Type Selection */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setNewHabit({ ...newHabit, type: 'daily' })}
                  className={`flex-1 py-3 rounded-xl font-medium ${
                    newHabit.type === 'daily'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  🚀 Развитие
                </button>
                <button
                  onClick={() => setNewHabit({ ...newHabit, type: 'quit' })}
                  className={`flex-1 py-3 rounded-xl font-medium ${
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
                placeholder="Название привычки"
                value={newHabit.name}
                onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                className="w-full p-4 rounded-xl bg-gray-100 text-gray-800 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
              />

              {/* Emoji Selection */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Иконка</p>
                <div className="flex flex-wrap gap-2">
                  {habitEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewHabit({ ...newHabit, emoji })}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                        newHabit.emoji === emoji ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Цвет</p>
                <div className="flex gap-2">
                  {habitColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewHabit({ ...newHabit, color })}
                      className={`w-8 h-8 rounded-full ${
                        newHabit.color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Quit-specific fields */}
              {newHabit.type === 'quit' && (
                <>
                  <input
                    type="number"
                    placeholder="Экономия в день (₽)"
                    value={newHabit.moneySavedPerDay || ''}
                    onChange={(e) => setNewHabit({ ...newHabit, moneySavedPerDay: Number(e.target.value) })}
                    className="w-full p-4 rounded-xl bg-gray-100 text-gray-800 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Польза для здоровья"
                    value={newHabit.healthBenefit}
                    onChange={(e) => setNewHabit({ ...newHabit, healthBenefit: e.target.value })}
                    className="w-full p-4 rounded-xl bg-gray-100 text-gray-800 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </>
              )}

              <button
                onClick={handleAddHabit}
                className="w-full py-4 rounded-xl gradient-primary text-white font-semibold"
              >
                Добавить привычку
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
