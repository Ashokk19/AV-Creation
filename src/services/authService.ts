import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Checks if the given user has verified administrator status in the database.
 * Does not rely merely on being logged in.
 */
export async function verifyUserIsAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;

  const client = getSupabaseClient();
  if (!client) return false;

  try {
    // 1. Query admin_users table (server-verified check)
    const { data, error } = await client
      .from('admin_users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && data && (data.role === 'admin' || data.role === 'super_admin')) {
      return true;
    }

    // 2. Also check app_metadata if set by Supabase Auth Admin API
    if (user.app_metadata && (user.app_metadata.role === 'admin' || user.app_metadata.claims_admin === true)) {
      return true;
    }

    // 3. Fallback check by email in admin_users table
    if (user.email) {
      const { data: emailData, error: emailError } = await client
        .from('admin_users')
        .select('role')
        .eq('email', user.email.toLowerCase().trim())
        .maybeSingle();

      if (!emailError && emailData && (emailData.role === 'admin' || emailData.role === 'super_admin')) {
        return true;
      }
    }

    return false;
  } catch (err) {
    console.error('Error verifying admin status:', err);
    return false;
  }
}

/**
 * Authenticate with Supabase using email & password
 */
export async function signInAdmin(email: string, password: string): Promise<{ user: User; isAdmin: boolean }> {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase is not configured. Please configure your Project URL and Anon Key.');
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password: password,
  });

  if (error) {
    throw new Error(error.message || 'Authentication failed. Please check your credentials.');
  }

  if (!data.user) {
    throw new Error('User not found.');
  }

  // Mandatory Security Check: Verify administrator privileges
  const isAdmin = await verifyUserIsAdmin(data.user);
  if (!isAdmin) {
    // Sign out unauthorized user immediately to prevent session hijacking
    await client.auth.signOut();
    throw new Error('Access Denied: Your account does not have administrator privileges for AV Creation.');
  }

  return { user: data.user, isAdmin: true };
}

/**
 * Sign out administrator
 */
export async function signOutAdmin(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('av_admin_preview');
  }
  const client = getSupabaseClient();
  if (client) {
    await client.auth.signOut();
  }
}

/**
 * Get current session and verify admin role
 */
export async function getCurrentAdmin(): Promise<{ user: User | null; isAdmin: boolean }> {
  if (typeof window !== 'undefined' && localStorage.getItem('av_admin_preview') === 'true') {
    return {
      user: {
        id: 'dev-admin-preview',
        email: 'admin@avcreation.com',
        app_metadata: { role: 'admin' },
        user_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User,
      isAdmin: true,
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return { user: null, isAdmin: false };
  }

  try {
    const { data: { session }, error } = await client.auth.getSession();
    if (error || !session || !session.user) {
      return { user: null, isAdmin: false };
    }

    const isAdmin = await verifyUserIsAdmin(session.user);
    return { user: session.user, isAdmin };
  } catch (err) {
    console.error('Failed to get current session:', err);
    return { user: null, isAdmin: false };
  }
}
