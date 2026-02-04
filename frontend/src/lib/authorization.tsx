import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';

import { useAuth } from './auth';
import { paths } from '@/config/paths';
import type { UserRole } from '@/types/auth';

export const ROLES = {
  ADMIN: 'admin',
  CANDIDATE: 'candidate',
} as const;

export const useAuthorization = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    throw new Error('User is not authenticated');
  }

  const checkAccess = (allowedRoles: UserRole[]): boolean => {
    if (!user?.role) return false;
    return allowedRoles.includes(user.role);
  };

  return { 
    checkAccess, 
    role: user.role,
    isAdmin: user.role === 'admin',
    isCandidate: user.role === 'candidate'
  };
};

interface AuthorizationProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export const Authorization = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}: AuthorizationProps) => {
  const { checkAccess } = useAuthorization();
  const canAccess = checkAccess(allowedRoles);

  return <>{canAccess ? children : fallback}</>;
};

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles 
}: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    const redirectTo = location.pathname;
    return <Navigate to={paths.auth.login.getHref()} state={{ redirectTo }} replace />;
  }

  // Authenticated but no specific role requirements
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check role-based access
  if (!user?.role || !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    const redirectPath = user?.role === 'candidate' 
      ? paths.app.candidateSelection.getHref()
      : paths.app.dashboard.getHref();
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}; 