import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Filter,
  Search,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import applicationService from '../../services/applicationService';

const ViewApplications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0
  });
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const response = await applicationService.getApplications();
      if (response.success) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await applicationService.getApplicationStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleAcceptApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to accept this application?')) {
      return;
    }

    setProcessing(true);
    try {
      const response = await applicationService.acceptApplication(applicationId, reviewNotes);
      if (response.success) {
        toast.success('Application accepted successfully');
        setShowModal(false);
        setReviewNotes('');
        fetchApplications();
        fetchStats();
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('Failed to accept application');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectApplication = async (applicationId) => {
    if (!window.confirm('Are you sure you want to reject this application?')) {
      return;
    }

    setProcessing(true);
    try {
      const response = await applicationService.rejectApplication(applicationId, reviewNotes);
      if (response.success) {
        toast.success('Application rejected successfully');
        setShowModal(false);
        setReviewNotes('');
        fetchApplications();
        fetchStats();
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Failed to reject application');
    } finally {
      setProcessing(false);
    }
  };

  const openApplicationModal = async (applicationId) => {
    try {
      const response = await applicationService.getApplicationById(applicationId);
      if (response.success) {
        setSelectedApplication(response.data);
        setShowModal(true);
        setReviewNotes(response.data.review_notes || '');
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
      toast.error('Failed to load application details');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/20';
      case 'accepted':
        return 'bg-green-500/20 text-green-400 border-green-400/20';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border-red-400/20';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesFilter = filter === 'all' || app.status === filter;
    const matchesSearch = searchTerm === '' || 
      app.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.application_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="h-16" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">View Applications</h1>
              <p className="text-gray-400">Manage student applications for your college courses</p>
            </div>
            <button
              onClick={() => navigate('/college/dashboard')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Applications</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-white">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Accepted</p>
                <p className="text-2xl font-bold text-white">{stats.accepted}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-white">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name, course, or application number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Applications ({filteredApplications.length})</h2>
          
          <div className="space-y-4">
            {filteredApplications.length > 0 ? (
              filteredApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-6 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                  <div className="flex items-center space-x-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-black" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-white font-medium">{application.student.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="capitalize">{application.status}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>{application.application_number}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>{application.course.name} - {application.course.stream}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Applied: {formatDate(application.applied_at)}</span>
                        </div>
                      </div>
                      {application.academic_info && (
                        <div className="mt-2 text-sm text-gray-400">
                          <span className="font-medium">Academic: </span>
                          {application.academic_info.percentage}% - {application.academic_info.board} ({application.academic_info.year_of_passing})
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openApplicationModal(application.id)}
                      className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4 text-white" />
                    </button>
                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowModal(true);
                            setReviewNotes('');
                          }}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApplication(application);
                            setShowModal(true);
                            setReviewNotes('');
                          }}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">No applications found</h3>
                <p className="text-gray-500">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Applications will appear here when students apply to your courses'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Application Details Modal */}
        {showModal && selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Application Details</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Student Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Users className="h-5 w-5 text-yellow-400 mr-2" />
                      Student Information
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-black font-bold text-lg">
                            {selectedApplication.student.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{selectedApplication.student.name}</p>
                          <p className="text-gray-400 text-sm">{selectedApplication.application_number}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Mail className="h-4 w-4" />
                          <span>{selectedApplication.student.email}</span>
                        </div>
                        {selectedApplication.student.phone && (
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Phone className="h-4 w-4" />
                            <span>{selectedApplication.student.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Course Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <GraduationCap className="h-5 w-5 text-yellow-400 mr-2" />
                      Course Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Course:</span>
                        <span className="text-white">{selectedApplication.course.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Stream:</span>
                        <span className="text-white">{selectedApplication.course.stream}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Duration:</span>
                        <span className="text-white">{selectedApplication.course.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fees:</span>
                        <span className="text-white">₹{selectedApplication.course.fees?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Academic & Personal Information */}
                <div className="space-y-6">
                  {/* Academic Information */}
                  {selectedApplication.academic_info && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <FileText className="h-5 w-5 text-yellow-400 mr-2" />
                        Academic Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Percentage:</span>
                          <span className="text-white">{selectedApplication.academic_info.percentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Board:</span>
                          <span className="text-white">{selectedApplication.academic_info.board}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Year of Passing:</span>
                          <span className="text-white">{selectedApplication.academic_info.year_of_passing}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Personal Information */}
                  {selectedApplication.personal_info && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <MapPin className="h-5 w-5 text-yellow-400 mr-2" />
                        Personal Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        {selectedApplication.personal_info.address && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Address:</span>
                            <span className="text-white text-right max-w-xs">{selectedApplication.personal_info.address}</span>
                          </div>
                        )}
                        {selectedApplication.personal_info.phone && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Phone:</span>
                            <span className="text-white">{selectedApplication.personal_info.phone}</span>
                          </div>
                        )}
                        {selectedApplication.personal_info.father_name && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Father's Name:</span>
                            <span className="text-white">{selectedApplication.personal_info.father_name}</span>
                          </div>
                        )}
                        {selectedApplication.personal_info.mother_name && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Mother's Name:</span>
                            <span className="text-white">{selectedApplication.personal_info.mother_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Application Status */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <Calendar className="h-5 w-5 text-yellow-400 mr-2" />
                      Application Status
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(selectedApplication.status)}`}>
                          {getStatusIcon(selectedApplication.status)}
                          <span className="capitalize">{selectedApplication.status}</span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Applied At:</span>
                        <span className="text-white">{formatDate(selectedApplication.applied_at)}</span>
                      </div>
                      {selectedApplication.reviewed_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Reviewed At:</span>
                          <span className="text-white">{formatDate(selectedApplication.reviewed_at)}</span>
                        </div>
                      )}
                      {selectedApplication.reviewer && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Reviewed By:</span>
                          <span className="text-white">{selectedApplication.reviewer.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Notes */}
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-white mb-4">Review Notes</h4>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add review notes (optional)..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === 'pending' && (
                <div className="flex space-x-4 mt-8">
                  <button
                    onClick={() => handleAcceptApplication(selectedApplication.id)}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                  >
                    {processing ? 'Processing...' : 'Accept Application'}
                  </button>
                  <button
                    onClick={() => handleRejectApplication(selectedApplication.id)}
                    disabled={processing}
                    className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium"
                  >
                    {processing ? 'Processing...' : 'Reject Application'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewApplications;
