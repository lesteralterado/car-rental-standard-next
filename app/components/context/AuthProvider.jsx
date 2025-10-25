'use client';
import { createContext, useState, useEffect } from "react";
import client from "@/api/client";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      try {
        const user = JSON.parse(demoUser);
        setUser(user);
        // For demo user, create a mock profile with client role
        setProfile({
          id: user.id,
          role: 'client',
          full_name: user.user_metadata?.name || 'Demo User'
        });
        setLoading(false);
        return;
      } catch (err) {
        localStorage.removeItem('demo_user');
      }
    }

    const initializeAuth = async () => {
      const { data: { session } } = await client.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      }

      setLoading(false);
    };

    initializeAuth();

    const { data: listener } = client.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // const login = async (credentials) => {
  //   try {
  //     const response = await client.post('/auth/login', credentials);
  //     setUser(response.data);
  //   } catch (error) {
  //     console.error('Login failed:', error);
  //   }
  // };

  // const logout = async () => {
  //   try {
  //     await client.post('/auth/logout');
  //     setUser(null);
  //   } catch (error) {
  //     console.error('Logout failed:', error);
  //   }
  // };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
        // login,
        // logout
      }}>
        {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };