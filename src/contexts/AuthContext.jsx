import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { initLocalStorage, getItem, KEYS } from '../services/storage';
import { INITIAL_USER } from '../services/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    initLocalStorage();
    return getItem(KEYS.USER, INITIAL_USER);
  });
  const [session, setSession] = useState(null);
  const [isCloudConfigured, setIsCloudConfigured] = useState(isSupabaseConfigured());
  const [loading, setLoading] = useState(true);

  // Check initial Supabase session & user
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (isSupabaseConfigured() && supabase) {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          setSession(currentSession);
          if (currentSession?.user) {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          }
        }
      } catch (err) {
        console.warn('Supabase auth initialization error', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    if (isSupabaseConfigured() && supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } else if (event === 'SIGNED_OUT') {
          setUser(INITIAL_USER);
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
  }, []);

  const signIn = async (email, password) => {
    const loggedInUser = await authService.signIn(email, password);
    setUser(loggedInUser);
    const currSession = await authService.getSession();
    setSession(currSession);
    return loggedInUser;
  };

  const signUp = async (email, password, fullName) => {
    const signedUpUser = await authService.signUp(email, password, fullName);
    setUser(signedUpUser);
    const currSession = await authService.getSession();
    setSession(currSession);
    return signedUpUser;
  };

  const logout = async () => {
    const localUser = await authService.signOut();
    setUser(localUser);
    setSession(null);
    return localUser;
  };

  const updateProfile = async (updates) => {
    const updated = await authService.updateProfile(updates);
    setUser(updated);
    return updated;
  };

  const isLoggedInToCloud = Boolean(session?.user);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isCloudConfigured,
        isLoggedInToCloud,
        signIn,
        signUp,
        logout,
        updateProfile,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
