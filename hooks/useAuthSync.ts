
import { useEffect } from 'react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { useAppStore } from '../store';

export const useAuthSync = () => {
  useEffect(() => {
    const { signIn, signOut, setAuthReady } = useAppStore.getState();

    const client = getSupabaseClient();

    if (!isSupabaseConfigured || !client) {
      signOut();
      setAuthReady(true);
      return;
    }

    // A stalled session refresh must not leave the public login screen unreachable.
    const sessionTimeout = window.setTimeout(() => {
      setAuthReady(true);
    }, 8000);

    // 1. Check initial session and mark auth as ready
    client.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) {
        signIn(u.email || "user", u.user_metadata?.name || u.user_metadata?.full_name);
      } else {
        signOut();
      }
      window.clearTimeout(sessionTimeout);
      setAuthReady(true);
    }).catch(err => {
      console.error("Session check failed", err);
      window.clearTimeout(sessionTimeout);
      signOut(); // Sign out on error as well
      setAuthReady(true); // Ensure app is not stuck in loading state
    });

    // 2. Subscribe to auth changes
    const { data: authListener } = client.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u) {
        signIn(u.email || "user", u.user_metadata?.name || u.user_metadata?.full_name);
      } else {
        signOut();
      }
      // This is redundant if getSession is guaranteed to fire first, 
      // but safe to have. The store setter is idempotent.
      setAuthReady(true); 
    });

    // 3. Cleanup to prevent memory leaks
    return () => {
      window.clearTimeout(sessionTimeout);
      authListener.subscription.unsubscribe();
    };
  }, []); // Empty array because we use getState, fires only once on mount
};
