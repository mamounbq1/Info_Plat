import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  EnvelopeIcon, 
  EnvelopeOpenIcon, 
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PaperAirplaneIcon,
  TrashIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { sendReplyEmail, isEmailConfigured } from '../../services/emailService';

export default function MessagesManager({ isArabic }) {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, replied
  const [filterType, setFilterType] = useState('all'); // all, contact, club_request
  const [showNewReplyForm, setShowNewReplyForm] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 10;

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    filterMessages();
    setCurrentPage(1); // Reset to first page when filters change
  }, [messages, searchTerm, filterStatus, filterType]);

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

    // Filter by type
    if (filterType === 'contact') {
      filtered = filtered.filter(msg => !msg.type || msg.type !== 'club_request');
    } else if (filterType === 'club_request') {
      filtered = filtered.filter(msg => msg.type === 'club_request');
    }

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
        msg.message?.toLowerCase().includes(search) ||
        msg.clubName?.toLowerCase().includes(search) ||
        msg.grade?.toLowerCase().includes(search)
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
      
      // Save reply to Firestore first
      const messageRef = doc(db, 'messages', selectedMessage.id);
      await updateDoc(messageRef, {
        replied: true,
        replyText: replyText.trim(),
        repliedAt: new Date().toISOString(),
        repliedBy: 'admin',
        status: 'replied'
      });

      // Update local state
      setMessages(messages.map(msg => 
        msg.id === selectedMessage.id 
          ? { ...msg, replied: true, replyText: replyText.trim(), repliedAt: new Date().toISOString(), status: 'replied' }
          : msg
      ));

      // Send email notification if configured
      if (isEmailConfigured()) {
        const emailResult = await sendReplyEmail({
          toEmail: selectedMessage.email,
          toName: selectedMessage.name,
          subject: selectedMessage.subject,
          originalMessage: selectedMessage.message,
          replyMessage: replyText.trim(),
          language: isArabic ? 'ar' : 'fr'
        });

        if (emailResult.success) {
          toast.success(
            isArabic 
              ? '✅ تم إرسال الرد بنجاح وإرساله بالبريد الإلكتروني' 
              : '✅ Réponse envoyée avec succès et email envoyé'
          );
        } else {
          toast.success(
            isArabic 
              ? '✅ تم حفظ الرد (فشل إرسال البريد الإلكتروني)' 
              : '✅ Réponse sauvegardée (email non envoyé)'
          );
          console.warn('Email sending failed:', emailResult.message);
        }
      } else {
        toast.success(
          isArabic 
            ? '✅ تم حفظ الرد (البريد الإلكتروني غير مكوّن)' 
            : '✅ Réponse sauvegardée (email non configuré)'
        );
        console.warn('Email service not configured');
      }
      
      setSelectedMessage(null);
      setReplyText('');
      
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error(isArabic ? 'خطأ في إرسال الرد' : 'Erreur lors de l\'envoi de la réponse');
    } finally {
      setSendingReply(false);
    }
  };

  const handleSendAnotherReply = async (e) => {
    e.preventDefault();
    
    if (!replyText.trim()) {
      toast.error(isArabic ? 'الرجاء كتابة رد' : 'Veuillez écrire une réponse');
      return;
    }

    try {
      setSendingReply(true);
      
      // Send email notification if configured
      if (isEmailConfigured()) {
        const emailResult = await sendReplyEmail({
          toEmail: selectedMessage.email,
          toName: selectedMessage.name,
          subject: selectedMessage.subject,
          originalMessage: selectedMessage.message,
          replyMessage: replyText.trim(),
          language: isArabic ? 'ar' : 'fr'
        });

        if (emailResult.success) {
          toast.success(
            isArabic 
              ? '✅ تم إرسال الرد الجديد بنجاح' 
              : '✅ Nouveau message envoyé avec succès'
          );
        } else {
          toast.error(
            isArabic 
              ? '❌ فشل إرسال البريد الإلكتروني' 
              : '❌ Échec de l\'envoi de l\'email'
          );
          console.warn('Email sending failed:', emailResult.message);
        }
      } else {
        toast.error(
          isArabic 
            ? '❌ البريد الإلكتروني غير مكوّن' 
            : '❌ Service email non configuré'
        );
        console.warn('Email service not configured');
      }
      
      setShowNewReplyForm(false);
      setReplyText('');
      
    } catch (error) {
      console.error('Error sending another reply:', error);
      toast.error(isArabic ? 'خطأ في إرسال الرد' : 'Erreur lors de l\'envoi du message');
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      setDeleting(true);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'messages', messageToDelete.id));
      
      // Update local state
      setMessages(messages.filter(msg => msg.id !== messageToDelete.id));
      
      toast.success(
        isArabic 
          ? '✅ تم حذف الرسالة بنجاح' 
          : '✅ Message supprimé avec succès'
      );
      
      // Close modals
      setMessageToDelete(null);
      if (selectedMessage?.id === messageToDelete.id) {
        setSelectedMessage(null);
      }
      
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error(
        isArabic 
          ? '❌ خطأ في حذف الرسالة' 
          : '❌ Erreur lors de la suppression'
      );
    } finally {
      setDeleting(false);
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
    replied: messages.filter(m => m.replied).length,
    clubRequests: messages.filter(m => m.type === 'club_request').length
  };

  // Pagination calculations
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">{isArabic ? 'إجمالي الرسائل' : 'Total Messages'}</p>
              <p className="text-3xl font-bold">{stats.total}</p>
            </div>
            <EnvelopeIcon className="w-12 h-12 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">{isArabic ? 'طلبات النوادي' : 'Demandes Clubs'}</p>
              <p className="text-3xl font-bold">{stats.clubRequests}</p>
            </div>
            <UserGroupIcon className="w-12 h-12 opacity-50" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isArabic ? 'بحث بالاسم، البريد، النادي...' : 'Rechercher par nom, email, club...'}
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Filter by Type */}
          <div className="relative">
            <UserGroupIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{isArabic ? 'جميع الأنواع' : 'Tous les types'}</option>
              <option value="contact">{isArabic ? 'رسائل الاتصال' : 'Messages de contact'}</option>
              <option value="club_request">{isArabic ? 'طلبات النوادي' : 'Demandes de clubs'}</option>
            </select>
          </div>

          {/* Filter by Status */}
          <div className="relative">
            <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">{isArabic ? 'جميع الحالات' : 'Tous les statuts'}</option>
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
          <>
            <div className="divide-y dark:divide-gray-700">
              {currentMessages.map((message) => (
              <div
                key={message.id}
                className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                  !message.replied ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setSelectedMessage(message)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white truncate">
                        {message.name}
                      </h3>
                      {message.type === 'club_request' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          <UserGroupIcon className="w-3 h-3" />
                          {isArabic ? 'طلب نادي' : 'Demande Club'}
                        </span>
                      )}
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
                      {message.grade && ` • ${message.grade}`}
                    </p>
                    
                    <p className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                      {message.subject}
                    </p>
                    
                    {message.clubName && (
                      <p className="text-sm text-purple-600 dark:text-purple-400 mb-2 font-medium">
                        📚 {message.clubName}
                      </p>
                    )}
                    
                    <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                      {message.message}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(message.createdAt)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMessageToDelete(message);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      title={isArabic ? 'حذف الرسالة' : 'Supprimer le message'}
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              <div className="flex items-center justify-between">
                {/* Page Info */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic 
                    ? `عرض ${indexOfFirstMessage + 1} إلى ${Math.min(indexOfLastMessage, filteredMessages.length)} من ${filteredMessages.length} رسالة`
                    : `Affichage de ${indexOfFirstMessage + 1} à ${Math.min(indexOfLastMessage, filteredMessages.length)} sur ${filteredMessages.length} messages`
                  }
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage = 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1);
                      
                      const showEllipsis = 
                        (page === currentPage - 2 && currentPage > 3) ||
                        (page === currentPage + 2 && currentPage < totalPages - 2);

                      if (showEllipsis) {
                        return (
                          <span key={page} className="px-3 py-2 text-gray-500">
                            ...
                          </span>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`min-w-[40px] px-3 py-2 rounded-lg font-medium transition ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
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

                  {/* Club-specific fields */}
                  {selectedMessage.type === 'club_request' && (
                    <>
                      {selectedMessage.clubName && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                          <label className="text-sm font-medium text-purple-700 dark:text-purple-300 flex items-center gap-2">
                            <UserGroupIcon className="w-4 h-4" />
                            {isArabic ? 'النادي' : 'Club'}
                          </label>
                          <p className="text-lg font-semibold text-purple-900 dark:text-purple-100 mt-1">
                            {selectedMessage.clubName}
                          </p>
                        </div>
                      )}
                      {selectedMessage.grade && (
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {isArabic ? 'المستوى الدراسي' : 'Niveau scolaire'}
                          </label>
                          <p className="text-gray-900 dark:text-white font-medium">{selectedMessage.grade}</p>
                        </div>
                      )}
                    </>
                  )}

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
                <div className="space-y-4">
                  {/* New Reply Form */}
                  {showNewReplyForm ? (
                    <form onSubmit={handleSendAnotherReply} className="border dark:border-gray-600 rounded-xl p-6 bg-blue-50 dark:bg-blue-900/20">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          {isArabic ? 'رسالة جديدة' : 'Nouveau Message'}
                        </label>
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={6}
                          className="w-full px-4 py-3 border dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 resize-none"
                          placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Écrivez votre message ici...'}
                          required
                        />
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
                              {isArabic ? 'إرسال' : 'Envoyer'}
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewReplyForm(false);
                            setReplyText('');
                          }}
                          className="px-6 py-3 border dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                        >
                          {isArabic ? 'إلغاء' : 'Annuler'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowNewReplyForm(true)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                      >
                        <ArrowPathIcon className="w-5 h-5" />
                        {isArabic ? 'إرسال رسالة أخرى' : 'Renvoyer un Message'}
                      </button>
                      <button
                        onClick={() => setMessageToDelete(selectedMessage)}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2"
                      >
                        <TrashIcon className="w-5 h-5" />
                        {isArabic ? 'حذف' : 'Supprimer'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedMessage(null);
                          setReplyText('');
                          setShowNewReplyForm(false);
                        }}
                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                      >
                        {isArabic ? 'إغلاق' : 'Fermer'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {messageToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <TrashIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {isArabic ? 'تأكيد الحذف' : 'Confirmer la Suppression'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isArabic 
                  ? 'هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.'
                  : 'Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.'}
              </p>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <span className="font-bold">{isArabic ? 'من: ' : 'De: '}</span>
                  {messageToDelete.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-bold">{isArabic ? 'الموضوع: ' : 'Sujet: '}</span>
                  {messageToDelete.subject}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteMessage}
                  disabled={deleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      {isArabic ? 'جاري الحذف...' : 'Suppression...'}
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-5 h-5" />
                      {isArabic ? 'نعم، حذف' : 'Oui, Supprimer'}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setMessageToDelete(null)}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 border dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
                >
                  {isArabic ? 'إلغاء' : 'Annuler'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
