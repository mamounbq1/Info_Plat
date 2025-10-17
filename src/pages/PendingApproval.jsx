import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function PendingApproval() {
  const { userProfile, logout, currentUser } = useAuth();
  const { isArabic } = useLanguage();

  const handleLogout = async () => {
    await logout();
  };

  // Check if account is rejected
  const isRejected = userProfile?.status === 'rejected';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          {/* Icon */}
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
            isRejected 
              ? 'bg-red-100' 
              : 'bg-yellow-100'
          }`}>
            {isRejected ? (
              <XCircleIcon className="w-12 h-12 text-red-600" />
            ) : (
              <ClockIcon className="w-12 h-12 text-yellow-600" />
            )}
          </div>

          {/* Title */}
          <h1 className={`text-3xl font-bold mb-4 ${
            isRejected ? 'text-red-900' : 'text-gray-900'
          }`}>
            {isRejected ? (
              isArabic ? 'تم رفض الحساب' : 'Compte Refusé'
            ) : (
              isArabic ? 'في انتظار الموافقة' : 'En Attente d\'Approbation'
            )}
          </h1>

          {/* Message */}
          <div className={`rounded-lg p-6 mb-6 ${
            isRejected 
              ? 'bg-red-50 border border-red-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            {isRejected ? (
              <>
                <p className="text-red-800 mb-4">
                  {isArabic 
                    ? 'عذراً، تم رفض طلب إنشاء الحساب من قبل الإدارة.'
                    : 'Désolé, votre demande de création de compte a été refusée par l\'administration.'
                  }
                </p>
                <p className="text-red-700 text-sm">
                  {isArabic 
                    ? 'إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بإدارة المدرسة.'
                    : 'Si vous pensez qu\'il s\'agit d\'une erreur, veuillez contacter l\'administration de l\'école.'
                  }
                </p>
              </>
            ) : (
              <>
                <p className="text-yellow-800 mb-4">
                  {isArabic 
                    ? `مرحباً ${userProfile?.fullName || 'الطالب'}!`
                    : `Bonjour ${userProfile?.fullName || 'étudiant'} !`
                  }
                </p>
                <p className="text-yellow-800 mb-4">
                  {isArabic 
                    ? 'شكراً لتسجيلك في منصة ثانوية المرينيين. حسابك قيد المراجعة من قبل إدارة المدرسة.'
                    : 'Merci de votre inscription sur la plateforme du Lycée Almarinyine. Votre compte est en cours de vérification par l\'administration.'
                  }
                </p>
                <div className="bg-white rounded-lg p-4 border border-yellow-300">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {isArabic ? 'الخطوات التالية:' : 'Prochaines étapes :'}
                  </h3>
                  <ul className="text-left text-gray-700 space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>
                        {isArabic 
                          ? 'تم إنشاء حسابك بنجاح'
                          : 'Votre compte a été créé avec succès'
                        }
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ClockIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <span>
                        {isArabic 
                          ? 'الإدارة تراجع معلوماتك حالياً'
                          : 'L\'administration examine actuellement vos informations'
                        }
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        {isArabic 
                          ? 'ستتلقى إشعاراً عبر البريد الإلكتروني بمجرد الموافقة على حسابك'
                          : 'Vous recevrez une notification par email dès que votre compte sera approuvé'
                        }
                      </span>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">
              {isArabic ? 'معلومات الحساب:' : 'Informations du compte :'}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {isArabic ? 'الاسم:' : 'Nom :'}
                </span>
                <span className="font-medium text-gray-900">
                  {userProfile?.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {isArabic ? 'البريد الإلكتروني:' : 'Email :'}
                </span>
                <span className="font-medium text-gray-900">
                  {currentUser?.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {isArabic ? 'نوع الحساب:' : 'Type de compte :'}
                </span>
                <span className="font-medium text-gray-900">
                  {isArabic ? 'طالب' : 'Élève'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {isArabic ? 'الحالة:' : 'Statut :'}
                </span>
                <span className={`font-medium ${
                  isRejected ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {isRejected 
                    ? (isArabic ? 'مرفوض' : 'Refusé')
                    : (isArabic ? 'قيد المراجعة' : 'En attente')
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              {isArabic ? 'تواصل معنا' : 'Contactez-nous'}
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              {isArabic 
                ? 'إذا كان لديك أي أسئلة، لا تتردد في الاتصال بإدارة المدرسة:'
                : 'Si vous avez des questions, n\'hésitez pas à contacter l\'administration :'
              }
            </p>
            <div className="space-y-1 text-sm text-blue-700">
              <p>📧 Email: contact@lycee-almarinyine.ma</p>
              <p>📞 Téléphone: +212 5XX-XXXXXX</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleLogout}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-6 rounded-lg font-semibold transition"
            >
              {isArabic ? 'تسجيل الخروج' : 'Se Déconnecter'}
            </button>
            <Link
              to="/"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition text-center"
            >
              {isArabic ? 'العودة إلى الصفحة الرئيسية' : 'Retour à l\'Accueil'}
            </Link>
          </div>

          {/* Refresh Note */}
          <p className="mt-6 text-xs text-gray-500">
            {isArabic 
              ? 'بمجرد الموافقة على حسابك، ستتمكن من تسجيل الدخول والوصول إلى لوحة التحكم.'
              : 'Une fois votre compte approuvé, vous pourrez vous connecter et accéder au tableau de bord.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
