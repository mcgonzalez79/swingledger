import React, { useState } from 'react';
import { supabase } from '../supabase';
import { theme, Logo } from '../theme';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setMessage('Success! Check your email to confirm your account.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Upon successful login, the onAuthStateChange listener in App.jsx handles the redirect automatically
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 transition-colors duration-300">
      
      <div className="w-full max-w-md">
        
        {/* THE FIX: The Logo is perfectly centered and scaled up to h-16 (mobile) and h-20 (desktop) */}
        <Logo className="justify-center mb-8 md:mb-10" imageClass="h-16 md:h-20" />

        <div className={theme.classes.card}>
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-slate-100">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm text-center font-medium">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 rounded-lg text-sm text-center font-medium">
              {message}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className={theme.classes.label}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={theme.classes.input}
                placeholder="golfer@example.com"
                required
              />
            </div>
            
            <div>
              <label className={theme.classes.label}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={theme.classes.input}
                placeholder="Enter your password"
                required
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading} 
              className={`mt-6 ${theme.classes.btnPrimary} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-800 pt-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold text-sm transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}