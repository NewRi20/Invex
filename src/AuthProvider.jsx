import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { API_BASE_URL } from './config';


const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


const AuthContext = createContext({
  session: null,
  user: null,
  profile: null, 
  loading: true,
  signInWithGoogle: () => {},
  signOut: () => {},
});


export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session); 
      } else {
        setLoading(false);
      }
    });

    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user;
        setUser(currentUser ?? null);

        if (currentUser) {
          console.log('User found, fetching profile...');
          await fetchProfile(session);
        } else {
          console.log('No user, setting profile to null.');
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  
  const fetchProfile = async (sessionData) => { 
    try {
      if (!sessionData || !sessionData.access_token) {
        throw new Error("No session or access token found.");
      }
      
      const token = sessionData.access_token;
      console.log('Got session token.'); 

      const response = await fetch(`${API_BASE_URL}/users/me`, {
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

  
  const value = {
    session,
    user,
    profile, 
    loading,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  return useContext(AuthContext);
}