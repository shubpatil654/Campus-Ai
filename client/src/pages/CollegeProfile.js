import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collegeService } from '../services/collegeService';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Calendar, 
  Award, 
  Star, 
  Users, 
  BookOpen, 
  Save, 
  Edit3, 
  Camera,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  DollarSign,
  Clock,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const CollegeProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [collegeData, setCollegeData] = useState({
    name: '',
    description: '',
    location: '',
    address: '',
    latitude: '',
    longitude: '',
    website: '',
    phone: '',
    email: '',
    established_year: '',
    accreditation: '',
    rating: 0,
    total_ratings: 0,
    logo_url: '',
    banner_url: '',
    facilities: [],
    is_active: true
  });

  const [facilities, setFacilities] = useState([]);
  const [newFacility, setNewFacility] = useState('');

  // Available facilities options
  const facilityOptions = [
    'WiFi', 'Library', 'Laboratory', 'Sports Complex', 'Cafeteria', 'Hostel',
    'Transportation', 'Medical Facility', 'Computer Lab', 'Auditorium',
    'Gymnasium', 'Swimming Pool', 'Playground', 'Parking', 'Security',
    'ATM', 'Bank', 'Post Office', 'Bookstore', 'Career Counseling'
  ];

  // College type options
  const collegeTypeOptions = [
    'Government',
    'Private',
    'Deemed University',
    'Autonomous',
    'Aided'
  ];

  const handleInputChange = (field, value) => {
    setCollegeData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFacilityAdd = () => {
    if (newFacility.trim() && !facilities.includes(newFacility.trim())) {
      setFacilities(prev => [...prev, newFacility.trim()]);
      setNewFacility('');
    }
  };

  const handleFacilityRemove = (facility) => {
    setFacilities(prev => prev.filter(f => f !== facility));
  };

  const handleFacilityToggle = (facility, checked) => {
    if (checked) {
      if (!facilities.includes(facility)) {
        setFacilities(prev => [...prev, facility]);
      }
    } else {
      setFacilities(prev => prev.filter(f => f !== facility));
    }
  };

  useEffect(() => {
    const fetchCollegeData = async () => {
      if (user && user.role === 'college_admin') {
        try {
          setIsInitialLoading(true);
          const response = await collegeService.getCollegeProfile();
          const college = response.data;
          
          // Update college data with fetched data
          setCollegeData(prev => ({
            ...prev,
            name: college.name || '',
            description: college.description || '',
            location: college.location || '',
            address: college.address || '',
            latitude: college.latitude || '',
            longitude: college.longitude || '',
            website: college.website || '',
            phone: college.phone || '',
            email: college.email || '',
            established_year: college.established_year || '',
            accreditation: college.accreditation || '',
            rating: college.rating || 0,
            total_ratings: college.total_ratings || 0,
            logo_url: college.logo_url || '',
            banner_url: college.banner_url || '',
            facilities: college.facilities || [],
            is_active: college.is_active || true
          }));
          
          // Set facilities from college data
          setFacilities(college.facilities || []);
        } catch (error) {
          console.error('Error fetching college data:', error);
          
          // Check if it's a "no college found" error
          if (error.response?.data?.message?.includes('No college found for this admin')) {
            toast.error('No college associated with your account. Please contact support.');
          } else {
            toast.error('Failed to load college data');
          }
          
          // Fallback to user data if college data fetch fails
          setCollegeData(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || ''
          }));
          setFacilities(['WiFi', 'Library', 'Laboratory']);
        } finally {
          setIsInitialLoading(false);
        }
      }
    };

    fetchCollegeData();
  }, [user]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!collegeData.name || !collegeData.name.trim()) {
      newErrors.name = 'College name is required';
    }
    
    if (!collegeData.description || !collegeData.description.trim()) {
      newErrors.description = 'College description is required';
    }
    
    if (!collegeData.location || !collegeData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!collegeData.address || !collegeData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (collegeData.email && !emailRegex.test(collegeData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (collegeData.phone && collegeData.phone.trim()) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(collegeData.phone.trim())) {
        newErrors.phone = 'Please enter a valid 10-digit mobile number';
      }
    }
    
    
    // Year validation
    if (collegeData.established_year) {
      const year = parseInt(collegeData.established_year);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1800 || year > currentYear) {
        newErrors.established_year = 'Please enter a valid establishment year';
      }
    }
    
    // Latitude validation
    if (collegeData.latitude && (isNaN(collegeData.latitude) || collegeData.latitude < -90 || collegeData.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    // Longitude validation
    if (collegeData.longitude && (isNaN(collegeData.longitude) || collegeData.longitude < -180 || collegeData.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSave = async () => {
    if (!validateForm()) {
      const errorMessages = Object.values(errors);
      if (errorMessages.length > 0) {
        toast.error(`Please fix the following errors: ${errorMessages.join(', ')}`);
      } else {
        toast.error('Please fix the errors before saving');
      }
      return;
    }

    setIsLoading(true);
    try {
      // Update facilities in college data
      const updatedData = {
        ...collegeData,
        facilities: facilities
      };
      
      // Call API to update college profile
      const response = await collegeService.updateCollegeProfile(updatedData);
      
      setIsEditing(false);
      setErrors({});
      toast.success('College profile updated successfully!');
    } catch (error) {
      console.error('College profile update error:', error);
      
      // Check if it's a "no college found" error
      if (error.response?.data?.message?.includes('No college found for this admin')) {
        toast.error('No college associated with your account. Please contact support to associate your account with a college.');
      } else if (error.response?.data?.message) {
        // Show the specific validation error message
        toast.error(error.response.data.message);
      } else {
        toast.error(error.message || 'Failed to update college profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onCancel = () => {
    // Reset to original data
    if (user) {
      setCollegeData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
    setIsEditing(false);
    setErrors({});
  };

  // Show loading spinner while fetching initial data
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <Navbar />
      <div className="h-16" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                  {collegeData.logo_url ? (
                    <img 
                      src={collegeData.logo_url} 
                      alt="College Logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-12 h-12 text-black" />
                  )}
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="college-logo-input"
                    />
                    <label
                      htmlFor="college-logo-input"
                      className="absolute bottom-0 right-0 bg-gray-700 hover:bg-gray-600 p-2 rounded-full border-2 border-gray-800 transition-colors cursor-pointer"
                    >
                      <Camera className="h-4 w-4 text-yellow-400" />
                    </label>
                  </>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {collegeData.name || 'College Profile'}
                </h1>
                <p className="text-gray-300 mb-2">
                  {collegeData.location || 'College Administration'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {collegeData.email}
                  </span>
                  {collegeData.phone && (
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {collegeData.phone}
                    </span>
                  )}
                  {collegeData.location && (
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {collegeData.location}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-yellow-400 font-bold">{collegeData.rating || 0}</span>
                    <span className="text-gray-400 text-sm ml-1">({collegeData.total_ratings || 0} reviews)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing && (
                <button
                  onClick={onSave}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
              <button
                onClick={isEditing ? onCancel : () => setIsEditing(true)}
                disabled={isLoading}
                className="bg-gray-700 text-white font-bold px-6 py-3 rounded-lg hover:bg-gray-600 transition-all duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit3 className="h-5 w-5 mr-2" />
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Building2 className="h-5 w-5 text-yellow-400 mr-2" /> Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">College Name *</label>
                  <input 
                    type="text" 
                    value={collegeData.name} 
                    onChange={(e) => handleInputChange('name', e.target.value)} 
                    disabled={!isEditing} 
                    className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 disabled:opacity-60 ${
                      errors.name 
                        ? 'border-red-400 focus:ring-red-400' 
                        : 'border-yellow-400/20 focus:ring-yellow-400'
                    }`} 
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Description *</label>
                  <textarea 
                    rows={4} 
                    value={collegeData.description} 
                    onChange={(e) => handleInputChange('description', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="Brief description of your college..."
                    className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 disabled:opacity-60 ${
                      errors.description 
                        ? 'border-red-400 focus:ring-red-400' 
                        : 'border-yellow-400/20 focus:ring-yellow-400'
                    }`} 
                  />
                  {errors.description && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Phone</label>
                    <input 
                      type="tel" 
                      value={collegeData.phone} 
                      onChange={(e) => handleInputChange('phone', e.target.value)} 
                      disabled={!isEditing} 
                      placeholder="10-digit mobile number"
                      className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 disabled:opacity-60 ${
                        errors.phone 
                          ? 'border-red-400 focus:ring-red-400' 
                          : 'border-yellow-400/20 focus:ring-yellow-400'
                      }`} 
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Email</label>
                    <input 
                      type="email" 
                      value={collegeData.email} 
                      disabled 
                      className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 opacity-60" 
                    />
                    <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Website</label>
                  <input 
                    type="url" 
                    value={collegeData.website} 
                    onChange={(e) => handleInputChange('website', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="https://www.college.edu"
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                  />
                </div>
              </div>
            </div>

            {/* College Details */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <GraduationCap className="h-5 w-5 text-yellow-400 mr-2" /> College Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Established Year</label>
                    <input 
                      type="number" 
                      value={collegeData.established_year} 
                      onChange={(e) => handleInputChange('established_year', e.target.value)} 
                      disabled={!isEditing} 
                      placeholder="e.g., 2001"
                      min="1800"
                      max={new Date().getFullYear()}
                      className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 disabled:opacity-60 ${
                        errors.established_year 
                          ? 'border-red-400 focus:ring-red-400' 
                          : 'border-yellow-400/20 focus:ring-yellow-400'
                      }`} 
                    />
                    {errors.established_year && (
                      <p className="text-red-400 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.established_year}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Total Students</label>
                    <input 
                      type="number" 
                      value={collegeData.totalStudents} 
                      onChange={(e) => handleInputChange('totalStudents', e.target.value)} 
                      disabled={!isEditing} 
                      placeholder="e.g., 5000"
                      min="0"
                      className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Faculty Count</label>
                    <input 
                      type="number" 
                      value={collegeData.facultyCount} 
                      onChange={(e) => handleInputChange('facultyCount', e.target.value)} 
                      disabled={!isEditing} 
                      placeholder="e.g., 200"
                      min="0"
                      className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Courses Offered</label>
                  <textarea 
                    rows={3} 
                    value={collegeData.courses} 
                    onChange={(e) => handleInputChange('courses', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="List the courses offered (e.g., Engineering, Medicine, Arts, Commerce, etc.)"
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Accreditation & Affiliations</label>
                  <textarea 
                    rows={2} 
                    value={collegeData.accreditation} 
                    onChange={(e) => handleInputChange('accreditation', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="e.g., NAAC, NBA, UGC, AICTE, etc."
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Location & Address */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <MapPin className="h-5 w-5 text-yellow-400 mr-2" /> Location & Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Full Address *</label>
                  <textarea 
                    rows={3} 
                    value={collegeData.address} 
                    onChange={(e) => handleInputChange('address', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="Complete address with landmarks..."
                    className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 disabled:opacity-60 ${
                      errors.address 
                        ? 'border-red-400 focus:ring-red-400' 
                        : 'border-yellow-400/20 focus:ring-yellow-400'
                    }`} 
                  />
                  {errors.address && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Location *</label>
                  <input 
                    type="text" 
                    value={collegeData.location} 
                    onChange={(e) => handleInputChange('location', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="e.g., Belagavi, Karnataka"
                    className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 disabled:opacity-60 ${
                      errors.location 
                        ? 'border-red-400 focus:ring-red-400' 
                        : 'border-yellow-400/20 focus:ring-yellow-400'
                    }`} 
                  />
                  {errors.location && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.location}
                    </p>
                  )}
                </div>

                {/* Location Coordinates */}
                <div className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4 mt-4">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-yellow-400" />
                    Location Coordinates (Optional)
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Add precise latitude and longitude coordinates to display your college location on the map. 
                    You can find these coordinates using Google Maps or other mapping services.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Latitude</label>
                      <input 
                        type="number" 
                        value={collegeData.latitude} 
                        onChange={(e) => handleInputChange('latitude', e.target.value)} 
                        disabled={!isEditing} 
                        step="any"
                        min="-90"
                        max="90"
                        placeholder="e.g., 19.0760"
                        className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 disabled:opacity-60 ${
                          errors.latitude 
                            ? 'border-red-400 focus:ring-red-400' 
                            : 'border-yellow-400/20 focus:ring-yellow-400'
                        }`} 
                      />
                      {errors.latitude && (
                        <p className="text-red-400 text-xs mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.latitude}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Longitude</label>
                      <input 
                        type="number" 
                        value={collegeData.longitude} 
                        onChange={(e) => handleInputChange('longitude', e.target.value)} 
                        disabled={!isEditing} 
                        step="any"
                        min="-180"
                        max="180"
                        placeholder="e.g., 72.8777"
                        className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 disabled:opacity-60 ${
                          errors.longitude 
                            ? 'border-red-400 focus:ring-red-400' 
                            : 'border-yellow-400/20 focus:ring-yellow-400'
                        }`} 
                      />
                      {errors.longitude && (
                        <p className="text-red-400 text-xs mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {errors.longitude}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      <strong>Tip:</strong> To find your coordinates, go to Google Maps, search for your college address, 
                      right-click on the location, and select "What's here?" to see the coordinates.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Facilities */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <CheckCircle className="h-5 w-5 text-yellow-400 mr-2" /> Facilities
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Available Facilities</label>
                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                    {facilityOptions.map(facility => (
                      <label key={facility} className="flex items-center space-x-2 text-gray-300 bg-gray-700/40 px-3 py-2 rounded-lg border border-yellow-400/10">
                        <input 
                          type="checkbox" 
                          checked={facilities.includes(facility)} 
                          onChange={(e) => handleFacilityToggle(facility, e.target.checked)} 
                          disabled={!isEditing} 
                          className="accent-yellow-400" 
                        />
                        <span className="text-sm">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>
                {isEditing && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Add Custom Facility</label>
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        value={newFacility} 
                        onChange={(e) => setNewFacility(e.target.value)} 
                        placeholder="Enter facility name"
                        className="flex-1 bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400" 
                      />
                      <button
                        onClick={handleFacilityAdd}
                        className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Selected Facilities</label>
                  <div className="flex flex-wrap gap-2">
                    {facilities.map(facility => (
                      <span key={facility} className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm flex items-center">
                        {facility}
                        {isEditing && (
                          <button
                            onClick={() => handleFacilityRemove(facility)}
                            className="ml-2 text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Statistics */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Star className="h-5 w-5 text-yellow-400 mr-2" /> Status & Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Active Status</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    collegeData.is_active 
                      ? 'bg-green-400/20 text-green-400' 
                      : 'bg-red-400/20 text-red-400'
                  }`}>
                    {collegeData.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Overall Rating</span>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-yellow-400 font-bold">{collegeData.rating || 0}</span>
                    <span className="text-gray-400 text-sm ml-1">/ 5.0</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Reviews</span>
                  <span className="text-yellow-400 font-bold">{collegeData.total_ratings || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Facilities Count</span>
                  <span className="text-yellow-400 font-bold">{facilities.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollegeProfile;
