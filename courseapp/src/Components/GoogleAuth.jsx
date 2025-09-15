import { useEffect } from 'react';

const GoogleAuth = ({ onSuccess, onError, userType = 'user', mode = 'login' }) => {
  const clientId = '418592435785-f68qet5ssju9hsjaja3rbumq8jk4gml1.apps.googleusercontent.com';

  useEffect(() => {
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
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true
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
      
      if (onSuccess) {
        onSuccess(googleUser, credential);
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
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