import { supabase } from '../lib/supabase';

export interface TermsAcceptance {
  id: string;
  user_id: string;
  terms_version: string;
  accepted_at: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Record that a user has accepted the terms and conditions
 * @param userId - The user's ID
 * @param termsVersion - Version of the terms (default: '1.0')
 * @param ipAddress - Optional IP address of the user
 * @param userAgent - Optional user agent string
 * @returns Promise<{ data: TermsAcceptance | null, error: any }>
 */
export const recordTermsAcceptance = async (
  userId: string,
  termsVersion: string = '1.0',
  ipAddress?: string,
  userAgent?: string
): Promise<{ data: TermsAcceptance | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('terms_acceptance')
      .insert([
        {
          user_id: userId,
          terms_version: termsVersion,
          ip_address: ipAddress,
          user_agent: userAgent,
        }
      ])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Check if a user has accepted the terms and conditions
 * @param userId - The user's ID
 * @param termsVersion - Version of the terms to check (default: '1.0')
 * @returns Promise<{ data: TermsAcceptance | null, error: any }>
 */
export const checkTermsAcceptance = async (
  userId: string,
  termsVersion: string = '1.0'
): Promise<{ data: TermsAcceptance | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('terms_acceptance')
      .select('*')
      .eq('user_id', userId)
      .eq('terms_version', termsVersion)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get all terms acceptance records for a user
 * @param userId - The user's ID
 * @returns Promise<{ data: TermsAcceptance[] | null, error: any }>
 */
export const getUserTermsAcceptance = async (
  userId: string
): Promise<{ data: TermsAcceptance[] | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('terms_acceptance')
      .select('*')
      .eq('user_id', userId)
      .order('accepted_at', { ascending: false });

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get the latest terms acceptance for a user
 * @param userId - The user's ID
 * @returns Promise<{ data: TermsAcceptance | null, error: any }>
 */
export const getLatestTermsAcceptance = async (
  userId: string
): Promise<{ data: TermsAcceptance | null, error: any }> => {
  try {
    const { data, error } = await supabase
      .from('terms_acceptance')
      .select('*')
      .eq('user_id', userId)
      .order('accepted_at', { ascending: false })
      .limit(1)
      .single();

    return { data, error };
  } catch (error) {
    return { data: null, error };
  }
};

/**
 * Get client IP address (basic implementation)
 * Note: This is a simplified version. In production, you might want to use a more robust solution
 * @returns string | undefined
 */
export const getClientIP = (): string | undefined => {
  // This is a placeholder. In a real application, you'd get this from your server
  // For now, we'll return undefined and let the server handle IP detection
  return undefined;
};

/**
 * Get user agent string
 * @returns string | undefined
 */
export const getUserAgent = (): string | undefined => {
  if (typeof window !== 'undefined') {
    return window.navigator.userAgent;
  }
  return undefined;
}; 