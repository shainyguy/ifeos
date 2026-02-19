import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

type Tab = 'overview' | 'expenses' | 'income' | 'goals' | 'categories';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#10b981', '#3b82f6', '#f97316', '#ef4444', '#ec4899', '#14b8a6', '#f472b6', '#6b7280'];

export default function Finance() {
  const { 
    categories, incomeSources, expenses, savingsGoals,
    addExpense, deleteExpense, addCategory, updateCategory, deleteCategory,
    addIncomeSource, deleteIncomeSource,
    addSavingsGoal, updateSavingsGoal, deleteSavingsGoal
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // Form states
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  
  const [incomeName, setIncomeName] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeEmoji, setIncomeEmoji] = useState('💰');
  const [incomeMonthly, setIncomeMonthly] = useState(true);
  
  const [catName, setCatName] = useState('');
  const [catEmoji, setCatEmoji] = useState('📦');
  const [catBudget, setCatBudget] = useState('');
  const [catFixed, setCatFixed] = useState(false);
  const [catColor, setCatColor] = useState('#6366f1');
  
  const [goalName, setGoalName] = useState('');
  const [goalEmoji, setGoalEmoji] = useState('🎯');
  const [goalAmount, setGoalAmount] = useState('');
  const [goalColor, setGoalColor] = useState('#10b981');
  
  // Calculations
  const totalMonthlyIncome = useMemo(() => 
    incomeSources.filter(i => i.isMonthly).reduce((sum, i) => sum + i.amount, 0),
    [incomeSources]
  );
  
  const totalOneTimeIncome = useMemo(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    return incomeSources
      .filter(i => !i.isMonthly && i.date.startsWith(thisMonth))
      .reduce((sum, i) => sum + i.amount, 0);
  }, [incomeSources]);
  
  const totalIncome = totalMonthlyIncome + totalOneTimeIncome;
  
  const totalBudget = useMemo(() => 
    categories.reduce((sum, c) => sum + c.budget, 0),
    [categories]
  );
  
  const totalSpent = useMemo(() => 
    categories.reduce((sum, c) => sum + c.spent, 0),
    [categories]
  );
  
  const fixedExpenses = useMemo(() => 
    categories.filter(c => c.isFixed).reduce((sum, c) => sum + c.budget, 0),
    [categories]
  );
  
  const variableExpenses = useMemo(() => 
    categories.filter(c => !c.isFixed).reduce((sum, c) => sum + c.budget, 0),
    [categories]
  );
  
  const freeToSpend = totalIncome - totalBudget;
  const actualFree = totalIncome - totalSpent;
  
  const handleAddExpense = () => {
    if (!expenseAmount || !expenseCategory) return;
    addExpense({
      amount: Number(expenseAmount),
      categoryId: expenseCategory,
      description: expenseDesc,
      date: new Date().toISOString(),
    });
    setExpenseAmount('');
    setExpenseCategory('');
    setExpenseDesc('');
    setShowExpenseModal(false);
  };
  
  const handleAddIncome = () => {
    if (!incomeName || !incomeAmount) return;
    addIncomeSource({
      name: incomeName,
      emoji: incomeEmoji,
      amount: Number(incomeAmount),
      isMonthly: incomeMonthly,
      date: new Date().toISOString(),
    });
    setIncomeName('');
    setIncomeAmount('');
    setIncomeEmoji('💰');
    setIncomeMonthly(true);
    setShowIncomeModal(false);
  };
  
  const handleAddCategory = () => {
    if (!catName || !catBudget) return;
    addCategory({
      name: catName,
      emoji: catEmoji,
      budget: Number(catBudget),
      color: catColor,
      isFixed: catFixed,
    });
    setCatName('');
    setCatEmoji('📦');
    setCatBudget('');
    setCatFixed(false);
    setShowCategoryModal(false);
  };
  
  const handleAddGoal = () => {
    if (!goalName || !goalAmount) return;
    addSavingsGoal({
      name: goalName,
      emoji: goalEmoji,
      targetAmount: Number(goalAmount),
      color: goalColor,
    });
    setGoalName('');
    setGoalEmoji('🎯');
    setGoalAmount('');
    setShowGoalModal(false);
  };
  
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', { 
      style: 'currency', 
      currency: 'RUB',
      maximumFractionDigits: 0 
    }).format(amount);
  };
  
  // Chart data
  const chartData = categories.map(c => ({
    name: c.name,
    value: c.budget,
    color: c.color,
  }));
  
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Обзор', icon: '📊' },
    { id: 'expenses', label: 'Расходы', icon: '💸' },
    { id: 'income', label: 'Доходы', icon: '💰' },
    { id: 'categories', label: 'Категории', icon: '📁' },
    { id: 'goals', label: 'Цели', icon: '🎯' },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">Финансы</h1>
        <p className="text-gray-500 text-sm mt-1">Контроль бюджета</p>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 bg-white border-b border-gray-100">
        <div className="flex gap-1 overflow-x-auto pb-1 hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="page-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Balance Card */}
            <div className="card bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
              <p className="text-indigo-100 text-sm">Общий баланс</p>
              <p className="text-3xl font-bold mt-1">{formatMoney(totalIncome)}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-indigo-200 text-xs">Бюджет расходов</p>
                  <p className="text-lg font-semibold">{formatMoney(totalBudget)}</p>
                </div>
                <div>
                  <p className="text-indigo-200 text-xs">Свободно</p>
                  <p className={`text-lg font-semibold ${freeToSpend < 0 ? 'text-red-300' : ''}`}>
                    {formatMoney(freeToSpend)}
                  </p>
                </div>
              </div>
            </div>

            {/* Spending Summary */}
            <div className="card">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-900">Расходы за месяц</h3>
                <span className="text-sm text-gray-500">
                  {formatMoney(totalSpent)} / {formatMoney(totalBudget)}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full rounded-full transition-all ${
                    totalSpent / totalBudget > 0.9 ? 'bg-red-500' :
                    totalSpent / totalBudget > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (totalSpent / totalBudget) * 100)}%` }}
                />
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                {categories.slice(0, 6).map(cat => (
                  <div key={cat.id} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: cat.color }} 
                    />
                    <span className="text-xs text-gray-600 truncate">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="card bg-green-50">
                <p className="text-green-600 text-xs font-medium">Фиксированные</p>
                <p className="text-xl font-bold text-green-700 mt-1">{formatMoney(fixedExpenses)}</p>
                <p className="text-green-500 text-xs mt-1">в месяц</p>
              </div>
              <div className="card bg-orange-50">
                <p className="text-orange-600 text-xs font-medium">Переменные</p>
                <p className="text-xl font-bold text-orange-700 mt-1">{formatMoney(variableExpenses)}</p>
                <p className="text-orange-500 text-xs mt-1">бюджет</p>
              </div>
            </div>

            {/* Actual Free Money */}
            <div className="card bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-emerald-700 font-medium">Осталось потратить</p>
                  <p className="text-2xl font-bold text-emerald-800">{formatMoney(actualFree)}</p>
                </div>
                <div className="text-4xl">💎</div>
              </div>
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {/* Quick Add */}
            <button
              onClick={() => setShowExpenseModal(true)}
              className="w-full card bg-red-50 border-red-100 border-2 border-dashed flex items-center justify-center gap-2 py-4"
            >
              <span className="text-2xl">➕</span>
              <span className="text-red-600 font-medium">Добавить расход</span>
            </button>

            {/* Categories with spending */}
            <div className="space-y-3">
              {categories.map(cat => {
                const percent = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0;
                const isOver = percent > 100;
                
                return (
                  <div key={cat.id} className="card">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{cat.emoji}</span>
                        <div>
                          <p className="font-medium text-gray-900">{cat.name}</p>
                          <p className="text-xs text-gray-500">
                            {cat.isFixed ? '📌 Фикс.' : '📊 Перем.'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${isOver ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatMoney(cat.spent)}
                        </p>
                        <p className="text-xs text-gray-500">из {formatMoney(cat.budget)}</p>
                      </div>
                    </div>
                    
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          isOver ? 'bg-red-500' :
                          percent > 80 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recent expenses */}
            {expenses.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-3">Последние расходы</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {expenses.slice(-10).reverse().map(exp => {
                    const cat = categories.find(c => c.id === exp.categoryId);
                    return (
                      <div key={exp.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                          <span>{cat?.emoji || '📦'}</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{exp.description || cat?.name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(exp.date).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-red-600">-{formatMoney(exp.amount)}</span>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="text-gray-400 hover:text-red-500 p-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Income Tab */}
        {activeTab === 'income' && (
          <div className="space-y-4">
            {/* Total Income */}
            <div className="card bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <p className="text-green-100 text-sm">Общий доход</p>
              <p className="text-3xl font-bold mt-1">{formatMoney(totalIncome)}</p>
              <div className="flex gap-4 mt-3">
                <div className="flex items-center gap-1">
                  <span className="text-green-200">🔄</span>
                  <span className="text-sm text-green-100">{formatMoney(totalMonthlyIncome)}/мес</span>
                </div>
                {totalOneTimeIncome > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-green-200">✨</span>
                    <span className="text-sm text-green-100">+{formatMoney(totalOneTimeIncome)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Add Income */}
            <button
              onClick={() => setShowIncomeModal(true)}
              className="w-full card bg-green-50 border-green-100 border-2 border-dashed flex items-center justify-center gap-2 py-4"
            >
              <span className="text-2xl">➕</span>
              <span className="text-green-600 font-medium">Добавить доход</span>
            </button>

            {/* Income Sources */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 px-1">Источники дохода</h3>
              
              {incomeSources.map(income => (
                <div key={income.id} className="card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{income.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-900">{income.name}</p>
                        <p className="text-xs text-gray-500">
                          {income.isMonthly ? '🔄 Ежемесячно' : '✨ Разовый'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-green-600">{formatMoney(income.amount)}</span>
                      <button
                        onClick={() => deleteIncomeSource(income.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Income Distribution */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Распределение дохода</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Фиксированные расходы</span>
                  <span className="font-medium">{formatMoney(fixedExpenses)} ({((fixedExpenses/totalIncome)*100).toFixed(0)}%)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Переменные расходы</span>
                  <span className="font-medium">{formatMoney(variableExpenses)} ({((variableExpenses/totalIncome)*100).toFixed(0)}%)</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-gray-900 font-medium">Свободные средства</span>
                  <span className={`font-bold ${freeToSpend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(freeToSpend)} ({((freeToSpend/totalIncome)*100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="w-full card bg-indigo-50 border-indigo-100 border-2 border-dashed flex items-center justify-center gap-2 py-4"
            >
              <span className="text-2xl">➕</span>
              <span className="text-indigo-600 font-medium">Добавить категорию</span>
            </button>

            {/* Fixed Categories */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 px-1">📌 Фиксированные расходы</h3>
              <div className="space-y-2">
                {categories.filter(c => c.isFixed).map(cat => (
                  <div key={cat.id} className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ backgroundColor: cat.color + '20' }}
                        >
                          {cat.emoji}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{cat.name}</p>
                          <input
                            type="number"
                            value={cat.budget}
                            onChange={(e) => updateCategory(cat.id, { budget: Number(e.target.value) })}
                            className="text-sm text-gray-500 w-24 bg-transparent border-b border-gray-200 focus:border-indigo-500 outline-none"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="text-gray-400 hover:text-red-500 p-2"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Variable Categories */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 px-1">📊 Переменные расходы</h3>
              <div className="space-y-2">
                {categories.filter(c => !c.isFixed).map(cat => (
                  <div key={cat.id} className="card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                          style={{ backgroundColor: cat.color + '20' }}
                        >
                          {cat.emoji}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{cat.name}</p>
                          <input
                            type="number"
                            value={cat.budget}
                            onChange={(e) => updateCategory(cat.id, { budget: Number(e.target.value) })}
                            className="text-sm text-gray-500 w-24 bg-transparent border-b border-gray-200 focus:border-indigo-500 outline-none"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => deleteCategory(cat.id)}
                        className="text-gray-400 hover:text-red-500 p-2"
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <button
              onClick={() => setShowGoalModal(true)}
              className="w-full card bg-amber-50 border-amber-100 border-2 border-dashed flex items-center justify-center gap-2 py-4"
            >
              <span className="text-2xl">🎯</span>
              <span className="text-amber-600 font-medium">Добавить цель</span>
            </button>

            {/* Savings projection */}
            {freeToSpend > 0 && (
              <div className="card bg-gradient-to-r from-amber-50 to-orange-50">
                <h3 className="font-semibold text-gray-900 mb-2">💡 Потенциал накоплений</h3>
                <p className="text-sm text-gray-600 mb-3">
                  При текущем бюджете вы можете откладывать:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white rounded-xl p-2">
                    <p className="text-lg font-bold text-amber-600">{formatMoney(freeToSpend)}</p>
                    <p className="text-xs text-gray-500">в месяц</p>
                  </div>
                  <div className="bg-white rounded-xl p-2">
                    <p className="text-lg font-bold text-amber-600">{formatMoney(freeToSpend * 6)}</p>
                    <p className="text-xs text-gray-500">за 6 мес</p>
                  </div>
                  <div className="bg-white rounded-xl p-2">
                    <p className="text-lg font-bold text-amber-600">{formatMoney(freeToSpend * 12)}</p>
                    <p className="text-xs text-gray-500">за год</p>
                  </div>
                </div>
              </div>
            )}

            {/* Goals List */}
            <div className="space-y-3">
              {savingsGoals.map(goal => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const monthsLeft = freeToSpend > 0 
                  ? Math.ceil((goal.targetAmount - goal.currentAmount) / freeToSpend)
                  : '∞';
                
                return (
                  <div key={goal.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: goal.color + '20' }}
                        >
                          {goal.emoji}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{goal.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatMoney(goal.currentAmount)} / {formatMoney(goal.targetAmount)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteSavingsGoal(goal.id)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${Math.min(100, progress)}%`,
                          backgroundColor: goal.color 
                        }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        ≈ {monthsLeft} мес. до цели
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateSavingsGoal(goal.id, 1000)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                        >
                          +1000
                        </button>
                        <button
                          onClick={() => updateSavingsGoal(goal.id, 5000)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium"
                        >
                          +5000
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {savingsGoals.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-4xl mb-2">🎯</p>
                  <p>Добавьте финансовую цель</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      
      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Добавить расход</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Сумма</label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="0"
                  className="input-field text-2xl font-bold"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Категория</label>
                <div className="grid grid-cols-4 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setExpenseCategory(cat.id)}
                      className={`p-2 rounded-xl text-center transition-all ${
                        expenseCategory === cat.id
                          ? 'bg-indigo-100 ring-2 ring-indigo-500'
                          : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-xl">{cat.emoji}</span>
                      <p className="text-xs mt-1 truncate">{cat.name}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Описание</label>
                <input
                  type="text"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  placeholder="Необязательно"
                  className="input-field"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExpenseModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleAddExpense}
                disabled={!expenseAmount || !expenseCategory}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium disabled:opacity-50"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Income Modal */}
      {showIncomeModal && (
        <div className="modal-overlay" onClick={() => setShowIncomeModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Добавить доход</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <label className="block text-sm text-gray-600 mb-1">Иконка</label>
                  <select
                    value={incomeEmoji}
                    onChange={(e) => setIncomeEmoji(e.target.value)}
                    className="input-field text-2xl p-2 w-16"
                  >
                    <option value="💼">💼</option>
                    <option value="💰">💰</option>
                    <option value="🏦">🏦</option>
                    <option value="💵">💵</option>
                    <option value="📈">📈</option>
                    <option value="🎁">🎁</option>
                    <option value="💻">💻</option>
                    <option value="🏠">🏠</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Название</label>
                  <input
                    type="text"
                    value={incomeName}
                    onChange={(e) => setIncomeName(e.target.value)}
                    placeholder="Подработка, фриланс..."
                    className="input-field"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Сумма</label>
                <input
                  type="number"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  placeholder="0"
                  className="input-field text-xl font-bold"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Тип</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIncomeMonthly(true)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      incomeMonthly
                        ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    🔄 Ежемесячный
                  </button>
                  <button
                    onClick={() => setIncomeMonthly(false)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      !incomeMonthly
                        ? 'bg-green-100 text-green-700 ring-2 ring-green-500'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    ✨ Разовый
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowIncomeModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleAddIncome}
                disabled={!incomeName || !incomeAmount}
                className="flex-1 py-3 rounded-xl bg-green-500 text-white font-medium disabled:opacity-50"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Новая категория</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <label className="block text-sm text-gray-600 mb-1">Иконка</label>
                  <select
                    value={catEmoji}
                    onChange={(e) => setCatEmoji(e.target.value)}
                    className="input-field text-2xl p-2 w-16"
                  >
                    <option value="🏠">🏠</option>
                    <option value="🚗">🚗</option>
                    <option value="🍕">🍕</option>
                    <option value="🛒">🛒</option>
                    <option value="💊">💊</option>
                    <option value="🎮">🎮</option>
                    <option value="👕">👕</option>
                    <option value="📚">📚</option>
                    <option value="✈️">✈️</option>
                    <option value="🎁">🎁</option>
                    <option value="📦">📦</option>
                    <option value="💅">💅</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Название</label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="Название категории"
                    className="input-field"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Бюджет в месяц</label>
                <input
                  type="number"
                  value={catBudget}
                  onChange={(e) => setCatBudget(e.target.value)}
                  placeholder="0"
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-2">Тип расхода</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCatFixed(true)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      catFixed
                        ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    📌 Фиксированный
                  </button>
                  <button
                    onClick={() => setCatFixed(false)}
                    className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                      !catFixed
                        ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500'
                        : 'bg-gray-50 text-gray-600'
                    }`}
                  >
                    📊 Переменный
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Цвет</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setCatColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        catColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!catName || !catBudget}
                className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-medium disabled:opacity-50"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showGoalModal && (
        <div className="modal-overlay" onClick={() => setShowGoalModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Новая цель</h3>
            
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <label className="block text-sm text-gray-600 mb-1">Иконка</label>
                  <select
                    value={goalEmoji}
                    onChange={(e) => setGoalEmoji(e.target.value)}
                    className="input-field text-2xl p-2 w-16"
                  >
                    <option value="🎯">🎯</option>
                    <option value="🏠">🏠</option>
                    <option value="🚗">🚗</option>
                    <option value="✈️">✈️</option>
                    <option value="💻">💻</option>
                    <option value="📱">📱</option>
                    <option value="💍">💍</option>
                    <option value="🎓">🎓</option>
                    <option value="🏖">🏖</option>
                    <option value="💰">💰</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-600 mb-1">Название</label>
                  <input
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="На что копим?"
                    className="input-field"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">Целевая сумма</label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={(e) => setGoalAmount(e.target.value)}
                  placeholder="0"
                  className="input-field text-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-2">Цвет</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.slice(0, 8).map(color => (
                    <button
                      key={color}
                      onClick={() => setGoalColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        goalColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGoalModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium"
              >
                Отмена
              </button>
              <button
                onClick={handleAddGoal}
                disabled={!goalName || !goalAmount}
                className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-medium disabled:opacity-50"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
