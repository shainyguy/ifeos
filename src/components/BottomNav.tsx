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
  { id: 'finance', icon: '💰', label: 'Деньги' },
  { id: 'focus', icon: '⏱️', label: 'Фокус' },
  { id: 'wellness', icon: '🧘', label: 'Здоровье' },
  { id: 'stats', icon: '📊', label: 'Статы' },
  { id: 'profile', icon: '👤', label: 'Я' },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      <div className="nav-blur rounded-2xl">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => {
                  onTabChange(tab.id);
                  if ('vibrate' in navigator) {
                    navigator.vibrate(5);
                  }
                }}
                className="relative flex flex-col items-center justify-center min-w-[40px] py-1 rounded-xl"
                whileTap={{ scale: 0.9 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute -top-1 w-6 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                  />
                )}
                <span className={`text-lg transition-transform ${isActive ? 'scale-110' : ''}`}>
                  {tab.icon}
                </span>
                <span className={`text-[9px] mt-0.5 font-medium ${
                  isActive ? 'text-indigo-600' : 'text-gray-400'
                }`}>
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
