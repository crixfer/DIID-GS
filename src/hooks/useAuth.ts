import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface Teacher {
  id: string;
  authUserId: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchTeacherProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchTeacherProfile(session.user.id);
        } else {
          setTeacher(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchTeacherProfile = async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setTeacher({
          id: data.id,
          authUserId: data.auth_user_id,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name,
          createdAt: data.created_at
        });
      }
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Create teacher profile
        const { error: profileError } = await supabase
          .from('teachers')
          .insert({
            auth_user_id: data.user.id,
            email,
            first_name: firstName,
            last_name: lastName
          });

        if (profileError) throw profileError;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setTeacher(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (firstName: string, lastName: string) => {
    if (!teacher) throw new Error('No teacher profile found');

    try {
      const { error } = await supabase
        .from('teachers')
        .update({
          first_name: firstName,
          last_name: lastName
        })
        .eq('id', teacher.id);

      if (error) throw error;

      setTeacher({
        ...teacher,
        firstName,
        lastName
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  return {
    user,
    teacher,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };
}