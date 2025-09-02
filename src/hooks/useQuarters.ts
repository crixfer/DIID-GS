import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Quarter } from '../types';
import { useAuth } from './useAuth';

export function useQuarters() {
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [activeQuarter, setActiveQuarter] = useState<Quarter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { teacher } = useAuth();

  useEffect(() => {
    if (teacher) {
      fetchQuarters();
    } else {
      setQuarters([]);
      setActiveQuarter(null);
      setLoading(false);
    }
  }, [teacher]);

  const fetchQuarters = async () => {
    if (!teacher) return;
    
    try {
      setLoading(true);
      
      // Check if Supabase is configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('quarters')
        .select('*')
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedQuarters: Quarter[] = data.map(q => ({
        id: q.id,
        name: q.name,
        startDate: q.start_date,
        endDate: q.end_date,
        status: q.status,
        createdAt: q.created_at
      }));

      setQuarters(formattedQuarters);
      
      // Set active quarter
      const active = formattedQuarters.find(q => q.status === 'active');
      setActiveQuarter(active || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quarters');
    } finally {
      setLoading(false);
    }
  };

  const createQuarter = async (quarterData: Omit<Quarter, 'id' | 'createdAt'>) => {
    if (!teacher) throw new Error('No teacher logged in');
    
    try {
      // If creating an active quarter, deactivate others
      if (quarterData.status === 'active') {
        await supabase
          .from('quarters')
          .update({ status: 'completed' })
          .eq('status', 'active')
          .eq('teacher_id', teacher.id);
      }

      const { data, error } = await supabase
        .from('quarters')
        .insert({
          teacher_id: teacher.id,
          name: quarterData.name,
          start_date: quarterData.startDate,
          end_date: quarterData.endDate,
          status: quarterData.status
        })
        .select()
        .single();

      if (error) throw error;

      await fetchQuarters();
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to create quarter');
    }
  };

  const updateQuarter = async (id: string, updates: Partial<Quarter>) => {
    if (!teacher) throw new Error('No teacher logged in');
    
    try {
      // If setting as active, deactivate others
      if (updates.status === 'active') {
        await supabase
          .from('quarters')
          .update({ status: 'completed' })
          .eq('status', 'active')
          .eq('teacher_id', teacher.id)
          .neq('id', id);
      }

      const { error } = await supabase
        .from('quarters')
        .update({
          name: updates.name,
          start_date: updates.startDate,
          end_date: updates.endDate,
          status: updates.status
        })
        .eq('id', id);

      if (error) throw error;

      await fetchQuarters();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update quarter');
    }
  };

  const deleteQuarter = async (id: string) => {
    if (!teacher) throw new Error('No teacher logged in');
    
    try {
      const { error } = await supabase
        .from('quarters')
        .delete()
        .eq('id', id)
        .eq('teacher_id', teacher.id);

      if (error) throw error;

      await fetchQuarters();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete quarter');
    }
  };

  return {
    quarters,
    activeQuarter,
    loading,
    error,
    createQuarter,
    updateQuarter,
    deleteQuarter,
    refetch: fetchQuarters
  };
}