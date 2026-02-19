import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const goalEmojis = ['🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '🏝️', '💰', '🎯'];
const goalColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Finance() {
  const {
    financeSettings,
    updateFinanceSettings,
    categories,
    expenses,
    addExpense,
    deleteExpense,
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'goals'>('overview');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [newExpense, setNewExpense] = useState({
    amount: '',
    categoryId: categories[0]?.id || '',
    description: '',
  });

  const [newGoal, setNewGoal] = useState({
    name: '',
    emoji: '🎯',
    targetAmount: '',
    color: '#6366f1',
  });

  const today = new Date().toISOString().split('T')[0];
  const currentMonth = today.slice(0, 7);

  const { monthlyIncome, investmentPercent, savingsPercent, expensesPercent, emergencyPercent } = financeSettings;

  const distribution = useMemo(() => [
    { name: 'Инвестиции', value: (monthlyIncome * investmentPercent) / 100, color: '#6366f1', percent: investmentPercent },
    { name: 'Накопления', value: (monthlyIncome * savingsPercent) / 100, color: '#10b981', percent: savingsPercent },
    { name: 'Расходы', value: (monthlyIncome * expensesPercent) / 100, color: '#f59e0b', percent: expensesPercent },
    { name: 'Подушка', value: (monthlyIncome * emergencyPercent) / 100, color: '#ef4444', percent: emergencyPercent },
  ], [monthlyIncome, investmentPercent, savingsPercent, expensesPercent, emergencyPercent]);

  const monthlyExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
  const budgetLeft = distribution[2].value - totalSpent;
  const totalSaved = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);

  const handleAddExpense = () => {
    if (!newExpense.amount || !newExpense.categoryId) return;
    addExpense({
      amount: Number(newExpense.amount),
      categoryId: newExpense.categoryId,
      description: newExpense.description,
      date: today,
    });
    setNewExpense({ amount: '', categoryId: categories[0]?.id || '', description: '' });
    setShowAddExpense(false);
  };

  const handleAddGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) return;
    addSavingsGoal({
      name: newGoal.name,
      emoji: newGoal.emoji,
      targetAmount: Number(newGoal.targetAmount),
      color: newGoal.color,
    });
    setNewGoal({ name: '', emoji: '🎯', targetAmount: '', color: '#6366f1' });
    setShowAddGoal(false);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <header className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Финансы 💰</h1>
            <p className="text-xs text-gray-500">Доход: {monthlyIncome.toLocaleString()}₽/мес</p>
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
      <div className="page-content">
        {/* Summary Card */}
        <div className="glass-card rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={22}
                    outerRadius={36}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2">
              {distribution.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 truncate">{item.name}</p>
                    <p className="text-xs font-semibold text-gray-800">{item.value.toLocaleString()}₽</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'overview', label: '📊 Обзор' },
            { id: 'expenses', label: '💸 Расходы' },
            { id: 'goals', label: '🎯 Цели' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                  : 'glass-card text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="list-spacing">
            {/* Budget Status */}
            <div className="glass-card rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-800">Бюджет на расходы</p>
                <span className={`text-xs font-medium ${budgetLeft >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {budgetLeft >= 0 ? 'Осталось' : 'Перерасход'}: {Math.abs(budgetLeft).toLocaleString()}₽
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${budgetLeft >= 0 ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, (totalSpent / distribution[2].value) * 100)}%` }}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="glass-card rounded-xl p-3">
              <p className="text-sm font-medium text-gray-800 mb-2">Категории</p>
              <div className="space-y-2">
                {categories.slice(0, 4).map((cat) => {
                  const spent = monthlyExpenses
                    .filter(e => e.categoryId === cat.id)
                    .reduce((sum, e) => sum + e.amount, 0);
                  const progress = cat.budget > 0 ? (spent / cat.budget) * 100 : 0;
                  return (
                    <div key={cat.id}>
                      <div className="flex items-center justify-between text-xs mb-0.5">
                        <span className="text-gray-600">{cat.emoji} {cat.name}</span>
                        <span className="text-gray-500">{spent.toLocaleString()} / {cat.budget.toLocaleString()}₽</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(100, progress)}%`,
                            backgroundColor: progress > 100 ? '#ef4444' : cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Savings Summary */}
            <div className="glass-card rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-800">Накоплено</p>
                <p className="text-lg font-bold gradient-text">{totalSaved.toLocaleString()}₽</p>
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Прогноз через 12 мес: ~{(totalSaved + distribution[1].value * 12).toLocaleString()}₽
              </p>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="list-spacing">
            <button
              onClick={() => setShowAddExpense(true)}
              className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm"
            >
              + Добавить расход
            </button>

            {monthlyExpenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">💸</p>
                <p className="text-sm text-gray-500">Нет расходов за этот месяц</p>
              </div>
            ) : (
              monthlyExpenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((expense) => {
                  const category = categories.find(c => c.id === expense.categoryId);
                  return (
                    <div key={expense.id} className="glass-card rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ backgroundColor: `${category?.color}20` }}>
                          {category?.emoji || '💰'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{expense.description || category?.name}</p>
                          <p className="text-[10px] text-gray-500">{new Date(expense.date).toLocaleDateString('ru')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-800 text-sm">-{expense.amount.toLocaleString()}₽</p>
                        <button onClick={() => deleteExpense(expense.id)} className="text-red-400 text-xs">🗑️</button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="list-spacing">
            <button
              onClick={() => setShowAddGoal(true)}
              className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm"
            >
              + Новая цель
            </button>

            {savingsGoals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🎯</p>
                <p className="text-sm text-gray-500">Добавьте финансовую цель</p>
              </div>
            ) : (
              savingsGoals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const monthsLeft = Math.ceil((goal.targetAmount - goal.currentAmount) / Math.max(1, distribution[1].value));
                return (
                  <div key={goal.id} className="glass-card rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${goal.color}20` }}>
                          {goal.emoji}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{goal.name}</p>
                          <p className="text-[10px] text-gray-500">~{monthsLeft} мес.</p>
                        </div>
                      </div>
                      <button onClick={() => deleteSavingsGoal(goal.id)} className="text-red-400 text-xs">🗑️</button>
                    </div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600">{goal.currentAmount.toLocaleString()}₽</span>
                      <span className="text-gray-600">{goal.targetAmount.toLocaleString()}₽</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.min(100, progress)}%`, backgroundColor: goal.color }}
                      />
                    </div>
                    <div className="flex gap-1.5">
                      {[1000, 5000, 10000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => updateSavingsGoal(goal.id, amount)}
                          className="flex-1 py-1.5 rounded-lg bg-emerald-100 text-emerald-600 text-xs font-medium"
                        >
                          +{amount >= 1000 ? `${amount / 1000}K` : amount}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddExpense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowAddExpense(false)}
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
              <h2 className="text-lg font-bold text-gray-800 mb-4">Новый расход</h2>

              <input
                type="number"
                placeholder="Сумма"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                className="w-full p-4 rounded-xl bg-gray-100 text-gray-800 mb-3 outline-none text-2xl font-bold text-center"
              />

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Категория</p>
                <div className="grid grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setNewExpense({ ...newExpense, categoryId: cat.id })}
                      className={`p-2.5 rounded-xl text-center ${
                        newExpense.categoryId === cat.id
                          ? 'ring-2 ring-indigo-500 bg-indigo-50'
                          : 'bg-gray-100'
                      }`}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <p className="text-[10px] text-gray-600 mt-0.5">{cat.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="text"
                placeholder="Описание (необязательно)"
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                className="w-full p-3 rounded-xl bg-gray-100 text-gray-800 mb-4 outline-none text-sm"
              />

              <button
                onClick={handleAddExpense}
                disabled={!newExpense.amount}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm disabled:opacity-50"
              >
                Добавить
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowAddGoal(false)}
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
              <h2 className="text-lg font-bold text-gray-800 mb-4">Новая цель</h2>

              <input
                type="text"
                placeholder="Название"
                value={newGoal.name}
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-gray-100 text-gray-800 mb-3 outline-none text-sm"
              />

              <input
                type="number"
                placeholder="Целевая сумма"
                value={newGoal.targetAmount}
                onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                className="w-full p-3 rounded-xl bg-gray-100 text-gray-800 mb-3 outline-none text-sm"
              />

              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Иконка</p>
                <div className="flex flex-wrap gap-1.5">
                  {goalEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewGoal({ ...newGoal, emoji })}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
                        newGoal.emoji === emoji ? 'bg-indigo-100 ring-2 ring-indigo-500' : 'bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Цвет</p>
                <div className="flex gap-2">
                  {goalColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewGoal({ ...newGoal, color })}
                      className={`w-7 h-7 rounded-full ${
                        newGoal.color === color ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddGoal}
                disabled={!newGoal.name || !newGoal.targetAmount}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm disabled:opacity-50"
              >
                Создать
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <p className="text-xs text-gray-500 mb-2">Месячный доход</p>
                <input
                  type="number"
                  value={financeSettings.monthlyIncome}
                  onChange={(e) => updateFinanceSettings({ monthlyIncome: Number(e.target.value) })}
                  className="w-full p-3 rounded-xl bg-gray-100 text-gray-800 outline-none text-lg font-bold"
                />
              </div>

              <div className="space-y-3 mb-4">
                {[
                  { key: 'investmentPercent', label: 'Инвестиции', color: '#6366f1' },
                  { key: 'savingsPercent', label: 'Накопления', color: '#10b981' },
                  { key: 'expensesPercent', label: 'Расходы', color: '#f59e0b' },
                  { key: 'emergencyPercent', label: 'Подушка', color: '#ef4444' },
                ].map((item) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs text-gray-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {financeSettings[item.key as keyof typeof financeSettings]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={financeSettings[item.key as keyof typeof financeSettings]}
                      onChange={(e) => updateFinanceSettings({ [item.key]: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm"
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
