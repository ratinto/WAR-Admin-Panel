import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { LoginCredentials } from '@/types';
import { api } from '@/services/api';

interface User {
  username: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('adminUser');
    const token = localStorage.getItem('adminToken');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('AuthContext: Calling API login');
      const response = await api.adminLogin(credentials);
      console.log('AuthContext: API response:', response);
      
      if (response.success && response.data) {
        const userData: User = {
          username: response.data.username || credentials.username,
          name: response.data.name,
        };
        
        console.log('AuthContext: Setting user data:', userData);
        setUser(userData);
        localStorage.setItem('adminUser', JSON.stringify(userData));
        // Store a dummy token for now (until we implement JWT in backend)
        localStorage.setItem('adminToken', 'admin-session-' + Date.now());
        console.log('AuthContext: Login successful');
      } else {
        console.error('AuthContext: Login failed -', response.message);
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
