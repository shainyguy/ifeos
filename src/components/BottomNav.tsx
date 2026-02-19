import { motion } from 'framer-motion';
import { Page } from '@/types';

interface BottomNavProps {
  activeTab: Page;
  onTabChange: (tab: Page) => void;
}

const tabs: { id: Page; icon: string; label: string }[] = [
  { id: 'dashboard', icon: '🏠', label: 'Главная' },
  { id: 'habits', icon: '🎯', label: 'Привычки' },
  { id: 'tasks', icon: '✅', label: 'Задачи' },
  { id: 'finance', icon: '💰', label: 'Финансы' },
  { id: 'focus', icon: '⏱️', label: 'Фокус' },
  { id: 'wellness', icon: '🧘', label: 'Здоровье' },
  { id: 'stats', icon: '📊', label: 'Аналитика' },
  { id: 'profile', icon: '👤', label: 'Профиль' },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      <div className="mx-2 mb-2">
        <div className="nav-blur rounded-2xl shadow-lg border border-white/60 overflow-hidden">
          <div className="flex items-center justify-around px-1 py-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    // Haptic feedback
                    if ('vibrate' in navigator) {
                      navigator.vibrate(10);
                    }
                  }}
                  className={`relative flex flex-col items-center justify-center min-w-[44px] py-1 px-2 rounded-xl transition-all ${
                    isActive ? '' : 'opacity-60'
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                    />
                  )}
                  <span className="text-xl relative z-10">{tab.icon}</span>
                  <span
                    className={`text-[10px] mt-0.5 font-medium relative z-10 ${
                      isActive ? 'text-indigo-600' : 'text-gray-500'
                    }`}
                  >
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
