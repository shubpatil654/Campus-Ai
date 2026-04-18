import React, { useState } from 'react';
import {
  Bot,
  MessageSquare,
  Settings,
  BarChart3,
  Users,
  Clock,
  Star,
  Search,
  Filter,
  Play,
  Pause,
  RotateCcw,
  Plus,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

const AdminChatbot = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with real data from API
  const chatbotStats = {
    totalSessions: 1247,
    activeUsers: 89,
    averageRating: 4.6,
    responseTime: '2.3s',
    uptime: '99.9%'
  };

  const recentSessions = [
    {
      id: 1,
      user: 'John Doe',
      message: 'What are the best engineering colleges in Mumbai?',
      response: 'Here are the top engineering colleges in Mumbai...',
      rating: 5,
      timestamp: '2 minutes ago',
      status: 'completed'
    },
    {
      id: 2,
      user: 'Jane Smith',
      message: 'How do I apply for medical courses?',
      response: 'To apply for medical courses, you need to...',
      rating: 4,
      timestamp: '15 minutes ago',
      status: 'completed'
    },
    {
      id: 3,
      user: 'Mike Johnson',
      message: 'What is the admission process for IIT?',
      response: 'The IIT admission process involves...',
      rating: 5,
      timestamp: '1 hour ago',
      status: 'completed'
    }
  ];

  const chatbotConfigs = [
    {
      id: 1,
      name: 'College Search Bot',
      status: 'active',
      responses: 1250,
      accuracy: 94.5,
      lastUpdated: '2 hours ago'
    },
    {
      id: 2,
      name: 'Admission Guidance Bot',
      status: 'active',
      responses: 890,
      accuracy: 91.2,
      lastUpdated: '1 day ago'
    },
    {
      id: 3,
      name: 'Course Information Bot',
      status: 'inactive',
      responses: 650,
      accuracy: 88.7,
      lastUpdated: '3 days ago'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'inactive':
        return 'bg-red-500/20 text-red-400';
      case 'completed':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'sessions', name: 'Chat Sessions', icon: MessageSquare },
    { id: 'configs', name: 'Bot Configurations', icon: Settings }
  ];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Chatbot Management</h1>
          <p className="text-gray-400 mt-2">Monitor and manage AI chatbot performance</p>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors">
            <Play className="h-4 w-4" />
            <span>Start All Bots</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 rounded-lg hover:bg-yellow-400/30 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add New Bot</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-yellow-400 text-yellow-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Sessions</p>
                  <p className="text-2xl font-bold text-white mt-2">{chatbotStats.totalSessions.toLocaleString()}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Active Users</p>
                  <p className="text-2xl font-bold text-white mt-2">{chatbotStats.activeUsers}</p>
                </div>
                <Users className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Avg Rating</p>
                  <p className="text-2xl font-bold text-white mt-2">{chatbotStats.averageRating}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Response Time</p>
                  <p className="text-2xl font-bold text-white mt-2">{chatbotStats.responseTime}</p>
                </div>
                <Clock className="h-8 w-8 text-purple-400" />
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Uptime</p>
                  <p className="text-2xl font-bold text-white mt-2">{chatbotStats.uptime}</p>
                </div>
                <Bot className="h-8 w-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Performance chart placeholder */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Performance Overview</h2>
            <div className="h-64 bg-gray-700/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Performance chart will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent w-64"
                  />
                </div>
                <select className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent">
                  <option value="all">All Sessions</option>
                  <option value="completed">Completed</option>
                  <option value="ongoing">Ongoing</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 rounded-lg hover:bg-yellow-400/30 transition-colors">
                  <Filter className="h-4 w-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sessions list */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Response
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {recentSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-black font-bold text-sm">
                              {session.user.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-white">{session.user}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-white max-w-xs truncate">{session.message}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300 max-w-xs truncate">{session.response}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-white">{session.rating}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {session.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-400 hover:text-blue-300">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-yellow-400 hover:text-yellow-300">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'configs' && (
        <div className="space-y-6">
          {/* Bot configurations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {chatbotConfigs.map((config) => (
              <div key={config.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <Bot className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{config.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(config.status)}`}>
                        {config.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-400 hover:text-blue-300">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Responses</span>
                    <span className="text-white text-sm">{config.responses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Accuracy</span>
                    <span className="text-white text-sm">{config.accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Last Updated</span>
                    <span className="text-white text-sm">{config.lastUpdated}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-2">
                  {config.status === 'active' ? (
                    <button className="flex items-center space-x-2 px-3 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors">
                      <Pause className="h-4 w-4" />
                      <span>Pause</span>
                    </button>
                  ) : (
                    <button className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors">
                      <Play className="h-4 w-4" />
                      <span>Start</span>
                    </button>
                  )}
                  <button className="flex items-center space-x-2 px-3 py-2 bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 rounded-lg hover:bg-yellow-400/30 transition-colors">
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatbot;
