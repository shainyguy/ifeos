import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Page } from '@/types';
import BottomNav from '@/components/BottomNav';
import Dashboard from '@/pages/Dashboard';
import Habits from '@/pages/Habits';
import Tasks from '@/pages/Tasks';
import Finance from '@/pages/Finance';
import Focus from '@/pages/Focus';
import Wellness from '@/pages/Wellness';
import Stats from '@/pages/Stats';
import Profile from '@/pages/Profile';

function App() {
  const [activeTab, setActiveTab] = useState<Page>('dashboard');
  const { refreshQuote, checkAchievements } = useStore();

  useEffect(() => {
    refreshQuote();
    checkAchievements();
  }, [refreshQuote, checkAchievements]);

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'habits':
        return <Habits />;
      case 'tasks':
        return <Tasks />;
      case 'finance':
        return <Finance />;
      case 'focus':
        return <Focus />;
      case 'wellness':
        return <Wellness />;
      case 'stats':
        return <Stats />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AnimatePresence mode="wait">
        <motion.main
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="pb-24"
        >
          {renderPage()}
        </motion.main>
      </AnimatePresence>
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
