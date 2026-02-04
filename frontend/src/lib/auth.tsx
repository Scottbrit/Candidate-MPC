import { createContext, useContext, useState, useLayoutEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

import { api } from './api-client';
import type { TokenPayload, User, LoginInput, UserRole } from '@/types/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  isAdmin: boolean;
  isCandidate: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'access_token';

// Helper functions
const getStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const setStoredToken = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Ignore storage errors
  }
};

const removeStoredToken = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage errors
  }
};

const parseTokenToUser = (token: string): User | null => {
  try {
    const payload = jwtDecode<TokenPayload>(token);
    
    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.user_metadata.role,
    };
  } catch {
    return null;
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = getStoredToken();
    return token ? parseTokenToUser(token) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data: LoginInput): Promise<void> => {
    setIsLoading(true);
    try {
      // api-client interceptor returns response.data, so response is the actual data
      const responseData = await api.post('/auth/login', data);
      const access_token = (responseData as any)?.access_token;
      
      if (!access_token) {
        throw new Error('No access token received');
      }

      const parsedUser = parseTokenToUser(access_token);
      if (!parsedUser) {
        throw new Error('Invalid token received');
      }

      setStoredToken(access_token);
      setUser(parsedUser);
    } catch (error) {
      removeStoredToken();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // This is used in useEffect in MagicLinkAuth.tsx, that's why we have to use useCallback.
  const loginWithToken = useCallback(async (token: string): Promise<void> => {
    setIsLoading(true);
    try {
      const parsedUser = parseTokenToUser(token);
      if (!parsedUser) {
        throw new Error('Invalid token provided');
      }

      setStoredToken(token);
      setUser(parsedUser);
    } catch (error) {
      removeStoredToken();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = (): void => {
    removeStoredToken();
    setUser(null);
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  const isAdmin = hasRole(['admin']);
  const isCandidate = hasRole(['candidate']);
  const isAuthenticated = !!user;

  // Set up axios interceptor for token injection
  useLayoutEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        const token = getStoredToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Clean up interceptor on unmount
    return () => {
      api.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  // Handle token expiration
  useLayoutEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithToken,
    logout,
    hasRole,
    isAdmin,
    isCandidate,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 