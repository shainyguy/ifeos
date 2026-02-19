import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Task } from '@/types';

type Priority = 'high' | 'medium' | 'low';

const priorityConfig: Record<Priority, { color: string; bg: string; label: string; short: string }> = {
  high: { color: 'text-red-600', bg: 'bg-red-100', label: '🔴 Высокий', short: '🔴' },
  medium: { color: 'text-amber-600', bg: 'bg-amber-100', label: '🟡 Средний', short: '🟡' },
  low: { color: 'text-emerald-600', bg: 'bg-emerald-100', label: '🟢 Низкий', short: '🟢' },
};

export default function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    deadline: '',
    tags: [] as string[],
    tagInput: '',
  });

  const today = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const todayCompleted = tasks.filter((t) => t.completedAt?.startsWith(today)).length;
  const activeCount = tasks.filter(t => !t.completed).length;

  const handleAddTask = () => {
    if (!newTask.title.trim()) return;
    addTask({
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      deadline: newTask.deadline || undefined,
      tags: newTask.tags,
    });
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      deadline: '',
      tags: [],
      tagInput: '',
    });
    setShowAdd(false);
  };

  const addTag = () => {
    if (newTask.tagInput.trim() && !newTask.tags.includes(newTask.tagInput.trim())) {
      setNewTask({
        ...newTask,
        tags: [...newTask.tags, newTask.tagInput.trim()],
        tagInput: '',
      });
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Задачи ✅</h1>
            <p className="text-xs text-gray-500">Активных: {activeCount} • Сегодня: +{todayCompleted}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="page-content">
        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'active', label: 'Активные' },
            { id: 'completed', label: 'Готовые' },
            { id: 'all', label: 'Все' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as typeof filter)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                filter === f.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'glass-card text-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="list-spacing">
          {sortedTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onDelete={() => deleteTask(task.id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {sortedTasks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-500 text-sm">
              {filter === 'active' ? 'Все задачи выполнены!' : 'Нет задач'}
            </p>
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
              <h2 className="text-lg font-bold text-gray-800 mb-4">Новая задача</h2>

              <input
                type="text"
                placeholder="Название задачи"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full p-3 rounded-xl bg-gray-100 text-gray-800 mb-3 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />

              <textarea
                placeholder="Описание (необязательно)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full p-3 rounded-xl bg-gray-100 text-gray-800 mb-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20 text-sm"
              />

              {/* Priority */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Приоритет</p>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-medium ${
                        newTask.priority === p
                          ? priorityConfig[p].bg + ' ' + priorityConfig[p].color
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {priorityConfig[p].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Дедлайн</p>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full p-3 rounded-xl bg-gray-100 text-gray-800 outline-none text-sm"
                />
              </div>

              {/* Tags */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Теги</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Добавить тег"
                    value={newTask.tagInput}
                    onChange={(e) => setNewTask({ ...newTask, tagInput: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 p-2 rounded-lg bg-gray-100 text-gray-800 outline-none text-sm"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 rounded-lg bg-indigo-100 text-indigo-600 font-medium text-sm"
                  >
                    +
                  </button>
                </div>
                {newTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {newTask.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center gap-1"
                      >
                        {tag}
                        <button onClick={() => setNewTask({ ...newTask, tags: newTask.tags.filter(t => t !== tag) })}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleAddTask}
                disabled={!newTask.title.trim()}
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

function TaskCard({
  task,
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const config = priorityConfig[task.priority];
  const isOverdue = task.deadline && !task.completed && new Date(task.deadline) < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card rounded-xl p-3 ${task.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-2">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onToggle}
          className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs transition-all flex-shrink-0 ${
            task.completed
              ? 'bg-gradient-to-r from-emerald-400 to-green-500 border-emerald-400 text-white'
              : 'border-gray-300'
          }`}
        >
          {task.completed && '✓'}
        </motion.button>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-gray-800 text-sm ${task.completed ? 'line-through' : ''}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className={`text-xs ${config.color}`}>{config.short}</span>
            {task.deadline && (
              <span className={`text-[10px] ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                📅 {new Date(task.deadline).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
              </span>
            )}
            {task.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-600">
                #{tag}
              </span>
            ))}
            {task.tags.length > 2 && (
              <span className="text-[10px] text-gray-400">+{task.tags.length - 2}</span>
            )}
          </div>
        </div>
        <button onClick={onDelete} className="text-gray-400 text-sm flex-shrink-0">
          🗑️
        </button>
      </div>
    </motion.div>
  );
}
