// services/WebSocketService.js
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.connectCallbacks = [];
    this.disconnectCallbacks = [];
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 5000;
  }

  // Add callback for connection events
  onConnect(callback) {
    this.connectCallbacks.push(callback);
  }

  onDisconnect(callback) {
    this.disconnectCallbacks.push(callback);
  }

  // Trigger connect callbacks
  _triggerConnectCallbacks() {
    this.connectCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in connect callback:', error);
      }
    });
  }

  // Trigger disconnect callbacks
  _triggerDisconnectCallbacks() {
    this.disconnectCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in disconnect callback:', error);
      }
    });
  }

  connect(userId, onNotificationReceived) {
    if (this.connected && this.stompClient) {
      console.log('WebSocket already connected');
      return;
    }

    console.log('Attempting to connect WebSocket...');
    
    try {
      const socket = new SockJS(`${import.meta.env.VITE_API_URL}/ws`);
      this.stompClient = Stomp.over(socket);
      
      // Disable debug logging in production
      this.stompClient.debug = (msg) => {
        if (import.meta.env.DEV) {
          console.log('STOMP Debug:', msg);
        }
      };

      // Configure reconnect options
      this.stompClient.reconnectDelay = this.reconnectInterval;
      this.stompClient.heartbeatIncoming = 4000;
      this.stompClient.heartbeatOutgoing = 4000;
      
      this.stompClient.connect(
        {}, 
        (frame) => {
          console.log('WebSocket Connected:', frame);
          this.connected = true;
          this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          
          // Trigger connect callbacks
          this._triggerConnectCallbacks();
          
          // Subscribe to user-specific notifications
          const subscription = this.stompClient.subscribe(
            `/user/${userId}/queue/notification`, 
            (message) => {
              try {
                const notificationData = JSON.parse(message.body);
                console.log('Received notification:', notificationData);
                onNotificationReceived(notificationData);
              } catch (error) {
                console.error('Error parsing notification:', error);
              }
            }
          );
          
          this.subscriptions.set(userId, subscription);
        },
        (error) => {
          console.error('WebSocket connection error:', error);
          this.connected = false;
          
          // Trigger disconnect callbacks
          this._triggerDisconnectCallbacks();
          
          // Retry connection with exponential backoff
          this._handleReconnect(userId, onNotificationReceived);
        }
      );

      // Handle socket close events
      socket.onclose = (event) => {
        console.log('Socket closed:', event);
        this.connected = false;
        this._triggerDisconnectCallbacks();
      };

      // Handle socket errors
      socket.onerror = (error) => {
        console.error('Socket error:', error);
        this.connected = false;
        this._triggerDisconnectCallbacks();
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.connected = false;
      this._triggerDisconnectCallbacks();
      this._handleReconnect(userId, onNotificationReceived);
    }
  }

  _handleReconnect(userId, onNotificationReceived) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    
    console.log(`Retrying WebSocket connection in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.connected) { // Only reconnect if still disconnected
        this.connect(userId, onNotificationReceived);
      }
    }, delay);
  }

  disconnect() {
    console.log('Disconnecting WebSocket...');
    
    if (this.stompClient && this.connected) {
      // Unsubscribe from all subscriptions
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      
      this.stompClient.disconnect(() => {
        console.log('WebSocket disconnected');
        this.connected = false;
        this.stompClient = null;
        this._triggerDisconnectCallbacks();
      });
    } else {
      this.connected = false;
      this.stompClient = null;
      this._triggerDisconnectCallbacks();
    }
  }

  isConnected() {
    return this.connected && this.stompClient && this.stompClient.connected;
  }

  // Method to manually check connection status
  getConnectionStatus() {
    return {
      connected: this.connected,
      stompConnected: this.stompClient?.connected || false,
      reconnectAttempts: this.reconnectAttempts,
      hasStompClient: !!this.stompClient
    };
  }
}

export default new WebSocketService();