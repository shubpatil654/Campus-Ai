import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye,
  BookOpen,
  Users,
  Calendar,
  GraduationCap,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import courseService from '../services/courseService';

const CollegeCourses = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStream, setFilterStream] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    stream: '',
    duration: '',
    fees: '',
    seats_available: '',
    eligibility_criteria: '',
    syllabus: ''
  });
  const [errors, setErrors] = useState({});

  const streamOptions = [
    'Science',
    'Commerce',
    'Arts'
  ];

  const durationOptions = [
    '2 Years'
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, filterStream]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await courseService.getCourses();
      if (response.success) {
        setCourses(response.data);
      } else {
        toast.error('Failed to load courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.stream.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStream) {
      filtered = filtered.filter(course => course.stream === filterStream);
    }

    setFilteredCourses(filtered);
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Course name is required';
    if (!formData.stream) newErrors.stream = 'Stream is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (!formData.fees || formData.fees <= 0) newErrors.fees = 'Valid fees amount is required';
    if (!formData.seats_available || formData.seats_available <= 0) newErrors.seats_available = 'Valid seats count is required';
    if (!formData.eligibility_criteria.trim()) newErrors.eligibility_criteria = 'Eligibility criteria is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      if (editingCourse) {
        await courseService.updateCourse(editingCourse.id, formData);
        toast.success('Course updated successfully');
      } else {
        await courseService.addCourse(formData);
        toast.success('Course added successfully');
      }

      setShowAddForm(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to save course');
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      name: course.name,
      stream: course.stream,
      duration: course.duration,
      fees: course.fees,
      seats_available: course.seats_available,
      eligibility_criteria: course.eligibility_criteria,
      syllabus: course.syllabus
    });
    setShowAddForm(true);
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      await courseService.deleteCourse(courseId);
      toast.success('Course deleted successfully');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      stream: '',
      duration: '',
      fees: '',
      seats_available: '',
      eligibility_criteria: '',
      syllabus: ''
    });
    setErrors({});
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingCourse(null);
    resetForm();
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
              <h1 className="text-3xl font-bold text-white mb-2">PUC Course Management</h1>
              <p className="text-gray-400">Manage your PUC (10+2) courses - Science, Commerce & Arts</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-medium py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Course</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
            <div className="md:w-64">
              <select
                value={filterStream}
                onChange={(e) => setFilterStream(e.target.value)}
                className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">All Streams</option>
                {streamOptions.map(stream => (
                  <option key={stream} value={stream}>{stream}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Add/Edit Course Form */}
        {showAddForm && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingCourse ? 'Edit Course' : 'Add New Course'}
              </h2>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Course Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.name ? 'border-red-400 focus:ring-red-400' : 'border-yellow-400/20 focus:ring-yellow-400'
                    }`}
                    placeholder="e.g., PUC Science - PCMB, PUC Commerce, PUC Arts"
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Stream *</label>
                  <select
                    value={formData.stream}
                    onChange={(e) => handleInputChange('stream', e.target.value)}
                    className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.stream ? 'border-red-400 focus:ring-red-400' : 'border-yellow-400/20 focus:ring-yellow-400'
                    }`}
                  >
                    <option value="">Select stream</option>
                    {streamOptions.map(stream => (
                      <option key={stream} value={stream}>{stream}</option>
                    ))}
                  </select>
                  {errors.stream && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.stream}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Duration *</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.duration ? 'border-red-400 focus:ring-red-400' : 'border-yellow-400/20 focus:ring-yellow-400'
                    }`}
                  >
                    <option value="">Select duration</option>
                    {durationOptions.map(duration => (
                      <option key={duration} value={duration}>{duration}</option>
                    ))}
                  </select>
                  {errors.duration && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.duration}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Fees per Year (₹) *</label>
                  <input
                    type="number"
                    value={formData.fees}
                    onChange={(e) => handleInputChange('fees', e.target.value)}
                    className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.fees ? 'border-red-400 focus:ring-red-400' : 'border-yellow-400/20 focus:ring-yellow-400'
                    }`}
                    placeholder="Enter fees per year"
                    min="0"
                    step="1"
                  />
                  {errors.fees && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.fees}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Seats Available *</label>
                  <input
                    type="number"
                    value={formData.seats_available}
                    onChange={(e) => handleInputChange('seats_available', e.target.value)}
                    className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.seats_available ? 'border-red-400 focus:ring-red-400' : 'border-yellow-400/20 focus:ring-yellow-400'
                    }`}
                    placeholder="Enter number of seats"
                    min="1"
                    step="1"
                  />
                  {errors.seats_available && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.seats_available}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-1">Eligibility Criteria *</label>
                  <textarea
                    value={formData.eligibility_criteria}
                    onChange={(e) => handleInputChange('eligibility_criteria', e.target.value)}
                    rows={3}
                    className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.eligibility_criteria ? 'border-red-400 focus:ring-red-400' : 'border-yellow-400/20 focus:ring-yellow-400'
                    }`}
                    placeholder="e.g., 10th Standard with minimum 60% marks"
                  />
                  {errors.eligibility_criteria && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.eligibility_criteria}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-1">Subjects</label>
                <textarea
                  value={formData.syllabus}
                  onChange={(e) => handleInputChange('syllabus', e.target.value)}
                  rows={4}
                  className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  placeholder="e.g., Physics, Chemistry, Mathematics, Biology, English, Kannada"
                />
              </div>


              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-medium rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{editingCourse ? 'Update Course' : 'Add Course'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Courses List */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Courses ({filteredCourses.length})</h2>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">No courses found</h3>
              <p className="text-gray-500">Start by adding your first course</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredCourses.map((course) => (
                <div key={course.id} className="bg-gray-700/50 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white mb-1">{course.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-1" />
                          {course.stream}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {course.duration}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="text-yellow-400 hover:text-yellow-300 p-1"
                        title="Edit course"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-300">{course.seats_available} seats</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 font-bold">₹</span>
                      <span className="text-sm text-gray-300">{course.fees.toLocaleString()}/year</span>
                    </div>
                  </div>

                  <div className="text-sm text-gray-400 mb-4">
                    <p className="line-clamp-2">{course.eligibility_criteria}</p>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollegeCourses;
