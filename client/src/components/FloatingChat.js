import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, Send, MessageCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import chatbotService from '../services/chatbotService';

const FloatingChat = () => {
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Set initial message based on authentication status
  useEffect(() => {
    if (user) {
      // Try to load saved chat messages from localStorage
      const savedMessages = localStorage.getItem(`chatMessages_${user.id}`);
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          // Convert timestamp strings back to Date objects
          const messagesWithDates = parsedMessages.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          setChatMessages(messagesWithDates);
        } catch (error) {
          console.error('Error parsing saved chat messages:', error);
          // Fallback to default message
          setChatMessages([
            {
              id: 1,
              type: 'bot',
              message: "Hello! I'm your AI college assistant. How can I help you today?",
              timestamp: new Date()
            }
          ]);
        }
      } else {
        // No saved messages, start with default
        setChatMessages([
          {
            id: 1,
            type: 'bot',
            message: "Hello! I'm your AI college assistant. How can I help you today?",
            timestamp: new Date()
          }
        ]);
      }
    } else {
      setChatMessages([]);
    }
  }, [user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isLoading]);

  // Save chat messages to localStorage whenever they change
  useEffect(() => {
    if (user && chatMessages.length > 0) {
      localStorage.setItem(`chatMessages_${user.id}`, JSON.stringify(chatMessages));
    }
  }, [chatMessages, user]);

  // Clear chat history when user logs out
  useEffect(() => {
    if (!user) {
      // Clear any saved chat messages when user logs out
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('chatMessages_')) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [user]);

  // Function to clear chat history
  const clearChatHistory = () => {
    if (user) {
      setChatMessages([
        {
          id: 1,
          type: 'bot',
          message: "Hello! I'm your AI college assistant. How can I help you today?",
          timestamp: new Date()
        }
      ]);
      localStorage.removeItem(`chatMessages_${user.id}`);
      toast.success('Chat history cleared!');
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault?.();
    if (!newMessage.trim() || isLoading) return;

    // Check if user is logged in
    if (!user) {
      toast.error('Please login to chat with the AI assistant');
      return;
    }

    // Debug: Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No authentication token found. Please login again.');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: newMessage.trim(),
      timestamp: new Date()
    };

    setChatMessages((prev) => [...prev, userMessage]);
    const messageToSend = newMessage.trim();
    setNewMessage('');
    setIsLoading(true);

    try {
      // Send message to backend
      const response = await chatbotService.sendMessage(messageToSend);
      
      if (response.success) {
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          message: response.data.response,
          timestamp: new Date(),
          intent: response.data.intent,
          dataUsed: response.data.dataUsed
        };
        
        setChatMessages((prev) => [...prev, botResponse]);
        
        // Show success toast if data was used
        if (response.data.dataUsed) {
          toast.success('Found relevant college information! 🎓');
        }
      } else {
        throw new Error(response.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        // Redirect to login
        window.location.href = '/login';
        return;
      }
      
      // Check if it's a network error
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
      
      // Add error message
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        message: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date(),
        isError: true
      };
      
      setChatMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isChatOpen && (
        <div className="mb-4 w-100 h-[500px] bg-gray-800/95 backdrop-blur-md border border-yellow-400/20 rounded-2xl shadow-2xl shadow-yellow-400/20 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 flex items-center justify-between h-16">
            <div className="flex items-center">
              <Bot className="h-6 w-6 text-black mr-2" />
              <span className="text-black font-bold">AI College Assistant</span>
            </div>
            <div className="flex items-center space-x-2">
              {user && chatMessages.length > 1 && (
                <button 
                  onClick={clearChatHistory} 
                  className="text-black hover:text-gray-800 transition-colors p-1 rounded hover:bg-yellow-300/20"
                  title="Clear chat history"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => setIsChatOpen(false)} className="text-black hover:text-gray-800 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="h-80 overflow-y-auto p-4 space-y-4">
            <div ref={messagesEndRef} />
            {chatMessages.length > 0 ? (
              chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                        : 'bg-gray-700/50 backdrop-blur-sm text-gray-100'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : null}
            
            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700/50 backdrop-blur-sm text-gray-100 max-w-xs px-4 py-2 rounded-2xl">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-400 ml-2">AI is typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            {!user ? (
              <div className="flex items-start justify-center h-full pt-12">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-6 w-6 text-yellow-400" />
                  </div>
                  <p className="text-white text-base font-semibold">Login to start chatting</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="p-3 border-t border-yellow-400/20">
            {user ? (
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Ask about colleges..."
                  className="flex-1 bg-gray-700 border border-gray-600 text-white placeholder-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black p-2 rounded-lg hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <div className="text-center py-2">
                <h3 className="text-sm font-bold text-white mb-1">Login Required</h3>
                <p className="text-xs text-gray-400 mb-2">
                  Please login to chat with our AI assistant
                </p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-medium rounded-lg transition-colors text-sm"
                >
                  Login to Chat
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-2xl shadow-orange-500/30 hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
        aria-label="Toggle chat"
      >
        {isChatOpen ? (
          <X className="h-7 w-7 text-black group-hover:rotate-90 transition-transform" />
        ) : (
          <Bot className="h-7 w-7 text-black group-hover:scale-110 transition-transform" />
        )}
      </button>
    </div>
  );
};

export default FloatingChat;
