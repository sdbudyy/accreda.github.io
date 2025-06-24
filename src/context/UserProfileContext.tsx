import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  account_type: 'eit' | 'supervisor';
  [key: string]: any;
}

interface UserProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setError('No authenticated user');
        setLoading(false);
        return;
      }
      // Try EIT profile first
      let { data: eitProfile } = await supabase
        .from('eit_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (!eitProfile) {
        // If not found, create it (for EITs)
        const { data: newProfile, error: upsertError } = await supabase
          .from('eit_profiles')
          .upsert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            account_type: 'eit',
          }, { onConflict: 'id' })
          .select('*')
          .single();
        if (upsertError) throw upsertError;
        eitProfile = newProfile;
      }
      if (eitProfile) {
        setProfile({ ...eitProfile, account_type: 'eit' });
        setLoading(false);
        return;
      }
      // Try supervisor profile
      const { data: supervisorProfile } = await supabase
        .from('supervisor_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (supervisorProfile) {
        setProfile({ ...supervisorProfile, account_type: 'supervisor' });
        setLoading(false);
        return;
      }
      setProfile(null);
      setError('No profile found');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch profile');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // Optionally, subscribe to auth changes and refresh profile
    // (not implemented here for brevity)
  }, []);

  return (
    <UserProfileContext.Provider value={{ profile, loading, error, refresh: fetchProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx) throw new Error('useUserProfile must be used within UserProfileProvider');
  return ctx;
}; 