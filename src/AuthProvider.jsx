import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. Initialize Supabase
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Create the Context
const AuthContext = createContext({
  session: null,
  user: null,
  profile: null, 
  loading: true,
  signInWithGoogle: () => {},
  signOut: () => {},
});

// 3. Create the Provider Component
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        // --- FIX 1 ---
        // Pass the session object directly
        fetchProfile(session); 
      } else {
        setLoading(false);
      }
    });

    // 4. Listen for auth changes (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user;
        setUser(currentUser ?? null);

        if (currentUser) {
          console.log('User found, fetching profile...');
          // --- FIX 2 ---
          // Pass the session object directly
          await fetchProfile(session);
        } else {
          console.log('No user, setting profile to null.');
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 5. Helper function to fetch our custom profile from Flask
  // --- FIX 3 ---
  // It now receives the full session object
  const fetchProfile = async (sessionData) => { 
    try {
      // --- FIX 4 ---
      // We don't need to call getSession() again.
      // Just use the session that was passed in.
      if (!sessionData || !sessionData.access_token) {
        throw new Error("No session or access token found.");
      }
      
      const token = sessionData.access_token;
      console.log('Got session token.'); 

      // Call your Flask backend's /api/users/me endpoint
      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log('Fetch response status:', response.status); 

      if (!response.ok) {
        throw new Error('Failed to fetch user profile from backend');
      }

      const userProfile = await response.json();
      console.log('Profile fetched:', userProfile); 
      setProfile(userProfile);
      
    } catch (error) {
      console.error('Error in fetchProfile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Auth functions
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error('Error signing in with Google:', error.message);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error.message);
  };

  // 7. Pass down the values
  const value = {
    session,
    user,
    profile, 
    loading,
    signInWithGoogle,
    signOut,
  };

  return (
    // --- FIX 5 (Likely Typo) ---
    // Make sure this says AuthContext, not Auth_Context
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 8. Create the custom hook that Login.jsx will use
export function useAuth() {
  return useContext(AuthContext);
}