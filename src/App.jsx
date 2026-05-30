import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart2, FlagTriangleRight, BookOpen, Sun, Moon, User, Trophy, Target } from 'lucide-react'; 
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
import Goals from './views/Goals';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/insights', label: 'Insights', icon: BarChart2 },
  { path: '/scorecards', label: 'Scorecards', icon: FlagTriangleRight },
  { path: '/journal', label: 'Journal', icon: BookOpen },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/achievements', label: 'Trophy Room', icon: Trophy },
];

// Added displayName prop to Layout
function Layout({ children, isDarkMode, toggleTheme, displayName }) {
  const location = useLocation();

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
        
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
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
            {displayName || 'Profile'}
          </Link>
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
  const [displayName, setDisplayName] = useState(''); // NEW: Profile name state

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

  // NEW: Robust Auth and Profile Fetching
  useEffect(() => {
    const fetchDisplayName = async (user) => {
      if (!user) return;
      
      // 1. Try to fetch from a 'profiles' table if you have one
      const { data } = await supabase.from('profiles').select('display_name, full_name').eq('id', user.id).single();
      
      if (data?.display_name) {
        setDisplayName(data.display_name);
      } else if (data?.full_name) {
        setDisplayName(data.full_name);
      // 2. Fallback to Supabase auth metadata if profiles table doesn't exist/have it
      } else if (user.user_metadata?.display_name) {
        setDisplayName(user.user_metadata.display_name);
      } else if (user.user_metadata?.full_name) {
        setDisplayName(user.user_metadata.full_name);
      }
    };

    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) await fetchDisplayName(session.user);
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      if (session?.user) fetchDisplayName(session.user);
    });

    // Custom listener: so you can update the sidebar from the Profile.jsx page
    const handleProfileUpdate = () => {
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) fetchDisplayName(user);
      });
    };
    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-emerald-600">Loading...</div>;

  return (
    <BrowserRouter basename={baseRoute}>
      <AchievementProvider>
        <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} onDataChanged={() => setDataRefreshTrigger(prev => prev + 1)} />
        <Routes>
          <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/*" element={
            !session ? <Navigate to="/login" replace /> :
            <Layout isDarkMode={isDarkMode} toggleTheme={toggleTheme} displayName={displayName}>
              <Routes>
                <Route path="/" element={<Dashboard refreshTrigger={dataRefreshTrigger} />} />
                <Route path="/insights" element={<Insights refreshTrigger={dataRefreshTrigger} />} />
                <Route path="/goals" element={<Goals />} />
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