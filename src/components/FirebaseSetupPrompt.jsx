import { useLanguage } from '../contexts/LanguageContext';
import { ExclamationTriangleIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

export default function FirebaseSetupPrompt() {
  const { isArabic } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isArabic ? 'تكوين Firebase مطلوب' : 'Firebase Configuration Required'}
          </h1>
          <p className="text-gray-600">
            {isArabic 
              ? 'يرجى إعداد Firebase لتمكين جميع الميزات'
              : 'Please set up Firebase to enable all features'
            }
          </p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-6 rounded">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">
            {isArabic ? '🚀 البدء السريع (5 دقائق)' : '🚀 Quick Start (5 minutes)'}
          </h2>
          <ol className="space-y-2 text-gray-700" dir={isArabic ? 'rtl' : 'ltr'}>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">1.</span>
              <span>
                {isArabic 
                  ? 'إنشاء مشروع Firebase في '
                  : 'Create a Firebase project at '}
                <a 
                  href="https://console.firebase.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-semibold"
                >
                  Firebase Console
                </a>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">2.</span>
              <span>
                {isArabic 
                  ? 'تمكين المصادقة (Authentication) → Email/Password'
                  : 'Enable Authentication → Email/Password'
                }
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">3.</span>
              <span>
                {isArabic 
                  ? 'إنشاء قاعدة بيانات Firestore'
                  : 'Create Firestore Database'
                }
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">4.</span>
              <span>
                {isArabic 
                  ? 'تمكين Storage'
                  : 'Enable Storage'
                }
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold text-blue-600">5.</span>
              <span>
                {isArabic 
                  ? 'نسخ بيانات التكوين إلى ملف .env'
                  : 'Copy config to .env file'
                }
              </span>
            </li>
          </ol>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            {isArabic ? '📝 إنشاء ملف .env' : '📝 Create .env file'}
          </h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm overflow-x-auto">
            <pre>{`VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123`}</pre>
          </div>
        </div>

        <div className="flex gap-4">
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center flex items-center justify-center gap-2"
          >
            <RocketLaunchIcon className="w-5 h-5" />
            {isArabic ? 'فتح Firebase Console' : 'Open Firebase Console'}
          </a>
          <a
            href="https://github.com/mamounbq1/Info_Plat/blob/main/QUICKSTART.md"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
          >
            {isArabic ? '📖 دليل الإعداد' : '📖 Setup Guide'}
          </a>
        </div>

        <div className="mt-6 pt-6 border-t text-center text-sm text-gray-600">
          <p>
            {isArabic 
              ? 'بعد الإعداد، أعد تشغيل الخادم: npm run dev'
              : 'After setup, restart the server: npm run dev'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
