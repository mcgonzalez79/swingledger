import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';

export function useRounds() {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRounds = useCallback(async () => {
    // ... (keep existing fetchRounds code)
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setRounds(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const insertRound = async (roundData) => {
    // ... (keep existing insertRound code)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('rounds')
        .insert([{ ...roundData, user_id: user.id }])
        .select();

      if (error) throw error;
      setRounds((prev) => [data[0], ...prev]);
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateRound = async (id, updates) => {
    // ... (keep existing updateRound code)
    try {
      const { error } = await supabase
        .from('rounds')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setRounds((prev) => prev.map(r => r.id === id ? { ...r, ...updates } : r));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  // NEW: Delete function
  const deleteRound = async (id) => {
    try {
      const { error } = await supabase
        .from('rounds')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Remove it from the local UI instantly
      setRounds((prev) => prev.filter(r => r.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  useEffect(() => {
    fetchRounds();
  }, [fetchRounds]);

  // Make sure to export deleteRound!
  return { rounds, loading, error, insertRound, updateRound, deleteRound, refreshRounds: fetchRounds };
}