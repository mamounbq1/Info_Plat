import { createContext, useContext, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export function useNotifications() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const { currentUser, isAdmin, userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔔 NotificationContext mounted:', { 
      currentUser: !!currentUser, 
      isAdmin, 
      userRole: userProfile?.role 
    });

    if (!currentUser || !isAdmin) {
      console.log('⚠️ Notification listener NOT started - user is not admin');
      setLoading(false);
      return;
    }

    console.log('✅ Starting notification listeners for admin...');

    // State to hold both notification types
    let userNotifications = [];
    let messageNotifications = [];

    const updateAllNotifications = () => {
      const allNotifications = [...userNotifications, ...messageNotifications]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      console.log(`🔔 Total notifications: ${allNotifications.length} (${allNotifications.filter(n => !n.read).length} unread)`);
      
      setNotifications(allNotifications);
      setUnreadCount(allNotifications.filter(n => !n.read).length);
      setLoading(false);

      // Play sound for new notifications
      if (allNotifications.length > 0 && !loading) {
        const newCount = allNotifications.filter(n => !n.read).length;
        if (newCount > 0) {
          console.log('🔊 Playing notification sound');
          playNotificationSound();
        }
      }
    };

    // Listen to pending user registrations (for admins only)
    const usersQuery = query(
      collection(db, 'users'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeUsers = onSnapshot(
      usersQuery,
      (snapshot) => {
        console.log(`📊 Users snapshot received: ${snapshot.docs.length} pending users`);
        
        userNotifications = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log('👤 Pending user:', { id: doc.id, fullName: data.fullName, status: data.status });
          return {
            id: `user-${doc.id}`,
            type: 'registration',
            userId: doc.id,
            userName: data.fullName,
            userEmail: data.email,
            message: `Nouvelle inscription: ${data.fullName}`,
            timestamp: data.createdAt,
            read: false,
            data: data
          };
        });

        updateAllNotifications();
      },
      (error) => {
        console.error('❌ Error listening to users:', error);
        setLoading(false);
      }
    );

    // Listen to contact messages (separate listener)
    const messagesQuery = query(
      collection(db, 'messages'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribeMessages = onSnapshot(
      messagesQuery,
      (msgSnapshot) => {
        console.log(`📨 Messages snapshot received: ${msgSnapshot.docs.length} pending messages`);
        
        messageNotifications = msgSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('✉️ Pending message:', { id: doc.id, from: data.name, subject: data.subject });
          return {
            id: `message-${doc.id}`,
            type: 'message',
            messageId: doc.id,
            userName: data.name,
            userEmail: data.email,
            message: `Nouveau message: ${data.subject || 'Sans sujet'}`,
            content: data.message,
            timestamp: data.createdAt,
            read: false,
            data: data
          };
        });

        updateAllNotifications();
      },
      (error) => {
        console.error('❌ Error listening to messages:', error);
        // Continue without messages if collection doesn't exist
        updateAllNotifications();
      }
    );

    // Cleanup both listeners
    return () => {
      console.log('🛑 Unsubscribing all listeners');
      unsubscribeUsers();
      unsubscribeMessages();
    };
  }, [currentUser, isAdmin, userProfile]);

  // Play notification sound
  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Could not play notification sound:', error);
    }
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  // Approve user registration
  const approveUser = async (userId, userName) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        approved: true,
        status: 'active',
        approvedAt: new Date().toISOString()
      });
      
      toast.success(`✅ ${userName} approuvé avec succès`);
      
      // Remove notification
      setNotifications(prev => prev.filter(n => n.userId !== userId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Erreur lors de l\'approbation');
    }
  };

  // Reject user registration
  const rejectUser = async (userId, userName) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        approved: false,
        status: 'rejected',
        rejectedAt: new Date().toISOString()
      });
      
      toast.success(`❌ ${userName} refusé`);
      
      // Remove notification
      setNotifications(prev => prev.filter(n => n.userId !== userId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast.error('Erreur lors du refus');
    }
  };

  // Mark message as read
  const markMessageAsRead = async (messageId) => {
    try {
      await updateDoc(doc(db, 'messages', messageId), {
        status: 'read',
        readAt: new Date().toISOString()
      });
      
      // Remove notification
      setNotifications(prev => prev.filter(n => n.messageId !== messageId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Send contact message (for users)
  const sendContactMessage = async (messageData) => {
    try {
      await addDoc(collection(db, 'messages'), {
        ...messageData,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      
      toast.success('Message envoyé avec succès!');
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
      return false;
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    approveUser,
    rejectUser,
    markMessageAsRead,
    sendContactMessage,
    playNotificationSound
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
