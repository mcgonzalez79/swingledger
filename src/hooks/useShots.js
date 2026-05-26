import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

export function useShots(refreshTrigger = 0) {
  const [shots, setShots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShots = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError) throw authError;
        if (!session) throw new Error("No active session");

        const { data, error: fetchError } = await supabase
          .from('shots')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setShots(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShots();
  }, [refreshTrigger]); // Will re-run whenever refreshTrigger changes!

  return { shots, loading, error };
}