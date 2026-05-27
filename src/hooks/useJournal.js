import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

export function useJournal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const insertEntry = async (entryData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('journal_entries')
        .insert([{ ...entryData, user_id: user.id }])
        .select();

      if (error) throw error;
      setEntries((prev) => [data[0], ...prev]);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // NEW: Update Function
  const updateEntry = async (id, updates) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setEntries((prev) => prev.map(e => e.id === id ? { ...e, ...updates } : e));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const deleteEntry = async (id) => {
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setEntries((prev) => prev.filter(e => e.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Make sure to export updateEntry!
  return { entries, loading, error, insertEntry, updateEntry, deleteEntry, refreshEntries: fetchEntries };
}