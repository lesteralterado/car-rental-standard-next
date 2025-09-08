'use client';
import { createContext, useState, useEffect } from "react";
import client from "@/api/client";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for demo user first
    const demoUser = localStorage.getItem('demo_user');
    if (demoUser) {
      try {
        const user = JSON.parse(demoUser);
        setUser(user);
        setLoading(false);
        return;
      } catch (err) {
        localStorage.removeItem('demo_user');
      }
    }

    client.auth.getSession().then(({ data }) => {
        setUser(data?.session?.user || null);
        setLoading(false)
    });

    const { data: listener } = client.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    }

    // const fetchUser = async () => {
    //   try {
    //     const response = await client.get('/auth/user');
    //     setUser(response.data);
    //   } catch (error) {
    //     console.error('Failed to fetch user:', error);
    //   } finally {
    //     setLoading(false);
    //   }
    // };

    // fetchUser();
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
        loading, 
        // login, 
        // logout 
      }}>
        {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };