import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  Bot, 
  User, 
  MessageCircle, 
  Sparkles,
  Loader2,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import chatbotService from '../services/chatbotService';

const Chatbot = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
    // Focus on input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Reload chat history when user authentication state changes
  useEffect(() => {
    loadChatHistory();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await chatbotService.getChatHistory(50);
      if (response.success) {
        // Convert database format to chat format
        const chatMessages = response.data.map(msg => ({
          id: msg.id,
          type: 'user',
          content: msg.message,
          timestamp: msg.created_at
        })).concat(
          response.data.map(msg => ({
            id: msg.id + '_response',
            type: 'bot',
            content: msg.response,
            timestamp: msg.created_at,
            intent: msg.metadata?.intent,
            dataUsed: msg.metadata?.criteria
          }))
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // If no chat history and user is logged in, add welcome message
        if (chatMessages.length === 0 && user) {
          const welcomeMessage = {
            id: 'welcome',
            type: 'bot',
            content: 'Hi! I\'m your AI college assistant. I can help you find the perfect college based on your preferences. Ask me about colleges, courses, fees, or anything else related to higher education!',
            timestamp: new Date().toISOString()
          };
          setMessages([welcomeMessage]);
        } else {
          setMessages(chatMessages);
        }
      } else if (user) {
        // If API call fails but user is logged in, show welcome message
        const welcomeMessage = {
          id: 'welcome',
          type: 'bot',
          content: 'Hi! I\'m your AI college assistant. I can help you find the perfect college based on your preferences. Ask me about colleges, courses, fees, or anything else related to higher education!',
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      if (user) {
        // If error occurs but user is logged in, show welcome message
        const welcomeMessage = {
          id: 'welcome',
          type: 'bot',
          content: 'Hi! I\'m your AI college assistant. I can help you find the perfect college based on your preferences. Ask me about colleges, courses, fees, or anything else related to higher education!',
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
      }
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    // Check if user is logged in
    if (!user) {
      toast.error('Please login to chat with the AI assistant');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await chatbotService.sendMessage(message.trim());
      
      if (response.success) {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.data.response,
          timestamp: new Date().toISOString(),
          intent: response.data.intent,
          dataUsed: response.data.dataUsed
        };

        setMessages(prev => [...prev, botMessage]);
        
        // Show success toast if data was used
        if (response.data.dataUsed) {
          toast.success('Found relevant college information! 🎓');
        }
      } else {
        throw new Error(response.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Add error message instead of removing user message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickAction = (query) => {
    if (!user) {
      toast.error('Please login to chat with the AI assistant');
      return;
    }
    setInputMessage(query);
    sendMessage(query);
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const suggestedQuestions = chatbotService.getSuggestedQuestions();
  const quickActions = chatbotService.getQuickActions();

  if (isLoadingHistory) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <MessageCircle className="h-8 w-8 text-yellow-400 mr-3" />
                AI College Assistant
              </h1>
              <p className="text-gray-400">
                Ask me anything about colleges, courses, admissions, and more!
              </p>
              <div className="flex items-center mt-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">AI Powered by OpenAI</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={clearChat}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Clear Chat</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <Bot className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-400 mb-2">Welcome to AI College Assistant!</h3>
                    <p className="text-gray-500 mb-6">
                      I can help you find colleges, courses, and answer admission-related questions.
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Try asking:</p>
                      {suggestedQuestions.slice(0, 3).map((question, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickAction(question)}
                          className="block w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {message.type === 'bot' && (
                            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="h-4 w-4 text-black" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="whitespace-pre-wrap">{message.content}</div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-xs opacity-70">
                                {formatTime(message.timestamp)}
                              </div>
                              {message.type === 'bot' && message.dataUsed && (
                                <div className="flex items-center space-x-1 text-xs opacity-70">
                                  <Sparkles className="h-3 w-3" />
                                  <span>Live Data</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {message.type === 'user' && (
                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-white rounded-lg p-4 max-w-[80%]">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-black" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-700 p-4">
                {user ? (
                  <div className="flex space-x-4">
                    <div className="flex-1">
                      <textarea
                        ref={inputRef}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me about colleges, courses, admissions..."
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 resize-none"
                        rows={2}
                        disabled={isLoading || !user}
                      />
                    </div>
                    <button
                      onClick={() => sendMessage()}
                      disabled={isLoading || !inputMessage.trim() || !user}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-600 text-black font-medium rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Send className="h-4 w-4" />
                      <span>Send</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
                          <MessageCircle className="h-6 w-6 text-yellow-400" />
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">Login Required</h3>
                      <p className="text-gray-400 mb-4">
                        Please login to start chatting with our AI assistant and get personalized college recommendations.
                      </p>
                      <button
                        onClick={() => window.location.href = '/login'}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-medium rounded-lg transition-colors"
                      >
                        Login to Chat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Lightbulb className="h-5 w-5 text-yellow-400 mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.query)}
                    disabled={!user}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      user 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggested Questions */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Suggested Questions</h3>
              <div className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(question)}
                    disabled={!user}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                      user 
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                        : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">What I can help with:</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Find colleges by stream</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Compare college fees</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Course information</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Eligibility criteria</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>College ratings & reviews</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
