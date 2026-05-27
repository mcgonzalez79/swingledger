import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { User, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';

export default function Profile() {
  const [userEmail, setUserEmail] = useState('');
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch the currently logged-in user's email when the page loads
  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email);
    };
    getUserProfile();
  }, []);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (passwords.new.length < 6) {
      return setStatus({ type: 'error', message: 'Password must be at least 6 characters long.' });
    }
    if (passwords.new !== passwords.confirm) {
      return setStatus({ type: 'error', message: 'Passwords do not match.' });
    }

    setIsSubmitting(true);

    try {
      // THE MAGIC: Supabase's built-in password update function
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      setStatus({ type: 'success', message: 'Password updated successfully!' });
      setPasswords({ new: '', confirm: '' }); // Clear the form
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none p-3 md:p-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors";

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto w-full">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Account Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account settings and security.</p>
      </header>

      <div className="space-y-6">
        
        {/* Account Details Section */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Account Details</h2>
          </div>
          <div className="p-4 md:p-6">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
            <div className="text-slate-900 dark:text-slate-100 font-medium bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
              {userEmail || 'Loading...'}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              *To change your email address, please contact support.
            </p>
          </div>
        </div>

        {/* Security & Password Section */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
            <KeyRound className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Change Password</h2>
          </div>
          
          <form onSubmit={handlePasswordUpdate} className="p-4 md:p-6 space-y-4">
            
            {status.message && (
              <div className={`p-4 rounded-lg flex items-start gap-3 font-medium text-sm ${
                status.type === 'error' 
                  ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-900/50' 
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50'
              }`}>
                {status.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <ShieldCheck className="w-5 h-5 shrink-0" />}
                <p>{status.message}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
              <input 
                type="password" 
                required
                placeholder="Enter new password"
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                className={inputClass}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm New Password</label>
              <input 
                type="password" 
                required
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                className={inputClass}
              />
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting || !passwords.new || !passwords.confirm}
              className="w-full mt-4 p-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}