import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

export default function Focus() {
  const { pomodoroSettings, pomodoroSessions, addPomodoroSession } = useStore();

  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [timeLeft, setTimeLeft] = useState(pomodoroSettings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [customWork, setCustomWork] = useState(pomodoroSettings.workDuration);
  const [customBreak, setCustomBreak] = useState(pomodoroSettings.breakDuration);

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todaySessions = pomodoroSessions.filter(
    (s) => s.startTime.startsWith(today) && s.type === 'work' && s.completed
  );
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  const playSound = useCallback(() => {
    if (pomodoroSettings.soundEnabled) {
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch {
        // Audio not supported
      }
    }
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, [pomodoroSettings.soundEnabled]);

  const completeSession = useCallback(() => {
    playSound();
    
    if (mode === 'work') {
      addPomodoroSession({
        startTime: startTimeRef.current || new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: customWork,
        type: 'work',
        completed: true,
      });
      setSessionCount((c) => c + 1);
      setMode('break');
      setTimeLeft(customBreak * 60);
    } else {
      setMode('work');
      setTimeLeft(customWork * 60);
    }
    setIsRunning(false);
    startTimeRef.current = null;
  }, [mode, customWork, customBreak, addPomodoroSession, playSound]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      completeSession();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft, completeSession]);

  const toggleTimer = () => {
    if (!isRunning) {
      startTimeRef.current = new Date().toISOString();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode === 'work' ? customWork * 60 : customBreak * 60);
    startTimeRef.current = null;
  };

  const skipSession = () => {
    if (mode === 'work') {
      setMode('break');
      setTimeLeft(customBreak * 60);
    } else {
      setMode('work');
      setTimeLeft(customWork * 60);
    }
    setIsRunning(false);
    startTimeRef.current = null;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'work'
    ? ((customWork * 60 - timeLeft) / (customWork * 60)) * 100
    : ((customBreak * 60 - timeLeft) / (customBreak * 60)) * 100;

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Фокус ⏱️</h1>
            <p className="text-xs text-gray-500">Сегодня: {todayMinutes} мин • {todaySessions.length} сессий</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="page-content flex flex-col items-center">
        {/* Stats */}
        <div className="stats-grid w-full mb-6">
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xl font-bold gradient-text">{todaySessions.length}</p>
            <p className="text-[10px] text-gray-500">сессий</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xl font-bold gradient-text">{todayMinutes}</p>
            <p className="text-[10px] text-gray-500">минут</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <p className="text-xl font-bold gradient-text">{sessionCount}</p>
            <p className="text-[10px] text-gray-500">серия</p>
          </div>
        </div>

        {/* Mode Switch */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              if (!isRunning) {
                setMode('work');
                setTimeLeft(customWork * 60);
              }
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === 'work'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                : 'glass-card text-gray-600'
            }`}
          >
            🎯 Работа
          </button>
          <button
            onClick={() => {
              if (!isRunning) {
                setMode('break');
                setTimeLeft(customBreak * 60);
              }
            }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              mode === 'break'
                ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md'
                : 'glass-card text-gray-600'
            }`}
          >
            ☕ Перерыв
          </button>
        </div>

        {/* Timer Circle */}
        <div className="relative w-56 h-56 mb-6">
          <svg className="w-full h-full progress-ring" viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="10"
            />
            <motion.circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke={mode === 'work' ? 'url(#focusGradient)' : '#10b981'}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={534.07}
              animate={{ strokeDashoffset: 534.07 - (534.07 * progress) / 100 }}
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.p
              key={timeLeft}
              initial={{ scale: 1.05 }}
              animate={{ scale: 1 }}
              className="text-5xl font-bold text-gray-800"
            >
              {formatTime(timeLeft)}
            </motion.p>
            <p className="text-sm text-gray-500 mt-1">
              {mode === 'work' ? '🎯 Фокус' : '☕ Отдых'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mb-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={resetTimer}
            className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-xl"
          >
            ↺
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white shadow-lg ${
              mode === 'work' ? 'gradient-primary' : 'gradient-success'
            }`}
          >
            {isRunning ? '⏸' : '▶'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={skipSession}
            className="w-12 h-12 rounded-xl glass-card flex items-center justify-center text-xl"
          >
            ⏭
          </motion.button>
        </div>

        {/* Presets */}
        <div className="glass-card rounded-xl p-3 w-full">
          <p className="text-xs text-gray-500 mb-2">Быстрый выбор</p>
          <div className="flex gap-2">
            {[
              { work: 25, break: 5, label: '25/5' },
              { work: 50, break: 10, label: '50/10' },
              { work: 15, break: 3, label: '15/3' },
              { work: 90, break: 20, label: '90/20' },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => {
                  if (!isRunning) {
                    setCustomWork(preset.work);
                    setCustomBreak(preset.break);
                    setTimeLeft(preset.work * 60);
                    setMode('work');
                  }
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-medium ${
                  customWork === preset.work && customBreak === preset.break
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Motivation */}
        <p className="text-center text-sm text-gray-500 mt-4">
          {mode === 'work'
            ? '💪 Сосредоточься. Ты справишься!'
            : '☕ Отдохни и восстанови силы'}
        </p>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowSettings(false)}
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
              <h2 className="text-lg font-bold text-gray-800 mb-4">Настройки</h2>

              <div className="space-y-4 mb-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Работа</span>
                    <span className="font-semibold text-indigo-600">{customWork} мин</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={customWork}
                    onChange={(e) => setCustomWork(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Перерыв</span>
                    <span className="font-semibold text-emerald-600">{customBreak} мин</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={customBreak}
                    onChange={(e) => setCustomBreak(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setTimeLeft(customWork * 60);
                  setMode('work');
                  setShowSettings(false);
                }}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm"
              >
                Применить
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
