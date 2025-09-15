import { useEffect } from 'react';
import { getOAuthDebugInfo, checkOAuthConfiguration } from '../lib/oauth-debug';

const GoogleAuth = ({ onSuccess, onError, userType = 'user', mode = 'login' }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '418592435785-f68qet5ssju9hsjaja3rbumq8jk4gml1.apps.googleusercontent.com';

  useEffect(() => {
    // Debug OAuth configuration
    getOAuthDebugInfo();
    checkOAuthConfiguration(clientId);
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google) {
        initializeGoogleAuth();
      }
    };
    
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const initializeGoogleAuth = () => {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        // Add origin configuration
        origin: window.location.origin
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: mode === 'login' ? 'signin_with' : 'signup_with',
          logo_alignment: 'left'
        }
      );

      console.log('✅ Google Auth initialized successfully');
      console.log('🔗 Origin:', window.location.origin);
      console.log('🔑 Client ID:', clientId);
    } catch (error) {
      console.error('❌ Google Auth initialization failed:', error);
      console.error('🔗 Current Origin:', window.location.origin);
      console.error('🔑 Client ID:', clientId);
      
      if (onError) {
        onError({
          type: 'initialization_error',
          message: 'Failed to initialize Google Auth',
          origin: window.location.origin,
          clientId: clientId,
          error: error
        });
      }
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      // Decode the JWT token to get user info
      const credential = response.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      const googleUser = {
        googleId: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        profilePicture: payload.picture,
        emailVerified: payload.email_verified
      };

      console.log('Google Auth Success:', googleUser);
      console.log('Current origin:', window.location.origin);
      
      if (onSuccess) {
        onSuccess(googleUser, credential);
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      console.error('Current origin:', window.location.origin);
      console.error('Client ID:', clientId);
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <div className="google-auth-container">
      <div className="divider">
        <span>or</span>
      </div>
      <div id="google-signin-button" className="google-signin-button"></div>
    </div>
  );
};

export default GoogleAuth;