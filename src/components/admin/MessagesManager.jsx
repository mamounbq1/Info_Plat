import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  EnvelopeIcon, 
  EnvelopeOpenIcon, 
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function MessagesManager({ isArabic }) {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, replied

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, filterStatus]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error(isArabic ? 'خطأ في تحميل الرسائل' : 'Erreur de chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = [...messages];

    // Filter by status
    if (filterStatus === 'pending') {
      filtered = filtered.filter(msg => !msg.replied);
    } else if (filterStatus === 'replied') {
      filtered = filtered.filter(msg => msg.replied);
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.name?.toLowerCase().includes(search) ||
        msg.email?.toLowerCase().includes(search) ||
        msg.subject?.toLowerCase().includes(search) ||
        msg.message?.toLowerCase().includes(search)
      );
    }

    setFilteredMessages(filtered);
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      toast.error(isArabic ? 'الرجاء كتابة رد' : 'Veuillez écrire une réponse');
      return;
    }

    try {
      setSendingReply(true);
      
      const messageRef = doc(db, 'messages', selectedMessage.id);
      await updateDoc(messageRef, {
        replied: true,
        replyText: replyText.trim(),
        repliedAt: new Date().toISOString(),
        repliedBy: 'admin',
        status: 'replied'
      });

      toast.success(isArabic ? 'تم إرسال الرد بنجاح' : 'Réponse envoyée avec succès');
      
      // Update local state
      setMessages(messages.map(msg => 
        msg.id === selectedMessage.id 
          ? { ...msg, replied: true, replyText: replyText.trim(), repliedAt: new Date().toISOString(), status: 'replied' }
          : msg
      ));
      
      setSelectedMessage(null);
      setReplyText('');
      
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(isArabic ? 'خطأ في إرسال الرد' : 'Erreur lors de l\'envoi de la réponse');
    } finally {
      setSendingReply(false);
    }
  };

  const handleMarkAsRead = async (messageId, replied) => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, {
        status: replied ? 'replied' : 'read'
      });

      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: replied ? 'replied' : 'read' } : msg
      ));

      toast.success(isArabic ? 'تم تحديث الحالة' : 'Statut mis à jour');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(isArabic ? 'خطأ في تحديث الحالة' : 'Erreur de mise à jour');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString(isArabic ? 'ar-MA' : 'fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = {
    total: messages.length,
    pending: messages.filter(m => !m.replied).length,
    replied: messages.filter(m => m.replied).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic ? 'جاري التحميل...' : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <EnvelopeIcon className="w-8 h-8 text-primary-600" />
          {isArabic ? 'إدارة الرسائل' : 'Gestion des Messages'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {isArabic ? 'عرض والرد على رسائل المستخدمين' : 'Consulter et répondre aux messages des utilisateurs'}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">{isArabic ? 'إجمالي الرسائل' : 'Total Messages'}</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <EnvelopeIcon className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">{isArabic ? 'في انتظار الرد' : 'En Attente'}</p>
              <p className="text-3xl font-bold">{stats.pending}</p>
            </div>
            <EnvelopeOpenIcon className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">{isArabic ? 'تم الرد عليها' : 'Répondues'}</p>
              <p className="text-3xl font-bold">{stats.replied}</p>
            </div>
            <CheckCircleIcon className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isArabic ? 'بحث بالاسم، البريد، الموضوع...' : 'Rechercher par nom, email, sujet...'}
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filter */}
          <div className="relative">
            <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{isArabic ? 'جميع الرسائل' : 'Tous les messages'}</option>
              <option value="pending">{isArabic ? 'في انتظار الرد' : 'En attente'}</option>
              <option value="replied">{isArabic ? 'تم الرد عليها' : 'Répondues'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center">
            <EnvelopeIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {isArabic ? 'لا توجد رسائل' : 'Aucun message'}
            </p>
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                  !message.replied ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {message.name}
                      </h3>
                      {message.replied ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          <CheckCircleIcon className="w-3 h-3" />
                          {isArabic ? 'تم الرد' : 'Répondu'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                          <XCircleIcon className="w-3 h-3" />
                          {isArabic ? 'في انتظار الرد' : 'En attente'}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {message.email} {message.phone && `• ${message.phone}`}
                    </p>
                    
                    <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                      {message.subject}
                    </p>
                    
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {message.message}
                    </p>
                  </div>

                  <div className="text-right text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatDate(message.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isArabic ? 'تفاصيل الرسالة' : 'Détails du Message'}
              </h2>
              <button
                onClick={() => {
                  setSelectedMessage(null);
                  setReplyText('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Message Details */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isArabic ? 'الاسم' : 'Nom'}
                    </label>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedMessage.name}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {isArabic ? 'البريد الإلكتروني' : 'Email'}
                      </label>
                      <p className="text-gray-900 dark:text-white">{selectedMessage.email}</p>
                    </div>
                    {selectedMessage.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {isArabic ? 'الهاتف' : 'Téléphone'}
                        </label>
                        <p className="text-gray-900 dark:text-white">{selectedMessage.phone}</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isArabic ? 'الموضوع' : 'Sujet'}
                    </label>
                    <p className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedMessage.subject}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isArabic ? 'الرسالة' : 'Message'}
                    </label>
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                      {selectedMessage.message}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {isArabic ? 'تاريخ الإرسال' : 'Date d\'envoi'}
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(selectedMessage.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Previous Reply (if exists) */}
              {selectedMessage.replied && selectedMessage.replyText && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h3 className="font-bold text-green-900 dark:text-green-100">
                      {isArabic ? 'الرد المرسل' : 'Réponse Envoyée'}
                    </h3>
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-2">
                    {selectedMessage.replyText}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isArabic ? 'تاريخ الرد: ' : 'Date de réponse: '}
                    {formatDate(selectedMessage.repliedAt)}
                  </p>
                </div>
              )}

              {/* Reply Form */}
              {!selectedMessage.replied && (
                <form onSubmit={handleReplySubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {isArabic ? 'الرد على الرسالة' : 'Votre Réponse'}
                    </label>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                      placeholder={isArabic ? 'اكتب ردك هنا...' : 'Écrivez votre réponse ici...'}
                      required
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      {isArabic 
                        ? 'سيتم حفظ الرد في النظام. يمكنك نسخ الرد وإرساله عبر البريد الإلكتروني يدوياً.'
                        : 'La réponse sera enregistrée dans le système. Vous pouvez copier la réponse et l\'envoyer par email manuellement.'}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={sendingReply}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {sendingReply ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          {isArabic ? 'جاري الإرسال...' : 'Envoi...'}
                        </>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="w-5 h-5" />
                          {isArabic ? 'إرسال الرد' : 'Envoyer la Réponse'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMessage(null);
                        setReplyText('');
                      }}
                      className="px-6 py-3 border dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      {isArabic ? 'إلغاء' : 'Annuler'}
                    </button>
                  </div>
                </form>
              )}

              {/* Action Buttons for Replied Messages */}
              {selectedMessage.replied && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedMessage(null);
                      setReplyText('');
                    }}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    {isArabic ? 'إغلاق' : 'Fermer'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
