// OAuth Debug Utility
export const getOAuthDebugInfo = () => {
  const currentOrigin = window.location.origin;
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  const currentProtocol = window.location.protocol;
  
  console.log('🔍 OAuth Debug Info:');
  console.log('Current Origin:', currentOrigin);
  console.log('Current Host:', currentHost);
  console.log('Current Port:', currentPort);
  console.log('Current Protocol:', currentProtocol);
  
  const requiredOrigins = [
    'http://localhost:5174',
    'http://localhost:5175', 
    'http://localhost:3000',
    currentOrigin
  ];
  
  console.log('📋 Required Origins for Google Cloud Console:');
  requiredOrigins.forEach(origin => console.log('✅', origin));
  
  return {
    currentOrigin,
    currentHost,
    currentPort,
    currentProtocol,
    requiredOrigins
  };
};

export const checkOAuthConfiguration = (clientId) => {
  console.log('🔐 OAuth Configuration:');
  console.log('Client ID:', clientId);
  console.log('Origin:', window.location.origin);
  
  if (window.location.protocol === 'https:') {
    console.log('✅ HTTPS detected - production ready');
  } else if (window.location.hostname === 'localhost') {
    console.log('⚠️ Localhost detected - ensure all localhost ports are configured in Google Cloud Console');
  } else {
    console.log('❌ HTTP detected on non-localhost - this may cause issues');
  }
};