import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

const moodEmojis = [
  { value: 1, emoji: '😢', label: 'Ужасно', color: '#ef4444' },
  { value: 2, emoji: '😕', label: 'Плохо', color: '#f97316' },
  { value: 3, emoji: '😐', label: 'Нормально', color: '#fbbf24' },
  { value: 4, emoji: '🙂', label: 'Хорошо', color: '#22d3ee' },
  { value: 5, emoji: '😄', label: 'Отлично', color: '#10b981' },
];

const energyEmojis = [
  { value: 1, emoji: '🪫', label: 'Пусто' },
  { value: 2, emoji: '🔋', label: 'Мало' },
  { value: 3, emoji: '⚡', label: 'Норма' },
  { value: 4, emoji: '💪', label: 'Много' },
  { value: 5, emoji: '🚀', label: 'Максимум' },
];

const breathingTechniques = [
  { id: 'box', name: 'Коробка', desc: '4-4-4-4', inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  { id: '478', name: '4-7-8', desc: 'Расслабление', inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  { id: 'calm', name: 'Спокойствие', desc: '5-5', inhale: 5, hold1: 0, exhale: 5, hold2: 0 },
  { id: 'energize', name: 'Энергия', desc: '3-3', inhale: 3, hold1: 0, exhale: 3, hold2: 0 },
];

const sleepFactors = [
  { id: 'caffeine', label: 'Кофеин', emoji: '☕' },
  { id: 'exercise', label: 'Спорт', emoji: '🏃' },
  { id: 'screen', label: 'Экран', emoji: '📱' },
  { id: 'stress', label: 'Стресс', emoji: '😰' },
  { id: 'alcohol', label: 'Алкоголь', emoji: '🍺' },
];

export default function Wellness() {
  const {
    waterEntries,
    waterGoal,
    addWaterEntry,
    setWaterGoal,
    sleepEntries,
    addSleepEntry,
    sleepGoal,
    moodEntries,
    addMoodEntry,
    breathingSessions,
    addBreathingSession,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'water' | 'sleep' | 'mood' | 'breathing'>('water');
  const [showAddSleep, setShowAddSleep] = useState(false);
  const [showAddMood, setShowAddMood] = useState(false);

  // Water state
  const today = new Date().toISOString().split('T')[0];
  const todayWater = waterEntries.filter((e) => e.date === today);
  const waterTotal = todayWater.reduce((sum, e) => sum + e.amount, 0);
  const waterProgress = Math.min(100, (waterTotal / waterGoal) * 100);

  // Sleep state
  const [newSleep, setNewSleep] = useState({
    bedTime: '23:00',
    wakeTime: '07:00',
    quality: 3 as 1 | 2 | 3 | 4 | 5,
    notes: '',
    factors: [] as string[],
  });

  // Mood state
  const [newMood, setNewMood] = useState({
    mood: 3 as 1 | 2 | 3 | 4 | 5,
    energy: 3 as 1 | 2 | 3 | 4 | 5,
    note: '',
  });

  // Breathing state
  const [breathingActive, setBreathingActive] = useState(false);
  const [selectedTechnique, setSelectedTechnique] = useState(breathingTechniques[0]);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState(0);
  const [breathingCycles, setBreathingCycles] = useState(0);
  const [totalBreathingTime, setTotalBreathingTime] = useState(0);

  const todaySleep = sleepEntries.find((s) => s.date === today);
  const todayMoods = moodEntries.filter((m) => m.date === today);

  // Breathing logic
  const startBreathing = () => {
    setBreathingActive(true);
    setBreathingPhase('inhale');
    setBreathingTimer(selectedTechnique.inhale);
    setBreathingCycles(0);
    setTotalBreathingTime(0);
  };

  const stopBreathing = useCallback(() => {
    setBreathingActive(false);
    if (breathingCycles > 0) {
      addBreathingSession({
        date: today,
        technique: selectedTechnique.id as 'box' | '478' | 'calm' | 'energize',
        duration: totalBreathingTime,
        completed: breathingCycles >= 3,
      });
    }
  }, [breathingCycles, totalBreathingTime, selectedTechnique, today, addBreathingSession]);

  useEffect(() => {
    if (!breathingActive) return;

    const interval = setInterval(() => {
      setTotalBreathingTime((t) => t + 1);
      setBreathingTimer((t) => {
        if (t <= 1) {
          // Move to next phase
          if (breathingPhase === 'inhale') {
            if (selectedTechnique.hold1 > 0) {
              setBreathingPhase('hold1');
              return selectedTechnique.hold1;
            } else {
              setBreathingPhase('exhale');
              return selectedTechnique.exhale;
            }
          } else if (breathingPhase === 'hold1') {
            setBreathingPhase('exhale');
            return selectedTechnique.exhale;
          } else if (breathingPhase === 'exhale') {
            if (selectedTechnique.hold2 > 0) {
              setBreathingPhase('hold2');
              return selectedTechnique.hold2;
            } else {
              setBreathingPhase('inhale');
              setBreathingCycles((c) => c + 1);
              return selectedTechnique.inhale;
            }
          } else {
            setBreathingPhase('inhale');
            setBreathingCycles((c) => c + 1);
            return selectedTechnique.inhale;
          }
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathingActive, breathingPhase, selectedTechnique]);

  useEffect(() => {
    if (breathingCycles >= 10) {
      stopBreathing();
    }
  }, [breathingCycles, stopBreathing]);

  const calculateSleepDuration = (bed: string, wake: string) => {
    const [bedH, bedM] = bed.split(':').map(Number);
    const [wakeH, wakeM] = wake.split(':').map(Number);
    let duration = (wakeH * 60 + wakeM) - (bedH * 60 + bedM);
    if (duration < 0) duration += 24 * 60;
    return duration;
  };

  const handleAddSleep = () => {
    const duration = calculateSleepDuration(newSleep.bedTime, newSleep.wakeTime);
    addSleepEntry({
      date: today,
      bedTime: newSleep.bedTime,
      wakeTime: newSleep.wakeTime,
      duration,
      quality: newSleep.quality,
      notes: newSleep.notes,
      factors: newSleep.factors as ('caffeine' | 'exercise' | 'screen' | 'stress' | 'alcohol')[],
    });
    setShowAddSleep(false);
  };

  const handleAddMood = () => {
    addMoodEntry({
      date: today,
      time: new Date().toISOString(),
      mood: newMood.mood,
      energy: newMood.energy,
      note: newMood.note,
    });
    setShowAddMood(false);
    setNewMood({ mood: 3, energy: 3, note: '' });
  };

  const phaseLabels = {
    inhale: 'Вдох',
    hold1: 'Задержка',
    exhale: 'Выдох',
    hold2: 'Задержка',
  };

  return (
    <div className="min-h-screen pt-safe px-4 pb-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Здоровье 🧘</h1>
        <p className="text-gray-500 text-sm">Вода, сон, настроение, дыхание</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        {[
          { id: 'water', label: '💧 Вода' },
          { id: 'sleep', label: '😴 Сон' },
          { id: 'mood', label: '🧠 Настроение' },
          { id: 'breathing', label: '🌬️ Дыхание' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'glass-card text-gray-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Water Tab */}
      {activeTab === 'water' && (
        <div className="space-y-4">
          {/* Progress Circle */}
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4">
              <svg className="w-full h-full progress-ring" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="85" fill="none" stroke="#e5e7eb" strokeWidth="16" />
                <motion.circle
                  cx="100" cy="100" r="85"
                  fill="none"
                  stroke="url(#waterGradient)"
                  strokeWidth="16"
                  strokeLinecap="round"
                  strokeDasharray={534.07}
                  animate={{ strokeDashoffset: 534.07 - (534.07 * waterProgress) / 100 }}
                  transition={{ duration: 0.5 }}
                />
                <defs>
                  <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl mb-1">💧</span>
                <p className="text-3xl font-bold text-gray-800">{waterTotal}</p>
                <p className="text-sm text-gray-500">из {waterGoal} мл</p>
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="flex gap-3 w-full">
              {[100, 250, 500].map((amount) => (
                <motion.button
                  key={amount}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addWaterEntry(amount)}
                  className="flex-1 py-4 rounded-xl gradient-cyan text-white font-semibold shadow-lg"
                >
                  +{amount}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Goal Setting */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700">Дневная цель</span>
              <span className="font-semibold text-cyan-600">{waterGoal} мл</span>
            </div>
            <input
              type="range"
              min="1000"
              max="4000"
              step="100"
              value={waterGoal}
              onChange={(e) => setWaterGoal(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Today's entries */}
          {todayWater.length > 0 && (
            <div className="glass-card rounded-2xl p-4">
              <p className="font-semibold text-gray-800 mb-3">Сегодня выпито</p>
              <div className="flex flex-wrap gap-2">
                {todayWater.map((entry) => (
                  <span key={entry.id} className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-600 text-sm">
                    {entry.amount} мл • {new Date(entry.time).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sleep Tab */}
      {activeTab === 'sleep' && (
        <div className="space-y-4">
          {todaySleep ? (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">😴</span>
                  <div>
                    <p className="font-semibold text-gray-800">Сон записан</p>
                    <p className="text-sm text-gray-500">
                      {todaySleep.bedTime} → {todaySleep.wakeTime}
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600">
                    {Math.floor(todaySleep.duration / 60)}ч {todaySleep.duration % 60}м
                  </p>
                  <p className="text-xs text-indigo-600">длительность</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-purple-600">
                    {'⭐'.repeat(todaySleep.quality)}
                  </p>
                  <p className="text-xs text-purple-600">качество</p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSleep(true)}
              className="w-full py-6 rounded-2xl glass-card border-2 border-dashed border-indigo-200"
            >
              <span className="text-3xl">😴</span>
              <p className="font-semibold text-gray-800 mt-2">Записать сон</p>
              <p className="text-sm text-gray-500">Как вы спали сегодня?</p>
            </button>
          )}

          {/* Sleep History */}
          <div className="glass-card rounded-2xl p-4">
            <p className="font-semibold text-gray-800 mb-3">История сна</p>
            {sleepEntries.length === 0 ? (
              <p className="text-center text-gray-500 py-4">Нет записей</p>
            ) : (
              <div className="space-y-2">
                {sleepEntries.slice(-7).reverse().map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div>
                      <p className="text-sm text-gray-800">{new Date(entry.date).toLocaleDateString('ru')}</p>
                      <p className="text-xs text-gray-500">{entry.bedTime} → {entry.wakeTime}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">
                        {Math.floor(entry.duration / 60)}ч {entry.duration % 60}м
                      </p>
                      <p className="text-xs">{'⭐'.repeat(entry.quality)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mood Tab */}
      {activeTab === 'mood' && (
        <div className="space-y-4">
          <button
            onClick={() => setShowAddMood(true)}
            className="w-full py-6 rounded-2xl gradient-primary text-white"
          >
            <span className="text-3xl">🧠</span>
            <p className="font-semibold mt-2">Записать настроение</p>
          </button>

          {/* Today's moods */}
          {todayMoods.length > 0 && (
            <div className="glass-card rounded-2xl p-4">
              <p className="font-semibold text-gray-800 mb-3">Сегодня</p>
              <div className="space-y-3">
                {todayMoods.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <span className="text-2xl">{moodEmojis[entry.mood - 1].emoji}</span>
                    <span className="text-2xl">{energyEmojis[entry.energy - 1].emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">{entry.note || 'Без заметки'}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(entry.time).toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Average mood */}
          {moodEntries.length > 0 && (
            <div className="glass-card rounded-2xl p-4">
              <p className="font-semibold text-gray-800 mb-3">Среднее за неделю</p>
              <div className="flex justify-around">
                {moodEmojis.map((m) => {
                  const count = moodEntries.filter((e) => e.mood === m.value).length;
                  return (
                    <div key={m.value} className="text-center">
                      <span className="text-2xl">{m.emoji}</span>
                      <p className="text-xs text-gray-500 mt-1">{count}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Breathing Tab */}
      {activeTab === 'breathing' && (
        <div className="space-y-4">
          {!breathingActive ? (
            <>
              {/* Technique Selection */}
              <div className="grid grid-cols-2 gap-3">
                {breathingTechniques.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => setSelectedTechnique(tech)}
                    className={`p-4 rounded-2xl text-left transition-all ${
                      selectedTechnique.id === tech.id
                        ? 'gradient-primary text-white'
                        : 'glass-card'
                    }`}
                  >
                    <p className="font-semibold">{tech.name}</p>
                    <p className={`text-sm ${selectedTechnique.id === tech.id ? 'text-white/80' : 'text-gray-500'}`}>
                      {tech.desc}
                    </p>
                  </button>
                ))}
              </div>

              <button
                onClick={startBreathing}
                className="w-full py-6 rounded-2xl gradient-primary text-white"
              >
                <span className="text-3xl">🌬️</span>
                <p className="font-semibold mt-2">Начать дыхание</p>
              </button>

              {/* History */}
              <div className="glass-card rounded-2xl p-4">
                <p className="font-semibold text-gray-800 mb-3">История</p>
                <p className="text-gray-500 text-sm">
                  Сессий сегодня: {breathingSessions.filter((s) => s.date === today).length}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center">
              {/* Breathing Animation */}
              <div className="relative w-64 h-64 mb-8">
                <motion.div
                  animate={{
                    scale: breathingPhase === 'inhale' ? 1.5 : breathingPhase === 'exhale' ? 1 : (breathingPhase === 'hold1' ? 1.5 : 1),
                  }}
                  transition={{ duration: breathingTimer, ease: 'linear' }}
                  className="absolute inset-0 rounded-full gradient-primary opacity-30"
                />
                <motion.div
                  animate={{
                    scale: breathingPhase === 'inhale' ? 1.3 : breathingPhase === 'exhale' ? 0.8 : (breathingPhase === 'hold1' ? 1.3 : 0.8),
                  }}
                  transition={{ duration: breathingTimer, ease: 'linear' }}
                  className="absolute inset-8 rounded-full gradient-primary opacity-50"
                />
                <div className="absolute inset-16 rounded-full gradient-primary flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-4xl font-bold">{breathingTimer}</p>
                    <p className="text-sm">{phaseLabels[breathingPhase]}</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-4">Цикл: {breathingCycles} / 10</p>

              <button
                onClick={stopBreathing}
                className="px-8 py-4 rounded-2xl bg-red-500 text-white font-semibold"
              >
                Остановить
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Sleep Modal */}
      <AnimatePresence>
        {showAddSleep && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowAddSleep(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-t-3xl p-6 safe-area-bottom max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
              <h2 className="text-xl font-bold text-gray-800 mb-6">Записать сон</h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Лёг спать</p>
                  <input
                    type="time"
                    value={newSleep.bedTime}
                    onChange={(e) => setNewSleep({ ...newSleep, bedTime: e.target.value })}
                    className="w-full p-4 rounded-xl bg-gray-100 text-gray-800 outline-none"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-2">Проснулся</p>
                  <input
                    type="time"
                    value={newSleep.wakeTime}
                    onChange={(e) => setNewSleep({ ...newSleep, wakeTime: e.target.value })}
                    className="w-full p-4 rounded-xl bg-gray-100 text-gray-800 outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Качество сна</p>
                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5].map((q) => (
                    <button
                      key={q}
                      onClick={() => setNewSleep({ ...newSleep, quality: q as 1 | 2 | 3 | 4 | 5 })}
                      className={`w-12 h-12 rounded-xl text-xl ${
                        newSleep.quality >= q ? 'bg-indigo-100' : 'bg-gray-100'
                      }`}
                    >
                      {newSleep.quality >= q ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Факторы</p>
                <div className="flex flex-wrap gap-2">
                  {sleepFactors.map((f) => (
                    <button
                      key={f.id}
                      onClick={() =>
                        setNewSleep({
                          ...newSleep,
                          factors: newSleep.factors.includes(f.id)
                            ? newSleep.factors.filter((x) => x !== f.id)
                            : [...newSleep.factors, f.id],
                        })
                      }
                      className={`px-3 py-2 rounded-xl text-sm ${
                        newSleep.factors.includes(f.id)
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {f.emoji} {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Заметки (необязательно)"
                value={newSleep.notes}
                onChange={(e) => setNewSleep({ ...newSleep, notes: e.target.value })}
                className="w-full p-4 rounded-xl bg-gray-100 text-gray-800 mb-6 outline-none resize-none h-24"
              />

              <button
                onClick={handleAddSleep}
                className="w-full py-4 rounded-xl gradient-primary text-white font-semibold"
              >
                Сохранить
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Mood Modal */}
      <AnimatePresence>
        {showAddMood && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowAddMood(false)}
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
              <h2 className="text-xl font-bold text-gray-800 mb-6">Как вы себя чувствуете?</h2>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-3">Настроение</p>
                <div className="flex justify-between">
                  {moodEmojis.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setNewMood({ ...newMood, mood: m.value as 1 | 2 | 3 | 4 | 5 })}
                      className={`w-14 h-14 rounded-2xl text-2xl transition-all ${
                        newMood.mood === m.value
                          ? 'scale-125 shadow-lg'
                          : 'opacity-50'
                      }`}
                      style={{ backgroundColor: newMood.mood === m.value ? `${m.color}20` : undefined }}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-3">Энергия</p>
                <div className="flex justify-between">
                  {energyEmojis.map((e) => (
                    <button
                      key={e.value}
                      onClick={() => setNewMood({ ...newMood, energy: e.value as 1 | 2 | 3 | 4 | 5 })}
                      className={`w-14 h-14 rounded-2xl text-2xl transition-all ${
                        newMood.energy === e.value
                          ? 'scale-125 shadow-lg bg-indigo-100'
                          : 'opacity-50'
                      }`}
                    >
                      {e.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder="Заметка (необязательно)"
                value={newMood.note}
                onChange={(e) => setNewMood({ ...newMood, note: e.target.value })}
                className="w-full p-4 rounded-xl bg-gray-100 text-gray-800 mb-6 outline-none resize-none h-24"
              />

              <button
                onClick={handleAddMood}
                className="w-full py-4 rounded-xl gradient-primary text-white font-semibold"
              >
                Сохранить
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
