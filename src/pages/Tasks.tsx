import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Task } from '@/types';

type Priority = 'high' | 'medium' | 'low';

const priorityConfig: Record<Priority, { color: string; bg: string; label: string }> = {
  high: { color: 'text-red-600', bg: 'bg-red-100', label: '🔴 Высокий' },
  medium: { color: 'text-amber-600', bg: 'bg-amber-100', label: '🟡 Средний' },
  low: { color: 'text-emerald-600', bg: 'bg-emerald-100', label: '🟢 Низкий' },
};

export default function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [orderedTasks, setOrderedTasks] = useState(tasks);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Priority,
    deadline: '',
    tags: [] as string[],
    tagInput: '',
  });

  const today = new Date().toISOString().split('T')[0];

  // Sync ordered tasks with store tasks
  if (orderedTasks.length !== tasks.length) {
    setOrderedTasks(tasks);
  }

  const filteredTasks = orderedTasks.filter((t) => {
    const statusMatch =
      filter === 'all' ||
      (filter === 'active' && !t.completed) ||
      (filter === 'completed' && t.completed);
    const priorityMatch = priorityFilter === 'all' || t.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const activeTasks = filteredTasks.filter((t) => !t.completed);
  const completedTasks = filteredTasks.filter((t) => t.completed);

  const todayCompleted = tasks.filter((t) => t.completedAt?.startsWith(today)).length;

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

  const removeTag = (tag: string) => {
    setNewTask({
      ...newTask,
      tags: newTask.tags.filter((t) => t !== tag),
    });
  };

  return (
    <div className="min-h-screen pt-safe px-4 pb-4">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Задачи ✅</h1>
        <p className="text-gray-500 text-sm">Управляй своими делами</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">{tasks.filter((t) => !t.completed).length}</p>
          <p className="text-xs text-gray-500">активных</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">{todayCompleted}</p>
          <p className="text-xs text-gray-500">сегодня</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold gradient-text">{tasks.filter((t) => t.completed).length}</p>
          <p className="text-xs text-gray-500">выполнено</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
        {[
          { id: 'all', label: 'Все' },
          { id: 'active', label: 'Активные' },
          { id: 'completed', label: 'Готовые' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
              filter === f.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                : 'glass-card text-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Priority Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
        <button
          onClick={() => setPriorityFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
            priorityFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Все приоритеты
        </button>
        {(['high', 'medium', 'low'] as Priority[]).map((p) => (
          <button
            key={p}
            onClick={() => setPriorityFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              priorityFilter === p ? priorityConfig[p].bg + ' ' + priorityConfig[p].color : 'bg-gray-100 text-gray-600'
            }`}
          >
            {priorityConfig[p].label}
          </button>
        ))}
      </div>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Активные задачи</h2>
          <Reorder.Group axis="y" values={activeTasks} onReorder={setOrderedTasks} className="space-y-3">
            {activeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </Reorder.Group>
        </section>
      )}

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <section className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Выполненные</h2>
          <div className="space-y-3">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.id)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">✅</p>
          <p className="text-gray-500">Нет задач</p>
          <p className="text-sm text-gray-400">Добавьте первую задачу!</p>
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
              className="w-full max-w-lg bg-white rounded-t-3xl p-6 safe-area-bottom max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
              <h2 className="text-xl font-bold text-gray-800 mb-6">Новая задача</h2>

              <input
                type="text"
                placeholder="Название задачи"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full p-4 rounded-xl bg-gray-100 text-gray-800 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
              />

              <textarea
                placeholder="Описание (необязательно)"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                className="w-full p-4 rounded-xl bg-gray-100 text-gray-800 mb-4 outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
              />

              {/* Priority */}
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Приоритет</p>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as Priority[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`flex-1 py-3 rounded-xl font-medium text-sm ${
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
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Дедлайн</p>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full p-4 rounded-xl bg-gray-100 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Tags */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Теги</p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Добавить тег"
                    value={newTask.tagInput}
                    onChange={(e) => setNewTask({ ...newTask, tagInput: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 p-3 rounded-xl bg-gray-100 text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={addTag}
                    className="px-4 rounded-xl bg-indigo-100 text-indigo-600 font-medium"
                  >
                    +
                  </button>
                </div>
                {newTask.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newTask.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-sm flex items-center gap-1"
                      >
                        {tag}
                        <button onClick={() => removeTag(tag)} className="text-indigo-400 hover:text-indigo-600">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleAddTask}
                className="w-full py-4 rounded-xl gradient-primary text-white font-semibold"
              >
                Добавить задачу
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
    <Reorder.Item value={task} id={task.id}>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-card rounded-2xl p-4 ${task.completed ? 'opacity-60' : ''}`}
      >
        <div className="flex items-start gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onToggle}
            className={`mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
              task.completed
                ? 'bg-gradient-to-r from-emerald-400 to-green-500 border-emerald-400 text-white'
                : 'border-gray-300'
            }`}
          >
            {task.completed && '✓'}
          </motion.button>
          <div className="flex-1">
            <p className={`font-semibold text-gray-800 ${task.completed ? 'line-through' : ''}`}>
              {task.title}
            </p>
            {task.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded-md text-xs ${config.bg} ${config.color}`}>
                {config.label}
              </span>
              {task.deadline && (
                <span className={`text-xs ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                  📅 {new Date(task.deadline).toLocaleDateString('ru')}
                </span>
              )}
              {task.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-md text-xs bg-indigo-100 text-indigo-600">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <button onClick={onDelete} className="text-gray-400 hover:text-red-500">
            🗑️
          </button>
        </div>
      </motion.div>
    </Reorder.Item>
  );
}
