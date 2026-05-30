import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { User, KeyRound, ShieldCheck, AlertCircle, LogOut, DownloadCloud, Trash2, Settings, Save } from 'lucide-react';

export default function Profile() {
  const [userEmail, setUserEmail] = useState('');
  
  // Track both the current input AND the original saved name
  const [displayName, setDisplayName] = useState('');
  const [originalDisplayName, setOriginalDisplayName] = useState('');
  
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [profileStatus, setProfileStatus] = useState({ type: '', message: '' });
  const [actionStatus, setActionStatus] = useState({ type: '', message: '' }); 
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if the profile form actually has unsaved changes
  const hasProfileChanges = displayName !== originalDisplayName;

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        const name = user.user_metadata?.display_name || '';
        setDisplayName(name);
        setOriginalDisplayName(name); // Set the baseline to compare against
      }
    };
    getUserProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!hasProfileChanges) return; // Prevent empty submits
    
    setIsSubmitting(true);
    setProfileStatus({ type: '', message: '' });

    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
      if (error) throw error;
      
      // Update baseline so the button fades out again
      setOriginalDisplayName(displayName); 
      setProfileStatus({ type: 'success', message: 'Profile updated successfully!' });
      
      // Auto-hide the success message after 5 seconds
      setTimeout(() => {
        setProfileStatus({ type: '', message: '' });
      }, 5000);

    } catch (error) {
      setProfileStatus({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });
      if (error) throw error;
      
      setStatus({ type: 'success', message: 'Password updated successfully!' });
      setPasswords({ new: '', confirm: '' }); 

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setStatus({ type: '', message: '' });
      }, 5000);

    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportData = async () => {
    setIsSubmitting(true);
    setActionStatus({ type: '', message: '' });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user logged in.");

      const fetchTable = async (tableName) => {
        const { data } = await supabase.from(tableName).select('*').eq('user_id', user.id);
        return data || [];
      };

      const [rounds, shots, journal] = await Promise.all([
        fetchTable('rounds'),
        fetchTable('shots'),
        fetchTable('journal_entries').catch(() => []) 
      ]);

      const exportData = {
        export_date: new Date().toISOString(),
        account_email: user.email,
        display_name: displayName,
        data: { rounds, shots, journal_entries: journal }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `swingledger_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setActionStatus({ type: 'success', message: 'Your data has been successfully exported!' });

      // Auto-hide after 5 seconds
      setTimeout(() => {
        setActionStatus({ type: '', message: '' });
      }, 5000);

    } catch (err) {
      setActionStatus({ type: 'error', message: 'Failed to export data: ' + err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteData = async () => {
    if (!window.confirm("WARNING: This will permanently delete all your rounds, shots, and journal entries. This action CANNOT be undone. Are you absolutely sure you want to proceed?")) {
      return;
    }
    if (!window.confirm("Final Confirmation: Do you want to delete ALL your data and sign out?")) {
      return;
    }

    setIsSubmitting(true);
    setActionStatus({ type: '', message: '' });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      await Promise.all([
        supabase.from('rounds').delete().eq('user_id', user.id),
        supabase.from('shots').delete().eq('user_id', user.id),
        supabase.from('journal_entries').delete().eq('user_id', user.id).catch(() => {})
      ]);

      await supabase.auth.signOut();
    } catch (err) {
      setActionStatus({ type: 'error', message: 'Failed to delete data: ' + err.message });
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const inputClass = "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none p-3 md:p-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors";

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto w-full mb-16 md:mb-0">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-100">Account Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account settings and personal details.</p>
      </header>

      <div className="space-y-6">
        
        {/* Profile Section */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
            <User className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Public Profile</h2>
          </div>
          
          <div className="p-4 md:p-6">
            {profileStatus.message && (
              <div className={`p-4 mb-6 rounded-lg flex items-start gap-3 font-medium text-sm ${
                profileStatus.type === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-100' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
                {profileStatus.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <ShieldCheck className="w-5 h-5 shrink-0" />}
                <p>{profileStatus.message}</p>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="w-full space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Tiger Woods"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={inputClass}
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                <div className="text-slate-900 dark:text-slate-100 font-medium bg-slate-50 dark:bg-slate-900/50 p-3 md:p-4 rounded-lg border border-slate-100 dark:border-slate-700/50 cursor-not-allowed opacity-70">
                  {userEmail || 'Loading...'}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  *To change your email address, please contact support.
                </p>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={isSubmitting || !hasProfileChanges}
                  className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center md:justify-start gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
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
                  ? 'bg-red-50 text-red-700 border border-red-100' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
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
              className="w-full mt-4 p-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg font-bold rounded-lg transition-colors disabled:opacity-50 shadow-sm disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Account Actions Section */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm mt-8">
          <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
            <Settings className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Account Actions</h2>
          </div>
          
          <div className="p-4 md:p-6">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Manage your personal data or securely sign out of your account on this device.
            </p>

            {actionStatus.message && (
              <div className={`p-4 mb-6 rounded-lg flex items-start gap-3 font-medium text-sm ${
                actionStatus.type === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-100' 
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}>
                {actionStatus.type === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <ShieldCheck className="w-5 h-5 shrink-0" />}
                <p>{actionStatus.message}</p>
              </div>
            )}

            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={handleExportData}
                  disabled={isSubmitting}
                  className="w-full p-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <DownloadCloud className="w-5 h-5 text-slate-400" />
                  Export My Data
                </button>

                <button 
                  onClick={handleDeleteData}
                  disabled={isSubmitting}
                  className="w-full p-4 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-500 border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800/30 text-sm font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete All My Data
                </button>
              </div>

              <div className="pt-2">
                <button 
                  onClick={handleLogout}
                  disabled={isSubmitting}
                  className="w-full p-4 bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 border border-transparent text-lg font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5 text-slate-500" />
                  Sign Out
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}