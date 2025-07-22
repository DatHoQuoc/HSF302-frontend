// context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import WebSocketService from '@/service/WebSocketService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // Thêm state cho connection status

  useEffect(() => {
  const interval = setInterval(() => {
    console.log('Connection Status:', WebSocketService.getConnectionStatus());
    console.log(userId);
  }, 5000);
  

  return () => clearInterval(interval);
}, []);
  // Get user ID from localStorage or your auth system
  useEffect(() => {
    const getUserId = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log(user);
        return user.id || null;
      } catch {
        return null;
      }
    };

    const id = getUserId();
    setUserId(id);
  }, []);

  // Connect to WebSocket when userId is available
  useEffect(() => {
    if (userId) {
      WebSocketService.connect(userId, handleNewNotification);
      
      // Set up connection status listeners
      WebSocketService.onConnect(() => {
        setIsConnected(true);
        console.log('WebSocket connected');
      });
      
      WebSocketService.onDisconnect(() => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
      });

      // Set initial connection status
      setIsConnected(WebSocketService.isConnected());
    }

    return () => {
      WebSocketService.disconnect();
      setIsConnected(false);
    };
  }, [userId]);

  const handleNewNotification = (notification) => {
    // Add timestamp to notification
    const notificationWithTimestamp = {
      ...notification,
      id: Date.now(), // Simple ID generation
      timestamp: new Date().toISOString(),
      read: false
    };

    // Add to notifications list
    setNotifications(prev => [notificationWithTimestamp, ...prev]);
    
    // Increment unread count
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    showToastNotification(notificationWithTimestamp);
  };

  const showToastNotification = (notification) => {
    const statusMessages = {
      BORROWED: '📚 Sách đã được mượn',
      RETURNED: '↩️ Sách đã được trả',
      APPROVED: '✅ Đã phê duyệt',
      REJECTED: '❌ Bị từ chối',
    };

    const title = statusMessages[notification.status] || '📢 Thông báo mới';
    
    toast.success(title, {
      description: `${notification.message} - "${notification.bookTitle}"`,
      duration: 5000,
      action: {
        label: 'Xem',
        onClick: () => markAsRead(notification.id)
      }
    });
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    isConnected // Sử dụng state thay vì function call
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};