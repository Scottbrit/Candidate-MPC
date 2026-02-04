import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/lib/auth';
import { paths } from '@/config/paths';

export default function MagicLinkAuth() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();

  // Read URL parameters only once and memoize them
  const access_token = useMemo(() => {
    const hashParams = new URLSearchParams(
      window.location.hash.substring(1) // Remove '#' character
    );
    return hashParams.get('access_token');
  }, []);

  useEffect(() => {
    const handleMagicLinkAuth = async () => {
      try {
        console.log('access_token', access_token);

        if (!access_token) {
          throw new Error('Invalid magic link - missing access token');
        }

        // Use loginWithToken function for magic link authentication
        await loginWithToken(access_token);
        
        // Redirect to candidate selection page after successful authentication
        navigate(paths.app.candidateSelection.getHref(), { replace: true });
      } catch (error) {
        console.error('Magic link authentication error:', error);
        // Redirect to login page on error
        navigate(paths.auth.login.getHref(), { 
          replace: true,
          state: { 
            error: 'Authentication failed. Please try again.' 
          } 
        });
      }
    };

    handleMagicLinkAuth();
  }, [access_token, loginWithToken, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8">
        <div className="flex justify-center mb-4">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Authenticating...
        </h1>
        <p className="text-gray-600">
          Please wait while we verify your access...
        </p>
      </div>
    </div>
  );
} 