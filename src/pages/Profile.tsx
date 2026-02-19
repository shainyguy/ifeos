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
    if (confirm('Удалить все данные?')) {
      resetAll();
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">Профиль 👤</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="page-content">
        {/* Profile Card */}
        <div className="glass-card rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-xl gradient-primary flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{profile.name}</h2>
              <p className="text-sm text-indigo-600 font-medium">{profile.title}</p>
              <p className="text-xs text-gray-500">Уровень {profile.level}</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Опыт</span>
              <span className="font-semibold gradient-text">{profile.xp} / {xpForLevel(profile.level)} XP</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                className="h-full gradient-primary rounded-full"
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-indigo-50 rounded-lg p-2 text-center">
              <p className="text-sm font-bold text-indigo-600">{profile.totalXp}</p>
              <p className="text-[9px] text-indigo-600">XP</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-2 text-center">
              <p className="text-sm font-bold text-emerald-600">{profile.streak}</p>
              <p className="text-[9px] text-emerald-600">дней</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-2 text-center">
              <p className="text-sm font-bold text-amber-600">{unlockedAchievements.length}</p>
              <p className="text-[9px] text-amber-600">ачивки</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 text-center">
              <p className="text-sm font-bold text-purple-600">{profile.level}</p>
              <p className="text-[9px] text-purple-600">уровень</p>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="glass-card rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 mb-2">Общая статистика</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">🎯 Привычек выполнено</span>
              <span className="font-semibold text-gray-800">{totalHabitsCompleted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">✅ Задач выполнено</span>
              <span className="font-semibold text-gray-800">{totalTasksCompleted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">⏱️ Минут фокуса</span>
              <span className="font-semibold text-gray-800">{totalFocusMinutes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">📅 С нами с</span>
              <span className="font-semibold text-gray-800">
                {new Date(profile.joinedAt).toLocaleDateString('ru')}
              </span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="glass-card rounded-xl p-3 mb-4">
          <p className="text-xs text-gray-500 mb-2">
            Достижения ({unlockedAchievements.length}/{achievements.length})
          </p>

          {unlockedAchievements.length > 0 && (
            <div className="mb-3">
              <div className="grid grid-cols-5 gap-1.5">
                {unlockedAchievements.map((a) => (
                  <motion.div
                    key={a.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="aspect-square rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center text-lg"
                    title={a.name}
                  >
                    {a.emoji}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {lockedAchievements.length > 0 && (
            <div className="grid grid-cols-5 gap-1.5">
              {lockedAchievements.slice(0, 5).map((a) => (
                <div
                  key={a.id}
                  className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-lg opacity-40"
                  title={a.name}
                >
                  🔒
                </div>
              ))}
              {lockedAchievements.length > 5 && (
                <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                  +{lockedAchievements.length - 5}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <button
          onClick={() => setShowExport(true)}
          className="w-full py-3 rounded-xl glass-card text-gray-800 font-medium text-sm flex items-center justify-center gap-2"
        >
          📦 Экспорт / Импорт
        </button>
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

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Имя</p>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-100 text-gray-800 outline-none text-sm"
                />
              </div>

              <button
                onClick={handleSaveName}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm mb-3"
              >
                Сохранить
              </button>

              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl bg-red-100 text-red-600 font-semibold text-sm"
              >
                🗑️ Сбросить данные
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Modal */}
      <AnimatePresence>
        {showExport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowExport(false)}
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
              <h2 className="text-lg font-bold text-gray-800 mb-4">Данные</h2>

              <button
                onClick={handleExport}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm mb-3"
              >
                📤 Скачать резервную копию
              </button>

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Импорт</p>
                <textarea
                  placeholder="Вставьте JSON..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-gray-100 text-gray-800 outline-none resize-none h-24 text-sm"
                />
              </div>

              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className={`w-full py-3 rounded-xl font-semibold text-sm ${
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
