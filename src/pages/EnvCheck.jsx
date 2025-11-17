import React from 'react';

/**
 * Environment Variables Diagnostic Page
 * This page checks if environment variables are properly loaded in the Vite build
 */
const EnvCheck = () => {
  // Check environment variables
  const checkVar = (name, value) => {
    const hasValue = value && value !== 'undefined' && value !== '';
    return {
      name,
      hasValue,
      displayValue: hasValue ? `${value.substring(0, 15)}...` : 'NOT SET'
    };
  };

  const emailjsVars = [
    checkVar('VITE_EMAILJS_PUBLIC_KEY', import.meta.env.VITE_EMAILJS_PUBLIC_KEY),
    checkVar('VITE_EMAILJS_SERVICE_ID', import.meta.env.VITE_EMAILJS_SERVICE_ID),
    checkVar('VITE_EMAILJS_TEMPLATE_ID', import.meta.env.VITE_EMAILJS_TEMPLATE_ID),
    checkVar('VITE_EMAILJS_CONTACT_REPLY_TEMPLATE_ID', import.meta.env.VITE_EMAILJS_CONTACT_REPLY_TEMPLATE_ID)
  ];

  const firebaseVars = [
    checkVar('VITE_FIREBASE_API_KEY', import.meta.env.VITE_FIREBASE_API_KEY),
    checkVar('VITE_FIREBASE_AUTH_DOMAIN', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    checkVar('VITE_FIREBASE_PROJECT_ID', import.meta.env.VITE_FIREBASE_PROJECT_ID),
    checkVar('VITE_FIREBASE_STORAGE_BUCKET', import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    checkVar('VITE_FIREBASE_MESSAGING_SENDER_ID', import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    checkVar('VITE_FIREBASE_APP_ID', import.meta.env.VITE_FIREBASE_APP_ID)
  ];

  const allVars = [...emailjsVars, ...firebaseVars];
  const allSet = allVars.every(v => v.hasValue);
  const emailjsSet = emailjsVars.every(v => v.hasValue);
  const firebaseSet = firebaseVars.every(v => v.hasValue);

  // Log to console
  React.useEffect(() => {
    console.log('📧 EmailJS Variables:', emailjsVars);
    console.log('🔥 Firebase Variables:', firebaseVars);
    console.log('✅ EmailJS configured?', emailjsSet);
    console.log('✅ Firebase configured?', firebaseSet);
    console.log('✅ All configured?', allSet);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Environment Variables Diagnostic
          </h1>
          <p className="text-gray-600">
            This page checks if Vite environment variables are properly loaded in the build.
          </p>
        </div>

        {/* Overall Status */}
        <div className={`rounded-lg shadow-md p-6 mb-6 ${
          allSet ? 'bg-green-50 border-2 border-green-500' : 
          emailjsVars.some(v => v.hasValue) ? 'bg-yellow-50 border-2 border-yellow-500' : 
          'bg-red-50 border-2 border-red-500'
        }`}>
          <h2 className="text-2xl font-bold mb-4">
            {allSet ? '✅ All Variables Configured' : 
             emailjsVars.some(v => v.hasValue) ? '⚠️ Partial Configuration' : 
             '❌ No Variables Detected'}
          </h2>
          {allSet && (
            <p className="text-green-800">
              All environment variables are properly loaded. EmailJS and Firebase should work correctly.
            </p>
          )}
          {!allSet && emailjsVars.some(v => v.hasValue) && (
            <div className="text-yellow-800">
              <p className="font-semibold mb-2">Some environment variables are missing:</p>
              <ul className="list-disc list-inside">
                {!emailjsSet && <li>EmailJS variables incomplete</li>}
                {!firebaseSet && <li>Firebase variables incomplete</li>}
              </ul>
            </div>
          )}
          {!allSet && !emailjsVars.some(v => v.hasValue) && (
            <div className="text-red-800">
              <p className="font-semibold mb-3">
                ❌ No environment variables detected! Vercel did not load them during build.
              </p>
              <div className="bg-red-100 border border-red-300 rounded p-4 mt-3">
                <p className="font-semibold mb-2">💡 Solution:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Go to Vercel Dashboard → Settings → Environment Variables</li>
                  <li>For each variable, ensure <strong>Preview</strong> environment is checked</li>
                  <li>Save changes and redeploy</li>
                  <li>OR merge to main branch to deploy to Production</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* EmailJS Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📧</span>
            EmailJS Configuration
            {emailjsSet ? (
              <span className="ml-auto text-sm font-semibold text-green-600">✅ Complete</span>
            ) : (
              <span className="ml-auto text-sm font-semibold text-red-600">❌ Incomplete</span>
            )}
          </h2>
          <div className="space-y-3">
            {emailjsVars.map(v => (
              <div key={v.name} className="flex items-center justify-between py-2 border-b border-gray-200">
                <code className="text-sm bg-gray-100 px-3 py-1 rounded">
                  {v.name}
                </code>
                <span className={`px-3 py-1 rounded font-semibold text-sm ${
                  v.hasValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {v.hasValue ? `✅ ${v.displayValue}` : '❌ NOT SET'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Firebase Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">🔥</span>
            Firebase Configuration
            {firebaseSet ? (
              <span className="ml-auto text-sm font-semibold text-green-600">✅ Complete</span>
            ) : (
              <span className="ml-auto text-sm font-semibold text-red-600">❌ Incomplete</span>
            )}
          </h2>
          <div className="space-y-3">
            {firebaseVars.map(v => (
              <div key={v.name} className="flex items-center justify-between py-2 border-b border-gray-200">
                <code className="text-sm bg-gray-100 px-3 py-1 rounded">
                  {v.name}
                </code>
                <span className={`px-3 py-1 rounded font-semibold text-sm ${
                  v.hasValue ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {v.hasValue ? `✅ ${v.displayValue}` : '❌ NOT SET'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-gray-800 text-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">🐛 Debug Information</h2>
          <div className="space-y-2 font-mono text-sm">
            <div>Node Environment: <span className="text-green-400">{import.meta.env.MODE}</span></div>
            <div>Vite Dev: <span className="text-green-400">{import.meta.env.DEV ? 'Yes' : 'No'}</span></div>
            <div>Vite Prod: <span className="text-green-400">{import.meta.env.PROD ? 'Yes' : 'No'}</span></div>
            <div>Base URL: <span className="text-green-400">{import.meta.env.BASE_URL}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvCheck;
