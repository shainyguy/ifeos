import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SavingsGoal } from '../types';

type Tab = 'overview' | 'budget' | 'expenses' | 'goals';
type InputMode = 'percent' | 'amount';

interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  type: 'needs' | 'wants' | 'savings';
  percent: number;
  amount: number;
  spent: number;
  color: string;
}

export function Finance() {
  const { 
    financeSettings, 
    expenses, 
    savingsGoals, 
    addExpense, 
    addSavingsGoal, 
    updateSavingsGoal,
    updateFinanceSettings
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showModal, setShowModal] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('percent');
  
  // Основной доход
  const [monthlyIncome, setMonthlyIncome] = useState(financeSettings.monthlyIncome || 100000);
  
  // Правило 50/30/20 с категориями
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    // Необходимое (50%)
    { id: '1', name: 'Аренда/Ипотека', icon: '🏠', type: 'needs', percent: 25, amount: 0, spent: 0, color: '#3B82F6' },
    { id: '2', name: 'Коммунальные', icon: '💡', type: 'needs', percent: 5, amount: 0, spent: 0, color: '#60A5FA' },
    { id: '3', name: 'Продукты', icon: '🛒', type: 'needs', percent: 12, amount: 0, spent: 0, color: '#93C5FD' },
    { id: '4', name: 'Транспорт', icon: '🚗', type: 'needs', percent: 5, amount: 0, spent: 0, color: '#BFDBFE' },
    { id: '5', name: 'Связь/Интернет', icon: '📱', type: 'needs', percent: 3, amount: 0, spent: 0, color: '#DBEAFE' },
    // Желания (30%)
    { id: '6', name: 'Развлечения', icon: '🎬', type: 'wants', percent: 10, amount: 0, spent: 0, color: '#A855F7' },
    { id: '7', name: 'Кафе/Рестораны', icon: '🍕', type: 'wants', percent: 8, amount: 0, spent: 0, color: '#C084FC' },
    { id: '8', name: 'Одежда', icon: '👕', type: 'wants', percent: 5, amount: 0, spent: 0, color: '#D8B4FE' },
    { id: '9', name: 'Хобби', icon: '🎮', type: 'wants', percent: 4, amount: 0, spent: 0, color: '#E9D5FF' },
    { id: '10', name: 'Красота/Уход', icon: '💅', type: 'wants', percent: 3, amount: 0, spent: 0, color: '#F3E8FF' },
    // Сбережения (20%)
    { id: '11', name: 'Инвестиции', icon: '📈', type: 'savings', percent: 10, amount: 0, spent: 0, color: '#10B981' },
    { id: '12', name: 'Подушка безопасности', icon: '🛡️', type: 'savings', percent: 5, amount: 0, spent: 0, color: '#34D399' },
    { id: '13', name: 'Накопления', icon: '🎯', type: 'savings', percent: 5, amount: 0, spent: 0, color: '#6EE7B7' },
  ]);

  // Форма добавления расхода
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    amount: '',
    description: ''
  });

  // Форма добавления цели
  const [goalForm, setGoalForm] = useState({
    name: '',
    target: '',
    icon: '🎯'
  });

  // Форма добавления категории
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
    icon: '📦',
    type: 'wants' as 'needs' | 'wants' | 'savings',
    percent: 5
  });

  // Рассчитать суммы на основе процентов
  const categoriesWithAmounts = useMemo(() => {
    return budgetCategories.map(cat => ({
      ...cat,
      amount: Math.round((cat.percent / 100) * monthlyIncome)
    }));
  }, [budgetCategories, monthlyIncome]);

  // Обновить процент/сумму категории
  const updateCategory = (id: string, field: 'percent' | 'amount', value: number) => {
    setBudgetCategories(prev => prev.map(cat => {
      if (cat.id === id) {
        if (field === 'percent') {
          return { ...cat, percent: value };
        } else {
          const newPercent = Math.round((value / monthlyIncome) * 100 * 10) / 10;
          return { ...cat, percent: newPercent, amount: value };
        }
      }
      return cat;
    }));
  };

  // Сохранить доход
  const saveIncome = () => {
    updateFinanceSettings({ monthlyIncome });
    setShowModal(null);
  };

  // Добавить расход
  const handleAddExpense = () => {
    if (!expenseForm.category || !expenseForm.amount) return;
    
    const cat = categoriesWithAmounts.find(c => c.id === expenseForm.category);
    if (cat) {
      addExpense({
        categoryId: expenseForm.category,
        amount: parseFloat(expenseForm.amount),
        description: expenseForm.description || cat.name,
        date: new Date().toISOString()
      });
      
      setBudgetCategories(prev => prev.map(c => 
        c.id === expenseForm.category 
          ? { ...c, spent: c.spent + parseFloat(expenseForm.amount) }
          : c
      ));
    }
    
    setExpenseForm({ category: '', amount: '', description: '' });
    setShowModal(null);
  };

  // Добавить цель
  const handleAddGoal = () => {
    if (!goalForm.name || !goalForm.target) return;
    addSavingsGoal({
      name: goalForm.name,
      targetAmount: parseFloat(goalForm.target),
      emoji: goalForm.icon,
      color: '#3B82F6'
    });
    setGoalForm({ name: '', target: '', icon: '🎯' });
    setShowModal(null);
  };

  // Добавить категорию
  const handleAddCategory = () => {
    if (!newCategoryForm.name) return;
    const colors = {
      needs: '#3B82F6',
      wants: '#A855F7',
      savings: '#10B981'
    };
    setBudgetCategories(prev => [...prev, {
      id: Date.now().toString(),
      name: newCategoryForm.name,
      icon: newCategoryForm.icon,
      type: newCategoryForm.type,
      percent: newCategoryForm.percent,
      amount: 0,
      spent: 0,
      color: colors[newCategoryForm.type]
    }]);
    setNewCategoryForm({ name: '', icon: '📦', type: 'wants', percent: 5 });
    setShowModal(null);
  };

  // Удалить категорию
  const deleteCategory = (id: string) => {
    setBudgetCategories(prev => prev.filter(c => c.id !== id));
  };

  // Статистика по типам
  const needsTotal = categoriesWithAmounts.filter(c => c.type === 'needs').reduce((s, c) => s + c.percent, 0);
  const wantsTotal = categoriesWithAmounts.filter(c => c.type === 'wants').reduce((s, c) => s + c.percent, 0);
  const savingsTotal = categoriesWithAmounts.filter(c => c.type === 'savings').reduce((s, c) => s + c.percent, 0);
  const totalPercent = needsTotal + wantsTotal + savingsTotal;

  // Данные для круговой диаграммы
  const pieData = [
    { name: 'Необходимое', value: needsTotal, color: '#3B82F6' },
    { name: 'Желания', value: wantsTotal, color: '#A855F7' },
    { name: 'Сбережения', value: savingsTotal, color: '#10B981' },
  ];

  // Иконки для выбора
  const iconOptions = ['🎯', '🏠', '🚗', '✈️', '💻', '📱', '👕', '🎮', '📚', '💪', '🎁', '💍', '🏥', '🎓', '🐕', '🌴'];

  const tabs = [
    { id: 'overview', label: 'Обзор', icon: '📊' },
    { id: 'budget', label: 'Бюджет', icon: '💰' },
    { id: 'expenses', label: 'Расходы', icon: '💸' },
    { id: 'goals', label: 'Цели', icon: '🎯' },
  ];

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('ru-RU').format(amount);
  };

  // Подсчет расходов за текущий месяц
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return expenses.filter(e => {
      const expDate = new Date(e.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });
  }, [expenses]);

  const totalSpentThisMonth = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const remainingBudget = monthlyIncome - totalSpentThisMonth;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Финансы</h1>
            <p className="text-gray-500 text-sm mt-0.5">Правило 50/30/20</p>
          </div>
          <button
            onClick={() => setShowModal('income')}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium text-sm shadow-lg shadow-blue-500/25"
          >
            ✏️ Доход
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide bg-gray-50/80">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl whitespace-nowrap transition-all font-medium ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-lg shadow-gray-200/50'
                : 'bg-transparent text-gray-500'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="page-content bg-gray-50/50">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Income Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-6 text-white shadow-2xl shadow-blue-500/30">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative z-10">
                <p className="text-white/70 text-sm font-medium mb-1">Месячный доход</p>
                <p className="text-4xl font-bold mb-6">{formatMoney(monthlyIncome)} ₽</p>
                
                {/* 50/30/20 Visual */}
                <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-white/20 mb-4">
                  <div 
                    className="bg-blue-300 transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${needsTotal}%` }}
                  >
                    {needsTotal >= 15 && <span className="text-xs font-bold text-blue-900">{needsTotal}%</span>}
                  </div>
                  <div 
                    className="bg-purple-300 transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${wantsTotal}%` }}
                  >
                    {wantsTotal >= 15 && <span className="text-xs font-bold text-purple-900">{wantsTotal}%</span>}
                  </div>
                  <div 
                    className="bg-green-300 transition-all duration-500 flex items-center justify-center"
                    style={{ width: `${savingsTotal}%` }}
                  >
                    {savingsTotal >= 15 && <span className="text-xs font-bold text-green-900">{savingsTotal}%</span>}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
                    <div className="w-3 h-3 rounded-full bg-blue-300 mx-auto mb-2" />
                    <p className="text-white/70 text-xs">Нужды</p>
                    <p className="font-bold">{formatMoney(Math.round(monthlyIncome * needsTotal / 100))}</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
                    <div className="w-3 h-3 rounded-full bg-purple-300 mx-auto mb-2" />
                    <p className="text-white/70 text-xs">Желания</p>
                    <p className="font-bold">{formatMoney(Math.round(monthlyIncome * wantsTotal / 100))}</p>
                  </div>
                  <div className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
                    <div className="w-3 h-3 rounded-full bg-green-300 mx-auto mb-2" />
                    <p className="text-white/70 text-xs">Сбережения</p>
                    <p className="font-bold">{formatMoney(Math.round(monthlyIncome * savingsTotal / 100))}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-2xl mb-3">
                  💸
                </div>
                <p className="text-sm text-gray-500 mb-1">Потрачено</p>
                <p className="text-2xl font-bold text-gray-900">{formatMoney(totalSpentThisMonth)}</p>
                <p className="text-xs text-gray-400 mt-1">в этом месяце</p>
              </div>
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl mb-3">
                  💰
                </div>
                <p className="text-sm text-gray-500 mb-1">Остаток</p>
                <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {formatMoney(remainingBudget)}
                </p>
                <p className="text-xs text-gray-400 mt-1">до конца месяца</p>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Распределение бюджета</h3>
              <div className="flex items-center gap-6">
                <div className="w-40 h-40 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-4">
                  {pieData.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-gray-700 font-medium">{item.name}</span>
                        </div>
                        <span className="font-bold text-gray-900">{item.value}%</span>
                      </div>
                      <p className="text-sm text-gray-500 ml-5">
                        {formatMoney(Math.round(monthlyIncome * item.value / 100))} ₽
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Savings Goals Preview */}
            {savingsGoals.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">Цели накоплений</h3>
                  <button 
                    onClick={() => setActiveTab('goals')}
                    className="text-blue-500 text-sm font-medium"
                  >
                    Все →
                  </button>
                </div>
                <div className="space-y-4">
                  {savingsGoals.slice(0, 2).map((goal: SavingsGoal) => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    return (
                      <div key={goal.id}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="flex items-center gap-2">
                            <span className="text-xl">{goal.emoji}</span>
                            <span className="font-semibold text-gray-900">{goal.name}</span>
                          </span>
                          <span className="text-sm font-medium text-gray-600">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>{formatMoney(goal.currentAmount)} ₽</span>
                          <span>{formatMoney(goal.targetAmount)} ₽</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Budget Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-5">
            {/* Mode Toggle */}
            <div className="flex gap-2 p-1.5 bg-white rounded-2xl shadow-sm border border-gray-100">
              <button
                onClick={() => setInputMode('percent')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  inputMode === 'percent' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-500'
                }`}
              >
                В процентах %
              </button>
              <button
                onClick={() => setInputMode('amount')}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  inputMode === 'amount' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                    : 'text-gray-500'
                }`}
              >
                В рублях ₽
              </button>
            </div>

            {/* Warning if not 100% */}
            {totalPercent !== 100 && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                totalPercent > 100 
                  ? 'bg-red-50 border border-red-200' 
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                <span className="text-2xl">{totalPercent > 100 ? '⚠️' : '💡'}</span>
                <div>
                  <p className={`font-medium ${totalPercent > 100 ? 'text-red-700' : 'text-amber-700'}`}>
                    {totalPercent > 100 
                      ? `Превышение на ${totalPercent - 100}%`
                      : `Осталось распределить ${100 - totalPercent}%`
                    }
                  </p>
                  <p className={`text-sm ${totalPercent > 100 ? 'text-red-600' : 'text-amber-600'}`}>
                    {totalPercent > 100 
                      ? 'Уменьшите расходы в категориях'
                      : `Это ${formatMoney(Math.round(monthlyIncome * (100 - totalPercent) / 100))} ₽`
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Needs Section */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
                    🏠
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold">Необходимое</h3>
                    <p className="text-white/70 text-sm">Рекомендуется: 50%</p>
                  </div>
                </div>
                <div className="text-right text-white">
                  <p className="text-2xl font-bold">{needsTotal}%</p>
                  <p className="text-sm text-white/70">{formatMoney(Math.round(monthlyIncome * needsTotal / 100))} ₽</p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {categoriesWithAmounts.filter(c => c.type === 'needs').map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{cat.name}</p>
                      <p className="text-xs text-gray-500">
                        {inputMode === 'percent' 
                          ? `${formatMoney(cat.amount)} ₽` 
                          : `${cat.percent}%`
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={inputMode === 'percent' ? cat.percent : cat.amount}
                        onChange={(e) => updateCategory(
                          cat.id, 
                          inputMode === 'percent' ? 'percent' : 'amount',
                          parseFloat(e.target.value) || 0
                        )}
                        className="w-24 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-right font-semibold text-gray-900"
                      />
                      <span className="text-gray-400 text-sm w-4">
                        {inputMode === 'percent' ? '%' : '₽'}
                      </span>
                      <button 
                        onClick={() => deleteCategory(cat.id)}
                        className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wants Section */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
                    🎉
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold">Желания</h3>
                    <p className="text-white/70 text-sm">Рекомендуется: 30%</p>
                  </div>
                </div>
                <div className="text-right text-white">
                  <p className="text-2xl font-bold">{wantsTotal}%</p>
                  <p className="text-sm text-white/70">{formatMoney(Math.round(monthlyIncome * wantsTotal / 100))} ₽</p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {categoriesWithAmounts.filter(c => c.type === 'wants').map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{cat.name}</p>
                      <p className="text-xs text-gray-500">
                        {inputMode === 'percent' 
                          ? `${formatMoney(cat.amount)} ₽` 
                          : `${cat.percent}%`
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={inputMode === 'percent' ? cat.percent : cat.amount}
                        onChange={(e) => updateCategory(
                          cat.id, 
                          inputMode === 'percent' ? 'percent' : 'amount',
                          parseFloat(e.target.value) || 0
                        )}
                        className="w-24 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-right font-semibold text-gray-900"
                      />
                      <span className="text-gray-400 text-sm w-4">
                        {inputMode === 'percent' ? '%' : '₽'}
                      </span>
                      <button 
                        onClick={() => deleteCategory(cat.id)}
                        className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Savings Section */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
                    💰
                  </div>
                  <div className="text-white">
                    <h3 className="font-bold">Сбережения</h3>
                    <p className="text-white/70 text-sm">Рекомендуется: 20%</p>
                  </div>
                </div>
                <div className="text-right text-white">
                  <p className="text-2xl font-bold">{savingsTotal}%</p>
                  <p className="text-sm text-white/70">{formatMoney(Math.round(monthlyIncome * savingsTotal / 100))} ₽</p>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {categoriesWithAmounts.filter(c => c.type === 'savings').map(cat => (
                  <div key={cat.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{cat.name}</p>
                      <p className="text-xs text-gray-500">
                        {inputMode === 'percent' 
                          ? `${formatMoney(cat.amount)} ₽` 
                          : `${cat.percent}%`
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={inputMode === 'percent' ? cat.percent : cat.amount}
                        onChange={(e) => updateCategory(
                          cat.id, 
                          inputMode === 'percent' ? 'percent' : 'amount',
                          parseFloat(e.target.value) || 0
                        )}
                        className="w-24 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-right font-semibold text-gray-900"
                      />
                      <span className="text-gray-400 text-sm w-4">
                        {inputMode === 'percent' ? '%' : '₽'}
                      </span>
                      <button 
                        onClick={() => deleteCategory(cat.id)}
                        className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Category Button */}
            <button
              onClick={() => setShowModal('category')}
              className="w-full p-5 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-medium flex items-center justify-center gap-2 hover:border-blue-300 hover:text-blue-500 transition-all bg-white"
            >
              <span className="text-2xl">+</span>
              <span>Добавить категорию</span>
            </button>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Потрачено в этом месяце</p>
                  <p className="text-3xl font-bold text-gray-900">{formatMoney(totalSpentThisMonth)} ₽</p>
                </div>
                <div className={`px-4 py-2 rounded-xl font-medium ${
                  remainingBudget >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {remainingBudget >= 0 ? '+' : ''}{formatMoney(remainingBudget)} ₽
                </div>
              </div>
            </div>

            {/* Categories with spending */}
            <div className="space-y-3">
              {categoriesWithAmounts.filter(c => c.type !== 'savings').map(cat => {
                const spentPercent = cat.amount > 0 ? (cat.spent / cat.amount) * 100 : 0;
                const isOver = spentPercent > 100;
                return (
                  <div key={cat.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                          style={{ backgroundColor: `${cat.color}20` }}
                        >
                          {cat.icon}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{cat.name}</p>
                          <p className="text-sm text-gray-500">
                            Бюджет: {formatMoney(cat.amount)} ₽
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-bold ${isOver ? 'text-red-500' : 'text-gray-900'}`}>
                          {formatMoney(cat.spent)} ₽
                        </p>
                        <p className={`text-sm ${isOver ? 'text-red-400' : 'text-gray-500'}`}>
                          {Math.round(spentPercent)}% использовано
                        </p>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isOver 
                            ? 'bg-gradient-to-r from-red-400 to-red-500' 
                            : 'bg-gradient-to-r from-blue-400 to-purple-500'
                        }`}
                        style={{ width: `${Math.min(spentPercent, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                      <span>Потрачено</span>
                      <span>Осталось: {formatMoney(Math.max(cat.amount - cat.spent, 0))} ₽</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Expense FAB */}
            <button
              onClick={() => setShowModal('expense')}
              className="fixed bottom-24 right-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center text-white text-3xl active:scale-95 transition-transform z-50"
            >
              +
            </button>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-5">
            {/* Monthly Savings Info */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-2xl shadow-green-500/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
                    💰
                  </div>
                  <div>
                    <p className="text-white/70 text-sm">Ежемесячно на сбережения</p>
                    <p className="text-3xl font-bold">
                      {formatMoney(Math.round(monthlyIncome * savingsTotal / 100))} ₽
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: '3 мес', months: 3 },
                    { label: '6 мес', months: 6 },
                    { label: '1 год', months: 12 }
                  ].map(item => (
                    <div key={item.months} className="bg-white/15 backdrop-blur rounded-2xl p-3 text-center">
                      <p className="text-white/70 text-xs mb-1">{item.label}</p>
                      <p className="font-bold">
                        {formatMoney(Math.round(monthlyIncome * savingsTotal / 100 * item.months))} ₽
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Goals List */}
            <div className="space-y-4">
              {savingsGoals.map((goal: SavingsGoal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const monthlySavings = Math.round(monthlyIncome * savingsTotal / 100);
                const remaining = goal.targetAmount - goal.currentAmount;
                const monthsLeft = monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : 0;
                
                return (
                  <div key={goal.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl">
                          {goal.emoji}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{goal.name}</p>
                          <p className="text-sm text-gray-500">
                            {monthsLeft > 0 ? `≈ ${monthsLeft} мес до цели` : '🎉 Цель достигнута!'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-sm">
                        {Math.round(progress)}%
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Накоплено</span>
                        <span className="font-semibold text-gray-900">
                          {formatMoney(goal.currentAmount)} / {formatMoney(goal.targetAmount)} ₽
                        </span>
                      </div>
                      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {[1000, 5000, 10000].map(amount => (
                        <button
                          key={amount}
                          onClick={() => updateSavingsGoal(goal.id, amount)}
                          className="flex-1 py-3 bg-green-50 hover:bg-green-100 text-green-600 rounded-2xl font-semibold transition-colors"
                        >
                          +{amount >= 1000 ? `${amount/1000}к` : amount}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {savingsGoals.length === 0 && (
              <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="font-bold text-gray-900 text-xl mb-2">Нет целей накоплений</h3>
                <p className="text-gray-500 mb-6">
                  Добавьте финансовую цель и отслеживайте прогресс
                </p>
              </div>
            )}

            {/* Add Goal Button */}
            <button
              onClick={() => setShowModal('goal')}
              className="w-full p-5 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-medium flex items-center justify-center gap-2 hover:border-green-300 hover:text-green-500 transition-all bg-white"
            >
              <span className="text-2xl">+</span>
              <span>Добавить цель</span>
            </button>
          </div>
        )}
      </div>

      {/* Income Modal */}
      {showModal === 'income' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Месячный доход</h2>
              <button onClick={() => setShowModal(null)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Введите сумму дохода
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                    className="w-full px-6 py-5 text-3xl font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl text-center focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="100000"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-2xl">₽</span>
                </div>
              </div>

              <div className="p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Правило 50/30/20</p>
                    <p className="text-sm text-gray-600">
                      50% на необходимое, 30% на желания, 20% на сбережения. 
                      Настройте точные проценты на вкладке "Бюджет".
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={saveIncome}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-transform"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showModal === 'expense' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Новый расход</h2>
              <button onClick={() => setShowModal(null)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 font-medium focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Выберите категорию</option>
                  {categoriesWithAmounts.filter(c => c.type !== 'savings').map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Сумма</label>
                <div className="relative">
                  <input
                    type="number"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-4 text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl text-center focus:border-blue-500 focus:outline-none"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">₽</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none"
                  placeholder="Описание (необязательно)"
                />
              </div>

              <button
                onClick={handleAddExpense}
                disabled={!expenseForm.category || !expenseForm.amount}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
              >
                Добавить расход
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {showModal === 'goal' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Новая цель</h2>
              <button onClick={() => setShowModal(null)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Иконка</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setGoalForm(prev => ({ ...prev, icon }))}
                      className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                        goalForm.icon === icon
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-110 shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                <input
                  type="text"
                  value={goalForm.name}
                  onChange={(e) => setGoalForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none font-medium"
                  placeholder="Например: Новый iPhone"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Целевая сумма</label>
                <div className="relative">
                  <input
                    type="number"
                    value={goalForm.target}
                    onChange={(e) => setGoalForm(prev => ({ ...prev, target: e.target.value }))}
                    className="w-full px-4 py-4 text-2xl font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl text-center focus:border-blue-500 focus:outline-none"
                    placeholder="100000"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">₽</span>
                </div>
              </div>

              <button
                onClick={handleAddGoal}
                disabled={!goalForm.name || !goalForm.target}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
              >
                Создать цель
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showModal === 'category' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Новая категория</h2>
              <button onClick={() => setShowModal(null)} className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                ✕
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Иконка</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewCategoryForm(prev => ({ ...prev, icon }))}
                      className={`w-11 h-11 rounded-xl text-xl flex items-center justify-center transition-all ${
                        newCategoryForm.icon === icon
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-110 shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Название</label>
                <input
                  type="text"
                  value={newCategoryForm.name}
                  onChange={(e) => setNewCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none font-medium"
                  placeholder="Название категории"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Тип</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'needs', label: 'Нужды', bgFrom: '#3B82F6', bgTo: '#2563EB' },
                    { value: 'wants', label: 'Желания', bgFrom: '#A855F7', bgTo: '#9333EA' },
                    { value: 'savings', label: 'Сбережения', bgFrom: '#10B981', bgTo: '#059669' }
                  ].map(type => (
                    <button
                      key={type.value}
                      onClick={() => setNewCategoryForm(prev => ({ 
                        ...prev, 
                        type: type.value as 'needs' | 'wants' | 'savings' 
                      }))}
                      className={`py-3 rounded-xl font-medium transition-all ${
                        newCategoryForm.type === type.value
                          ? 'text-white shadow-lg'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={{
                        background: newCategoryForm.type === type.value 
                          ? `linear-gradient(to right, ${type.bgFrom}, ${type.bgTo})`
                          : undefined
                      }}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Процент от дохода
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newCategoryForm.percent}
                    onChange={(e) => setNewCategoryForm(prev => ({ 
                      ...prev, 
                      percent: parseFloat(e.target.value) || 0 
                    }))}
                    className="w-full px-4 py-4 text-xl font-bold bg-gray-50 border-2 border-gray-200 rounded-2xl text-center focus:border-blue-500 focus:outline-none"
                    placeholder="5"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">%</span>
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">
                  ≈ {formatMoney(Math.round(monthlyIncome * newCategoryForm.percent / 100))} ₽ в месяц
                </p>
              </div>

              <button
                onClick={handleAddCategory}
                disabled={!newCategoryForm.name}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
              >
                Добавить категорию
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
