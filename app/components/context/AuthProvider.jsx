'use client';
import { createContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

/**
 * @typedef {Object} AuthContextValue
 * @property {null|Object} user
 * @property {null|Object} profile
 * @property {boolean} loading
 * @property {boolean} isAdmin
 * @property {function(Object): Promise<Object>} login
 * @property {function(): Promise<void>} logout
 */

/** @type {import('react').Context<AuthContextValue|null>} */
const AuthContext = createContext(null);

// Add a type definition for the auth context
/**
 * @typedef {Object} AuthContextValue
 * @property {null|Object} user
 * @property {null|Object} profile
 * @property {boolean} loading
 * @property {boolean} isAdmin
 * @property {function} login
 * @property {function} logout
 */

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use ref to avoid stale closure in auth state change handler
  const profileRef = useRef(null);
  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
      setProfile(data.user);
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Sign out from Supabase if available
      if (supabase) {
        await supabase.auth.signOut();
      }
      localStorage.removeItem('token');
      localStorage.removeItem('demo_user');
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
  };

  const createOAuthProfile = async (supabaseUser) => {
    try {
      // For OAuth users, we don't use password-based authentication
      // Instead, we create a profile directly using the OAuth user's info
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: supabaseUser.email,
          oauth_provider: supabaseUser.app_metadata?.provider || 'unknown',
          oauthId: supabaseUser.id,
          full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'OAuth User',
          isOAuth: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem('token', data.token);
          return data.user;
        }
      }
    } catch (error) {
      console.error('Failed to create OAuth profile:', error);
    }
    return null;
  };

  useEffect(() => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      try {
        const user = JSON.parse(demoUser);
        setUser(user);
        // For demo user, create a mock profile with the correct role
        setProfile({
          id: user.id,
          role: user.role || 'client',
          full_name: user.user_metadata?.name || 'Demo User'
        });
        setLoading(false);
        return;
      } catch (err) {
        localStorage.removeItem('demo_user');
      }
    }

    // Check for Supabase OAuth session
    const initializeAuth = async () => {
      if (supabase) {
        try {
          // Check for existing session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (session) {
            // Get the user from the session
            const { data: { user: supabaseUser } } = await supabase.auth.getUser();
            
            if (supabaseUser) {
              // First check if we have a token stored (from OAuth callback)
              const token = localStorage.getItem('token');
              if (token) {
                // Try to fetch profile from database using the token
                const userProfile = await fetchProfile();
                if (userProfile) {
                  setUser(userProfile);
                  setProfile(userProfile);
                  setLoading(false);
                  return;
                }
              }
              
              // If no token or profile fetch failed, try to create a profile for OAuth user
              const dbProfile = await createOAuthProfile(supabaseUser);
              if (dbProfile) {
                setUser(dbProfile);
                setProfile(dbProfile);
                setLoading(false);
                return;
              }
              
              // Fallback to local profile from Supabase metadata
              const oauthProfile = {
                id: supabaseUser.id,
                email: supabaseUser.email,
                full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'OAuth User',
                role: 'client',
                phone: supabaseUser.user_metadata?.phone || null
              };
              setUser(oauthProfile);
              setProfile(oauthProfile);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error('Error checking Supabase session:', err);
        }
      }

      // Fall back to token-based auth
      const token = localStorage.getItem('token');
      if (token) {
        const userProfile = await fetchProfile();
        if (userProfile) {
          setUser(userProfile);
          setProfile(userProfile);
        } else {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // Set up Supabase auth state listener
    let subscription = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          if (event === 'SIGNED_IN' && session) {
            const { data: { user: supabaseUser } } = await supabase.auth.getUser();
            if (supabaseUser) {
              // Try to create profile and get token
              const dbProfile = await createOAuthProfile(supabaseUser);
              if (dbProfile) {
                setUser(dbProfile);
                setProfile(dbProfile);
              } else {
                const oauthProfile = {
                  id: supabaseUser.id,
                  email: supabaseUser.email,
                  full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'OAuth User',
                  role: 'client',
                  phone: supabaseUser.user_metadata?.phone || null
                };
                setUser(oauthProfile);
                setProfile(oauthProfile);
              }
            }
          } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem('token');
            localStorage.removeItem('demo_user');
            setUser(null);
            setProfile(null);
          } else if (event === 'TOKEN_REFRESHED') {
            // Handle token refresh - try to maintain user session
            const token = localStorage.getItem('token');
            if (token) {
              const userProfile = await fetchProfile();
              if (userProfile) {
                setUser(userProfile);
                setProfile(userProfile);
              }
            }
          } else if (event === 'USER_UPDATED') {
            // Handle user metadata updates
            const { data: { user: supabaseUser } } = await supabase.auth.getUser();
            if (supabaseUser) {
              const updatedProfile = {
                id: supabaseUser.id,
                email: supabaseUser.email,
                full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'User',
                role: profileRef.current?.role || 'client',
                phone: supabaseUser.user_metadata?.phone || null
              };
              setUser(updatedProfile);
              setProfile(updatedProfile);
            }
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          // Don't clear user state on error - keep existing session
        }
      });
      subscription = data.subscription;
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
        login,
        logout
      }}>
        {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };