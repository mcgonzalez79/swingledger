import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart2, FlagTriangleRight, BookOpen, LogOut, Sun, Moon, User, Trophy } from 'lucide-react';
import { supabase } from './supabase';
import { theme, Logo } from './theme';

// Context
import { AchievementProvider } from './context/AchievementContext';

// Views & Components
import Login from './components/Login';
import Dashboard from './views/Dashboard';
import Scorecards from './views/Scorecards';
import Journal from './views/Journal';
import Profile from './views/Profile';
import UploadModal from './components/UploadModal';
import Insights from './views/Insights';
import Achievements from './views/Achievements';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/insights', label: 'Insights', icon: BarChart2 },
  { path: '/scorecards', label: 'Scorecards', icon: FlagTriangleRight },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/achievements', label: 'Trophy Room', icon: Trophy },
];

function Layout({ children, isDarkMode, toggleTheme }) {
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className={theme.classes.pageContainer}>
      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-10 flex justify-between items-center transition-colors duration-300">
        <Logo />
        <div className="flex items-center gap-2">
          <Link to="/profile" className={`p-2 transition-colors ${location.pathname === '/profile' ? 'text-emerald-600' : 'text-slate-500 dark:text-slate-400 hover:text-emerald-600'}`}>
            <User className="w-5 h-5" />
          </Link>
          <button onClick={toggleTheme} className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-colors">
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0 transition-colors duration-300 print:hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <Logo />
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  isActive 
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        {/* Settings & Account Section */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button onClick={toggleTheme} className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg font-medium transition-colors">
            {isDarkMode ? <Sun className="w-5 h-5 text-slate-400 dark:text-slate-500" /> : <Moon className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          
          <Link to="/profile" className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-lg font-medium transition-colors ${
              location.pathname === '/profile'
                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-500'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100'
            }`}>
            <User className={`w-5 h-5 ${location.pathname === '/profile' ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-500'}`} />
            Profile
          </Link>

          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-500 rounded-lg font-medium transition-colors">
            <LogOut className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-red-500" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 w-full relative">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 px-2 py-2 safe-area-pb transition-colors duration-300">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path} className={`flex flex-col items-center p-2 ${isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [dataRefreshTrigger, setDataRefreshTrigger] = useState(0);

  const baseRoute = import.meta.env.DEV ? '/' : '/swingledger/';

  useEffect(() => {
    const handleOpen = () => setIsUploadOpen(true);
    window.addEventListener('open-upload', handleOpen);
    return () => window.removeEventListener('open-upload', handleOpen);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      localStorage.setItem('theme', newTheme ? 'dark' : 'light');
      return newTheme;
    });
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-emerald-600">Loading...</div>;

  return (
    // THE FIX: BrowserRouter is now the absolute outermost wrapper
    <BrowserRouter basename={baseRoute}>
      <AchievementProvider>
        <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onDataChanged={() => setDataRefreshTrigger(prev => prev + 1)} />
        <Routes>
          <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/*" element={
            !session ? <Navigate to="/login" replace /> :
            <Layout isDarkMode={isDarkMode} toggleTheme={toggleTheme}>
              <Routes>
                <Route path="/" element={<Dashboard refreshTrigger={dataRefreshTrigger} />} />
                <Route path="/insights" element={<Insights />} />
                <Route path="/scorecards" element={<Scorecards />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/achievements" element={<Achievements />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </AchievementProvider>
    </BrowserRouter>
  );
}