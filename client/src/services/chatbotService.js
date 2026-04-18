import api from './api';

class ChatbotService {
  // Send message to chatbot
  async sendMessage(message) {
    try {
      const response = await api.post('/chatbot/chat', { message });
      return response.data;
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please login again.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Please check your permissions.');
      } else if (error.response?.status === 404) {
        throw new Error('Chatbot service not found. Please try again later.');
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.');
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error('Network error. Please check your connection.');
      }
      
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  }

  // Get chat history
  async getChatHistory(limit = 20, offset = 0) {
    try {
      const response = await api.get(`/chatbot/history?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch chat history');
    }
  }

  // Get suggested questions
  getSuggestedQuestions() {
    return [
      "What colleges offer Computer Science Engineering?",
      "Show me engineering colleges in Bangalore",
      "Which colleges have fees under 1 lakh?",
      "Tell me about RLS Institute of Technology",
      "What courses are available in Information Science?",
      "List all colleges with good ratings",
      "Which colleges offer hostel facilities?",
      "What are the eligibility criteria for engineering courses?"
    ];
  }

  // Get quick action buttons
  getQuickActions() {
    return [
      { label: "Engineering Colleges", query: "Show me engineering colleges" },
      { label: "Science Stream", query: "What colleges have science stream?" },
      { label: "Low Fees", query: "Colleges with fees under 1 lakh" },
      { label: "High Rated", query: "Top rated colleges" },
      { label: "Computer Science", query: "Computer Science Engineering colleges" },
      { label: "Electronics", query: "Electronics and Communication colleges" }
    ];
  }
}

export default new ChatbotService();
