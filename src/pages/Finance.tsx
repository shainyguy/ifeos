import { useState, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

type Tab = 'overview' | 'budget' | 'expenses' | 'income' | 'goals';
type InputMode = 'percent' | 'rubles';

const incomeTypes = [
  { value: 'salary', label: 'Зарплата', emoji: '💼' },
  { value: 'advance', label: 'Аванс', emoji: '💵' },
  { value: 'freelance', label: 'Фриланс', emoji: '💻' },
  { value: 'bonus', label: 'Премия', emoji: '🎁' },
  { value: 'transfer', label: 'Перевод', emoji: '📲' },
  { value: 'other', label: 'Другое', emoji: '💰' },
];

const categoryIcons = ['🏠', '💡', '🛒', '🚗', '📱', '🎬', '🍕', '👕', '🎮', '💅', '📈', '🛡️', '🎯', '✈️', '🏥', '📚', '🎁', '🐕', '💊', '🏋️'];

export default function Finance() {
  const [tab, setTab] = useState<Tab>('overview');
  const [inputMode, setInputMode] = useState<InputMode>('percent');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);

  // Для отслеживания редактируемого поля
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const {
    budgetCategories,
    incomeSources,
    savingsGoals,
    updateBudgetCategory,
    addBudgetCategory,
    deleteBudgetCategory,
    addBudgetExpense,
    addIncomeSource,
    updateIncomeSource,
    deleteIncomeSource,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
  } = useStore();

  // Расчёт общего дохода
  const totalIncome = incomeSources.filter(s => s.isMonthly).reduce((sum, s) => sum + s.amount, 0);
  const mainIncome = incomeSources.filter(s => s.type === 'salary' || s.type === 'advance').reduce((sum, s) => sum + s.amount, 0);
  const additionalIncome = totalIncome - mainIncome;

  // Расчёты по категориям
  const needsCategories = budgetCategories.filter(c => c.type === 'needs');
  const wantsCategories = budgetCategories.filter(c => c.type === 'wants');
  const savingsCategories = budgetCategories.filter(c => c.type === 'savings');

  const needsPercent = needsCategories.reduce((s, c) => s + c.percent, 0);
  const wantsPercent = wantsCategories.reduce((s, c) => s + c.percent, 0);
  const savingsPercent = savingsCategories.reduce((s, c) => s + c.percent, 0);
  const totalPercent = needsPercent + wantsPercent + savingsPercent;

  const needsAmount = Math.round(totalIncome * needsPercent / 100);
  const wantsAmount = Math.round(totalIncome * wantsPercent / 100);
  const savingsAmount = Math.round(totalIncome * savingsPercent / 100);

  const totalSpent = budgetCategories.reduce((s, c) => s + c.spent, 0);
  const remaining = totalIncome - totalSpent;

  // Form states
  const [expenseData, setExpenseData] = useState({ categoryId: '', amount: '', description: '' });
  const [goalData, setGoalData] = useState({ name: '', emoji: '🎯', targetAmount: '', color: '#3B82F6' });
  const [categoryData, setCategoryData] = useState({ name: '', icon: '📦', type: 'needs' as 'needs' | 'wants' | 'savings', percent: '' });
  const [incomeData, setIncomeData] = useState({ name: '', type: 'freelance' as string, amount: '', isMonthly: true });

  // Получить отображаемое значение для категории
  const getCategoryDisplayValue = (catId: string, percent: number) => {
    if (editingId === `cat_${catId}`) {
      return editValue;
    }
    if (inputMode === 'percent') {
      return percent.toFixed(1);
    }
    return Math.round(totalIncome * percent / 100).toString();
  };

  // Получить отображаемое значение для дохода
  const getIncomeDisplayValue = (incId: string, amount: number) => {
    if (editingId === `inc_${incId}`) {
      return editValue;
    }
    return amount.toString();
  };

  // Начать редактирование
  const startEditing = (id: string, currentValue: string) => {
    setEditingId(id);
    setEditValue(currentValue);
  };

  // Сохранить категорию
  const saveCategoryValue = (catId: string) => {
    const numVal = parseFloat(editValue) || 0;
    if (inputMode === 'percent') {
      updateBudgetCategory(catId, { percent: Math.min(100, Math.max(0, numVal)) });
    } else {
      const percent = totalIncome > 0 ? (numVal / totalIncome) * 100 : 0;
      updateBudgetCategory(catId, { percent: Math.min(100, Math.max(0, percent)) });
    }
    setEditingId(null);
    setEditValue('');
  };

  // Сохранить доход
  const saveIncomeValue = (incId: string) => {
    const numVal = parseFloat(editValue) || 0;
    updateIncomeSource(incId, { amount: numVal });
    setEditingId(null);
    setEditValue('');
  };

  const handleAddExpense = () => {
    if (!expenseData.categoryId || !expenseData.amount) return;
    addBudgetExpense(expenseData.categoryId, parseFloat(expenseData.amount) || 0);
    setExpenseData({ categoryId: '', amount: '', description: '' });
    setShowAddExpense(false);
  };

  const handleAddGoal = () => {
    if (!goalData.name || !goalData.targetAmount) return;
    addSavingsGoal({
      name: goalData.name,
      emoji: goalData.emoji,
      targetAmount: parseFloat(goalData.targetAmount) || 0,
      color: goalData.color,
    });
    setGoalData({ name: '', emoji: '🎯', targetAmount: '', color: '#3B82F6' });
    setShowAddGoal(false);
  };

  const handleAddCategory = () => {
    if (!categoryData.name || !categoryData.percent) return;
    addBudgetCategory({
      name: categoryData.name,
      icon: categoryData.icon,
      type: categoryData.type,
      percent: parseFloat(categoryData.percent) || 0,
      color: categoryData.type === 'needs' ? '#3B82F6' : categoryData.type === 'wants' ? '#A855F7' : '#10B981',
    });
    setCategoryData({ name: '', icon: '📦', type: 'needs', percent: '' });
    setShowAddCategory(false);
  };

  const handleAddIncome = () => {
    if (!incomeData.name || !incomeData.amount) return;
    const typeInfo = incomeTypes.find(t => t.value === incomeData.type);
    addIncomeSource({
      name: incomeData.name,
      emoji: typeInfo?.emoji || '💰',
      amount: parseFloat(incomeData.amount) || 0,
      type: incomeData.type as 'salary' | 'advance' | 'freelance' | 'bonus' | 'transfer' | 'other',
      isMonthly: incomeData.isMonthly,
      date: new Date().toISOString(),
    });
    setIncomeData({ name: '', type: 'freelance', amount: '', isMonthly: true });
    setShowAddIncome(false);
  };

  const pieData = [
    { name: 'Необходимое', value: needsPercent, color: '#3B82F6' },
    { name: 'Желания', value: wantsPercent, color: '#A855F7' },
    { name: 'Сбережения', value: savingsPercent, color: '#10B981' },
  ].filter(d => d.value > 0);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Обзор', icon: '📊' },
    { id: 'income', label: 'Доходы', icon: '💰' },
    { id: 'budget', label: 'Бюджет', icon: '📋' },
    { id: 'expenses', label: 'Расходы', icon: '💸' },
    { id: 'goals', label: 'Цели', icon: '🎯' },
  ];

  // Рендер инпута для категории бюджета
  const renderCategoryInput = (cat: typeof budgetCategories[0], colorClass: string) => {
    const fieldId = `cat_${cat.id}`;
    const isEditing = editingId === fieldId;

    return (
      <div key={cat.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
        <span className="text-xl w-8 text-center">{cat.icon}</span>
        <span className="flex-1 font-medium text-gray-800 text-sm truncate">{cat.name}</span>
        <div className="relative w-24">
          <input
            ref={el => { inputRefs.current[fieldId] = el; }}
            type="text"
            inputMode="decimal"
            value={isEditing ? editValue : getCategoryDisplayValue(cat.id, cat.percent)}
            onFocus={() => startEditing(fieldId, getCategoryDisplayValue(cat.id, cat.percent))}
            onChange={(e) => {
              const val = e.target.value.replace(/[^\d.]/g, '');
              setEditValue(val);
            }}
            onBlur={() => saveCategoryValue(cat.id)}
            className={`w-full bg-white border border-gray-200 rounded-lg px-2 py-2 text-right text-sm font-medium pr-6 focus:ring-2 ${colorClass} focus:border-transparent transition-all`}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">
            {inputMode === 'percent' ? '%' : '₽'}
          </span>
        </div>
        <button
          onClick={() => deleteBudgetCategory(cat.id)}
          className="text-red-400 hover:text-red-600 p-1 transition-colors"
        >
          ✕
        </button>
      </div>
    );
  };

  // Рендер инпута для дохода
  const renderIncomeInput = (source: typeof incomeSources[0], canDelete: boolean = true) => {
    const fieldId = `inc_${source.id}`;
    const isEditing = editingId === fieldId;

    return (
      <div key={source.id} className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{source.emoji}</span>
            <div>
              <span className="font-medium text-gray-900">{source.name}</span>
              {source.type !== 'salary' && source.type !== 'advance' && (
                <span className="ml-2 text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                  {source.isMonthly ? 'ежемесячно' : 'разово'}
                </span>
              )}
            </div>
          </div>
          {canDelete && source.type !== 'salary' && (
            <button
              onClick={() => deleteIncomeSource(source.id)}
              className="text-red-500 text-sm hover:text-red-600 transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        <div className="relative">
          <input
            ref={el => { inputRefs.current[fieldId] = el; }}
            type="text"
            inputMode="numeric"
            value={isEditing ? editValue : getIncomeDisplayValue(source.id, source.amount)}
            onFocus={() => startEditing(fieldId, source.amount.toString())}
            onChange={(e) => {
              const val = e.target.value.replace(/[^\d]/g, '');
              setEditValue(val);
            }}
            onBlur={() => saveIncomeValue(source.id)}
            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">₽</span>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="text-2xl font-bold text-gray-900">💰 Финансы</h1>
        <p className="text-gray-500 text-sm mt-1">Управляй деньгами мудро</p>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 bg-white border-b sticky top-0 z-10">
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="page-content">
        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="p-4 space-y-4">
            {/* Income Card */}
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl p-5 text-white shadow-xl">
              <p className="text-white/80 text-sm mb-1">Месячный доход</p>
              <p className="text-4xl font-bold mb-4">{totalIncome.toLocaleString('ru')} ₽</p>
              
              <div className="flex gap-3 text-sm">
                <div className="bg-white/20 backdrop-blur rounded-xl px-3 py-2 flex-1">
                  <p className="text-white/70 text-xs">Основной</p>
                  <p className="font-semibold">{mainIncome.toLocaleString('ru')} ₽</p>
                </div>
                {additionalIncome > 0 && (
                  <div className="bg-white/20 backdrop-blur rounded-xl px-3 py-2 flex-1">
                    <p className="text-white/70 text-xs">Дополнительный</p>
                    <p className="font-semibold">{additionalIncome.toLocaleString('ru')} ₽</p>
                  </div>
                )}
              </div>
            </div>

            {/* 50/30/20 Visual */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Правило 50/30/20</h3>
              
              <div className="flex rounded-xl overflow-hidden h-10 mb-4">
                <div 
                  className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                  style={{ width: `${Math.max(needsPercent, 5)}%` }}
                >
                  {needsPercent > 10 && `${needsPercent.toFixed(0)}%`}
                </div>
                <div 
                  className="bg-purple-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                  style={{ width: `${Math.max(wantsPercent, 5)}%` }}
                >
                  {wantsPercent > 10 && `${wantsPercent.toFixed(0)}%`}
                </div>
                <div 
                  className="bg-emerald-500 flex items-center justify-center text-white text-xs font-bold transition-all"
                  style={{ width: `${Math.max(savingsPercent, 5)}%` }}
                >
                  {savingsPercent > 10 && `${savingsPercent.toFixed(0)}%`}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-1"></div>
                  <p className="text-xs text-gray-500">Необходимое</p>
                  <p className="font-bold text-gray-900 text-sm">{needsAmount.toLocaleString('ru')} ₽</p>
                  <p className="text-xs text-blue-600">{needsPercent.toFixed(0)}% / 50%</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <div className="w-3 h-3 bg-purple-500 rounded-full mx-auto mb-1"></div>
                  <p className="text-xs text-gray-500">Желания</p>
                  <p className="font-bold text-gray-900 text-sm">{wantsAmount.toLocaleString('ru')} ₽</p>
                  <p className="text-xs text-purple-600">{wantsPercent.toFixed(0)}% / 30%</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-xl">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mx-auto mb-1"></div>
                  <p className="text-xs text-gray-500">Сбережения</p>
                  <p className="font-bold text-gray-900 text-sm">{savingsAmount.toLocaleString('ru')} ₽</p>
                  <p className="text-xs text-emerald-600">{savingsPercent.toFixed(0)}% / 20%</p>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Распределение</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-1.5 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Status */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Статус месяца</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-xs text-red-600 mb-1">Потрачено</p>
                  <p className="text-xl font-bold text-red-600">{totalSpent.toLocaleString('ru')} ₽</p>
                </div>
                <div className={`rounded-xl p-3 ${remaining >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                  <p className={`text-xs mb-1 ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>Осталось</p>
                  <p className={`text-xl font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {remaining.toLocaleString('ru')} ₽
                  </p>
                </div>
              </div>
            </div>

            {/* Goals Preview */}
            {savingsGoals.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Цели накоплений</h3>
                <div className="space-y-3">
                  {savingsGoals.slice(0, 2).map(goal => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                      <div key={goal.id} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{goal.emoji} {goal.name}</span>
                          <span className="text-sm text-gray-500">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, progress)}%`, backgroundColor: goal.color }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {goal.currentAmount.toLocaleString('ru')} / {goal.targetAmount.toLocaleString('ru')} ₽
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* INCOME TAB */}
        {tab === 'income' && (
          <div className="p-4 space-y-4">
            {/* Total Income */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-5 text-white">
              <p className="text-white/80 text-sm">Общий месячный доход</p>
              <p className="text-3xl font-bold">{totalIncome.toLocaleString('ru')} ₽</p>
            </div>

            {/* Main Income */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-lg">💼</span>
                Основной доход
              </h3>
              
              <div className="space-y-3">
                {incomeSources.filter(s => s.type === 'salary' || s.type === 'advance').map(source => (
                  renderIncomeInput(source, false)
                ))}
              </div>
              
              <p className="text-xs text-gray-500 mt-3 text-center">
                💡 Если нет аванса — оставьте 0
              </p>
            </div>

            {/* Additional Income */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-lg">💸</span>
                  Дополнительный доход
                </h3>
                <button
                  onClick={() => setShowAddIncome(true)}
                  className="bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors"
                >
                  + Добавить
                </button>
              </div>

              {incomeSources.filter(s => s.type !== 'salary' && s.type !== 'advance').length === 0 ? (
                <div className="text-center py-6 text-gray-400">
                  <p className="text-3xl mb-2">💰</p>
                  <p className="text-sm">Добавьте источники дохода</p>
                  <p className="text-xs mt-1">Фриланс, подработка, переводы...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {incomeSources.filter(s => s.type !== 'salary' && s.type !== 'advance').map(source => (
                    renderIncomeInput(source, true)
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BUDGET TAB */}
        {tab === 'budget' && (
          <div className="p-4 space-y-4">
            {/* Mode Toggle */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Режим ввода</h3>
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setInputMode('percent')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      inputMode === 'percent'
                        ? 'bg-white shadow text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    %
                  </button>
                  <button
                    onClick={() => setInputMode('rubles')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      inputMode === 'rubles'
                        ? 'bg-white shadow text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    ₽
                  </button>
                </div>
              </div>

              {/* Budget Status */}
              <div className={`rounded-xl p-3 ${
                Math.abs(totalPercent - 100) < 0.5
                  ? 'bg-emerald-50 border border-emerald-200'
                  : totalPercent > 100
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {Math.abs(totalPercent - 100) < 0.5
                      ? '✅ Бюджет сбалансирован'
                      : totalPercent > 100
                      ? '⚠️ Превышение бюджета'
                      : '💡 Не распределено'}
                  </span>
                  <span className="text-sm font-bold">{totalPercent.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Needs */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-lg">🏠</span>
                  <span className="font-semibold">Необходимое</span>
                </div>
                <span className="text-white/90 text-sm">{needsPercent.toFixed(0)}% • рек. 50%</span>
              </div>
              <div className="p-3 space-y-2">
                {needsCategories.map(cat => renderCategoryInput(cat, 'focus:ring-blue-500'))}
              </div>
            </div>

            {/* Wants */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-lg">🎉</span>
                  <span className="font-semibold">Желания</span>
                </div>
                <span className="text-white/90 text-sm">{wantsPercent.toFixed(0)}% • рек. 30%</span>
              </div>
              <div className="p-3 space-y-2">
                {wantsCategories.map(cat => renderCategoryInput(cat, 'focus:ring-purple-500'))}
              </div>
            </div>

            {/* Savings */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-lg">💰</span>
                  <span className="font-semibold">Сбережения</span>
                </div>
                <span className="text-white/90 text-sm">{savingsPercent.toFixed(0)}% • рек. 20%</span>
              </div>
              <div className="p-3 space-y-2">
                {savingsCategories.map(cat => renderCategoryInput(cat, 'focus:ring-emerald-500'))}
              </div>
            </div>

            {/* Add Category Button */}
            <button
              onClick={() => setShowAddCategory(true)}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl py-4 font-medium transition-colors"
            >
              + Добавить категорию
            </button>
          </div>
        )}

        {/* EXPENSES TAB */}
        {tab === 'expenses' && (
          <div className="p-4 space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl p-4 text-white">
                <p className="text-white/80 text-xs">Потрачено</p>
                <p className="text-2xl font-bold">{totalSpent.toLocaleString('ru')} ₽</p>
              </div>
              <div className={`rounded-2xl p-4 text-white ${remaining >= 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-red-600 to-red-700'}`}>
                <p className="text-white/80 text-xs">Осталось</p>
                <p className="text-2xl font-bold">{remaining.toLocaleString('ru')} ₽</p>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-2xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Расходы по категориям</h3>
              <div className="space-y-3">
                {budgetCategories.map(cat => {
                  const budget = Math.round(totalIncome * cat.percent / 100);
                  const progress = budget > 0 ? (cat.spent / budget) * 100 : 0;
                  const isOver = cat.spent > budget;
                  
                  return (
                    <div key={cat.id} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{cat.icon}</span>
                          <span className="font-medium text-gray-800 text-sm">{cat.name}</span>
                        </div>
                        <span className={`text-sm font-semibold ${isOver ? 'text-red-500' : 'text-gray-700'}`}>
                          {cat.spent.toLocaleString('ru')} / {budget.toLocaleString('ru')} ₽
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-emerald-500'}`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">{progress.toFixed(0)}% использовано</span>
                        {isOver && <span className="text-xs text-red-500">Перерасход!</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* FAB */}
            <button
              onClick={() => setShowAddExpense(true)}
              className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-40 hover:scale-105 transition-transform"
            >
              +
            </button>
          </div>
        )}

        {/* GOALS TAB */}
        {tab === 'goals' && (
          <div className="p-4 space-y-4">
            {/* Savings Potential */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-5 text-white">
              <p className="text-white/80 text-sm mb-1">Потенциал накоплений</p>
              <p className="text-3xl font-bold mb-3">{savingsAmount.toLocaleString('ru')} ₽/мес</p>
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="bg-white/20 backdrop-blur rounded-lg py-2">
                  <p className="text-white/70 text-xs">3 мес</p>
                  <p className="font-semibold">{(savingsAmount * 3).toLocaleString('ru')} ₽</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg py-2">
                  <p className="text-white/70 text-xs">6 мес</p>
                  <p className="font-semibold">{(savingsAmount * 6).toLocaleString('ru')} ₽</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-lg py-2">
                  <p className="text-white/70 text-xs">1 год</p>
                  <p className="font-semibold">{(savingsAmount * 12).toLocaleString('ru')} ₽</p>
                </div>
              </div>
            </div>

            {/* Goals List */}
            {savingsGoals.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <p className="text-4xl mb-3">🎯</p>
                <p className="text-gray-500">Добавьте цель накоплений</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savingsGoals.map(goal => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  const remainingAmount = goal.targetAmount - goal.currentAmount;
                  const monthsToGoal = savingsAmount > 0 ? Math.ceil(remainingAmount / savingsAmount) : Infinity;
                  
                  return (
                    <div key={goal.id} className="bg-white rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{goal.emoji}</span>
                          <div>
                            <p className="font-semibold text-gray-900">{goal.name}</p>
                            <p className="text-xs text-gray-500">
                              {monthsToGoal === Infinity ? '∞' : `~${monthsToGoal} мес до цели`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteSavingsGoal(goal.id)}
                          className="text-red-400 hover:text-red-600 p-1 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div 
                          className="h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, progress)}%`, backgroundColor: goal.color }}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-gray-500">
                          {goal.currentAmount.toLocaleString('ru')} / {goal.targetAmount.toLocaleString('ru')} ₽
                        </span>
                        <span className="font-semibold" style={{ color: goal.color }}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateSavingsGoal(goal.id, 1000)}
                          className="flex-1 bg-emerald-100 text-emerald-600 py-2 rounded-xl text-sm font-medium hover:bg-emerald-200 transition-colors"
                        >
                          +1к
                        </button>
                        <button
                          onClick={() => updateSavingsGoal(goal.id, 5000)}
                          className="flex-1 bg-emerald-100 text-emerald-600 py-2 rounded-xl text-sm font-medium hover:bg-emerald-200 transition-colors"
                        >
                          +5к
                        </button>
                        <button
                          onClick={() => updateSavingsGoal(goal.id, 10000)}
                          className="flex-1 bg-emerald-100 text-emerald-600 py-2 rounded-xl text-sm font-medium hover:bg-emerald-200 transition-colors"
                        >
                          +10к
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add Goal Button */}
            <button
              onClick={() => setShowAddGoal(true)}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl py-4 font-semibold hover:opacity-90 transition-opacity"
            >
              + Добавить цель
            </button>
          </div>
        )}
      </div>

      {/* MODALS */}
      
      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowAddExpense(false)}>
          <div className="bg-white rounded-t-3xl w-full p-6 animate-slide-up max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Добавить расход</h3>
              <button onClick={() => setShowAddExpense(false)} className="text-gray-400 text-2xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                <select
                  value={expenseData.categoryId}
                  onChange={(e) => setExpenseData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Выберите категорию</option>
                  {budgetCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Сумма</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={expenseData.amount}
                    onChange={(e) => setExpenseData(prev => ({ ...prev, amount: e.target.value.replace(/[^\d]/g, '') }))}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">₽</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Описание (опционально)</label>
                <input
                  type="text"
                  value={expenseData.description}
                  onChange={(e) => setExpenseData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="На что потратили?"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleAddExpense}
                disabled={!expenseData.categoryId || !expenseData.amount}
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl py-4 font-semibold disabled:opacity-50"
              >
                Добавить расход
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowAddGoal(false)}>
          <div className="bg-white rounded-t-3xl w-full p-6 animate-slide-up max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Новая цель</h3>
              <button onClick={() => setShowAddGoal(false)} className="text-gray-400 text-2xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                <input
                  type="text"
                  value={goalData.name}
                  onChange={(e) => setGoalData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Например: Отпуск"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Иконка</label>
                <div className="flex flex-wrap gap-2">
                  {['🎯', '🏖️', '🚗', '🏠', '💻', '📱', '✈️', '💍', '🎓', '💪'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setGoalData(prev => ({ ...prev, emoji }))}
                      className={`text-2xl p-2 rounded-xl transition-all ${goalData.emoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-100'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Целевая сумма</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={goalData.targetAmount}
                    onChange={(e) => setGoalData(prev => ({ ...prev, targetAmount: e.target.value.replace(/[^\d]/g, '') }))}
                    placeholder="100000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">₽</span>
                </div>
              </div>

              <button
                onClick={handleAddGoal}
                disabled={!goalData.name || !goalData.targetAmount}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl py-4 font-semibold disabled:opacity-50"
              >
                Создать цель
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowAddCategory(false)}>
          <div className="bg-white rounded-t-3xl w-full p-6 animate-slide-up max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Новая категория</h3>
              <button onClick={() => setShowAddCategory(false)} className="text-gray-400 text-2xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                <input
                  type="text"
                  value={categoryData.name}
                  onChange={(e) => setCategoryData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Например: Спортзал"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Иконка</label>
                <div className="flex flex-wrap gap-2">
                  {categoryIcons.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setCategoryData(prev => ({ ...prev, icon }))}
                      className={`text-2xl p-2 rounded-xl transition-all ${categoryData.icon === icon ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-gray-100'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Тип</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCategoryData(prev => ({ ...prev, type: 'needs' }))}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                      categoryData.type === 'needs'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Необходимое
                  </button>
                  <button
                    onClick={() => setCategoryData(prev => ({ ...prev, type: 'wants' }))}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                      categoryData.type === 'wants'
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Желания
                  </button>
                  <button
                    onClick={() => setCategoryData(prev => ({ ...prev, type: 'savings' }))}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                      categoryData.type === 'savings'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Сбережения
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Процент от дохода</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={categoryData.percent}
                    onChange={(e) => setCategoryData(prev => ({ ...prev, percent: e.target.value.replace(/[^\d.]/g, '') }))}
                    placeholder="5"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
                </div>
                {categoryData.percent && (
                  <p className="text-sm text-gray-500 mt-1">
                    ≈ {Math.round(totalIncome * (parseFloat(categoryData.percent) || 0) / 100).toLocaleString('ru')} ₽/мес
                  </p>
                )}
              </div>

              <button
                onClick={handleAddCategory}
                disabled={!categoryData.name || !categoryData.percent}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl py-4 font-semibold disabled:opacity-50"
              >
                Добавить категорию
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Income Modal */}
      {showAddIncome && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end" onClick={() => setShowAddIncome(false)}>
          <div className="bg-white rounded-t-3xl w-full p-6 animate-slide-up max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Добавить доход</h3>
              <button onClick={() => setShowAddIncome(false)} className="text-gray-400 text-2xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Тип дохода</label>
                <div className="grid grid-cols-2 gap-2">
                  {incomeTypes.filter(t => t.value !== 'salary' && t.value !== 'advance').map(t => (
                    <button
                      key={t.value}
                      onClick={() => setIncomeData(prev => ({ ...prev, type: t.value, name: t.label }))}
                      className={`py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                        incomeData.type === t.value
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span className="text-lg">{t.emoji}</span>
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                <input
                  type="text"
                  value={incomeData.name}
                  onChange={(e) => setIncomeData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Например: Проект на фрилансе"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Сумма</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={incomeData.amount}
                    onChange={(e) => setIncomeData(prev => ({ ...prev, amount: e.target.value.replace(/[^\d]/g, '') }))}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">₽</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Периодичность</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setIncomeData(prev => ({ ...prev, isMonthly: true }))}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                      incomeData.isMonthly
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Ежемесячно
                  </button>
                  <button
                    onClick={() => setIncomeData(prev => ({ ...prev, isMonthly: false }))}
                    className={`py-3 rounded-xl text-sm font-medium transition-all ${
                      !incomeData.isMonthly
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Разово
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddIncome}
                disabled={!incomeData.name || !incomeData.amount}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl py-4 font-semibold disabled:opacity-50"
              >
                Добавить доход
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
