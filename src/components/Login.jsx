import React, { useState } from 'react';
import { supabase } from '../supabase';
import { theme, Logo } from '../theme';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Check your email for the confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={theme.classes.pageContainer + " justify-center items-center px-4"}>
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="mb-8">
          <Logo />
        </div>

        <div className={theme.classes.card}>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 text-center">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className={theme.classes.label} htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={theme.classes.input}
                placeholder="golfer@example.com"
                required
              />
            </div>
            
            <div>
              <label className={theme.classes.label} htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={theme.classes.input}
                placeholder="••••••••"
                required
              />
            </div>

            {error && <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p>}
            {message && <p className="text-emerald-600 dark:text-emerald-400 text-sm text-center">{message}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className={theme.classes.btnPrimary}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
               isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-emerald-600 dark:text-emerald-400 font-medium text-sm hover:underline"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}