import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';

export default function Profile() {
  const {
    profile,
    updateProfile,
    achievements,
    habits,
    tasks,
    pomodoroSessions,
    exportData,
    importData,
    resetAll,
  } = useStore();

  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [importText, setImportText] = useState('');

  const xpForLevel = (level: number) => level * 100 + (level - 1) * 50;
  const xpProgress = (profile.xp / xpForLevel(profile.level)) * 100;

  const unlockedAchievements = achievements.filter((a) => a.unlockedAt);
  const lockedAchievements = achievements.filter((a) => !a.unlockedAt);

  // Stats
  const totalHabitsCompleted = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
  const totalTasksCompleted = tasks.filter((t) => t.completed).length;
  const totalFocusMinutes = pomodoroSessions
    .filter((s) => s.type === 'work' && s.completed)
    .reduce((sum, s) => sum + s.duration, 0);

  const handleSaveName = () => {
    if (editName.trim()) {
      updateProfile({ name: editName.trim() });
    }
    setShowSettings(false);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifeos-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (importText.trim()) {
      importData(importText);
      setImportText('');
      setShowExport(false);
    }
  };

  const handleReset = () => {
    if (confirm('Вы уверены? Все данные будут удалены!')) {
      resetAll();
    }
  };

  return (
    <div className="min-h-screen pt-safe px-4 pb-4">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Профиль 👤</h1>
            <p className="text-gray-500 text-sm">Ваши достижения</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Profile Card */}
      <div className="glass-card rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{profile.name}</h2>
            <p className="text-indigo-600 font-medium">{profile.title}</p>
            <p className="text-sm text-gray-500">Уровень {profile.level}</p>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Опыт</span>
            <span className="font-semibold gradient-text">{profile.xp} / {xpForLevel(profile.level)} XP</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              className="h-full gradient-primary rounded-full"
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-indigo-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-indigo-600">{profile.totalXp}</p>
            <p className="text-xs text-indigo-600">всего XP</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-emerald-600">{profile.streak}</p>
            <p className="text-xs text-emerald-600">серия дней</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-600">{unlockedAchievements.length}</p>
            <p className="text-xs text-amber-600">достижений</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-purple-600">{profile.level}</p>
            <p className="text-xs text-purple-600">уровень</p>
          </div>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <p className="font-semibold text-gray-800 mb-3">Общая статистика</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎯</span>
              <span className="text-gray-700">Привычки выполнено</span>
            </div>
            <span className="font-semibold text-gray-800">{totalHabitsCompleted}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <span className="text-gray-700">Задачи выполнены</span>
            </div>
            <span className="font-semibold text-gray-800">{totalTasksCompleted}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">⏱️</span>
              <span className="text-gray-700">Минуты фокуса</span>
            </div>
            <span className="font-semibold text-gray-800">{totalFocusMinutes}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <span className="text-gray-700">С нами с</span>
            </div>
            <span className="font-semibold text-gray-800">
              {new Date(profile.joinedAt).toLocaleDateString('ru')}
            </span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <p className="font-semibold text-gray-800 mb-3">
          Достижения ({unlockedAchievements.length}/{achievements.length})
        </p>

        {/* Unlocked */}
        {unlockedAchievements.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Разблокированы</p>
            <div className="grid grid-cols-4 gap-2">
              {unlockedAchievements.map((a) => (
                <motion.div
                  key={a.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="aspect-square rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 flex flex-col items-center justify-center p-2"
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <p className="text-xs text-amber-700 mt-1 text-center line-clamp-1">{a.name}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {lockedAchievements.length > 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Заблокированы</p>
            <div className="grid grid-cols-4 gap-2">
              {lockedAchievements.map((a) => (
                <div
                  key={a.id}
                  className="aspect-square rounded-xl bg-gray-100 flex flex-col items-center justify-center p-2 opacity-50"
                >
                  <span className="text-2xl grayscale">🔒</span>
                  <p className="text-xs text-gray-500 mt-1 text-center line-clamp-1">{a.name}</p>
                  {a.target && a.progress !== undefined && (
                    <div className="w-full h-1 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-gray-400 rounded-full"
                        style={{ width: `${Math.min(100, (a.progress / a.target) * 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => setShowExport(true)}
          className="w-full py-4 rounded-xl glass-card text-gray-800 font-medium flex items-center justify-center gap-2"
        >
          📦 Экспорт / Импорт данных
        </button>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowSettings(false)}
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
              <h2 className="text-xl font-bold text-gray-800 mb-6">Настройки профиля</h2>

              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Имя</p>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-4 rounded-xl bg-gray-100 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={handleSaveName}
                className="w-full py-4 rounded-xl gradient-primary text-white font-semibold mb-4"
              >
                Сохранить
              </button>

              <button
                onClick={handleReset}
                className="w-full py-4 rounded-xl bg-red-100 text-red-600 font-semibold"
              >
                🗑️ Сбросить все данные
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export/Import Modal */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-end justify-center"
            onClick={() => setShowExport(false)}
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
              <h2 className="text-xl font-bold text-gray-800 mb-6">Данные</h2>

              <button
                onClick={handleExport}
                className="w-full py-4 rounded-xl gradient-primary text-white font-semibold mb-4"
              >
                📤 Скачать резервную копию
              </button>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Импорт данных</p>
                <textarea
                  placeholder="Вставьте JSON данные сюда..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full p-4 rounded-xl bg-gray-100 text-gray-800 outline-none resize-none h-32"
                />
              </div>

              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className={`w-full py-4 rounded-xl font-semibold ${
                  importText.trim()
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                📥 Импортировать
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
