import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Target, 
  Award, 
  Save, 
  Edit3, 
  Camera,
  School,
  TrendingUp,
  FileText,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Navbar from '../components/Navbar';
import SubscriptionStatus from '../components/SubscriptionStatus';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile, uploadProfilePicture } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    currentSchool: '',
    currentClass: '10th',
    boardOfStudy: '',
    expectedMarks: '',
    subjects: [],
    interestedStreams: [],
    preferredLocation: '',
    budgetRange: '',
    parentName: '',
    parentPhone: '',
    parentOccupation: '',
    goals: '',
    hobbies: '',
    achievements: '',
    profilePicture: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Available options for dropdowns
  const streamOptions = [
    'Science (PCM)', 'Science (PCB)', 'Commerce', 'Arts/Humanities', 
    'Computer Science', 'All Streams'
  ];

  const boardOptions = [
    'CBSE', 'ICSE', 'Karnataka State Board', 'Maharashtra State Board',
    'Tamil Nadu State Board', 'Other State Board'
  ];

  const budgetOptions = [
    'Under ₹50,000', '₹50,000 - ₹1,00,000', '₹1,00,000 - ₹2,00,000',
    '₹2,00,000 - ₹3,00,000', 'Above ₹3,00,000', 'No Budget Constraint'
  ];

  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English',
    'Hindi', 'Kannada', 'Social Science', 'Computer Science', 'Economics'
  ];

  const handleInputChange = (field, value) => {
    // Auto-format phone numbers
    if (field === 'phone' || field === 'parentPhone') {
      // Remove any non-digit characters
      const digitsOnly = value.replace(/\D/g, '');
      // Limit to 10 digits
      const formattedValue = digitsOnly.slice(0, 10);
      setProfileData(prev => ({
        ...prev,
        [field]: formattedValue
      }));
    } else {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    }
  };

  const handleArrayChange = (field, value, checked) => {
    setProfileData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file);
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      console.log('Setting profile image:', file);
      setProfileImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  };

  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    setProfileData(prev => ({
      ...prev,
      profilePicture: ''
    }));
  };

  useEffect(() => {
    if (!user) return;
    setProfileData(prev => ({
      ...prev,
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      pincode: user.pincode || '',
      currentSchool: user.currentSchool || '',
      currentClass: user.currentClass || '10th',
      boardOfStudy: user.boardOfStudy || '',
      expectedMarks: user.expectedMarks || '',
      subjects: Array.isArray(user.subjects) ? user.subjects : [],
      interestedStreams: Array.isArray(user.interestedStreams) ? user.interestedStreams : [],
      preferredLocation: user.preferredLocation || '',
      budgetRange: user.budgetRange || '',
      parentName: user.parentName || '',
      parentPhone: user.parentPhone || '',
      parentOccupation: user.parentOccupation || '',
      goals: user.goals || '',
      hobbies: user.hobbies || '',
      achievements: user.achievements || '',
      profilePicture: user.profilePicture || ''
    }));
    
    // Set image preview if user has profile picture
    console.log('User profile picture:', user.profilePicture);
    if (user.profilePicture) {
      console.log('Setting image preview to:', user.profilePicture);
      setImagePreview(user.profilePicture);
    } else {
      console.log('No profile picture found, clearing preview');
      setImagePreview(null);
    }
  }, [user?.id, user?.name, user?.phone, user?.dateOfBirth, user?.gender, user?.address, user?.city, user?.state, user?.pincode, user?.currentSchool, user?.currentClass, user?.boardOfStudy, user?.expectedMarks, user?.subjects, user?.interestedStreams, user?.preferredLocation, user?.budgetRange, user?.parentName, user?.parentPhone, user?.parentOccupation, user?.goals, user?.hobbies, user?.achievements, user?.profilePicture]);

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!profileData.name || !profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Phone validation - only validate if phone is provided
    if (profileData.phone && profileData.phone.trim()) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(profileData.phone.trim())) {
        newErrors.phone = 'Please enter a valid 10-digit mobile number starting with 6-9';
      }
    }
    
    // Expected marks validation - only validate if marks are provided
    if (profileData.expectedMarks && profileData.expectedMarks.toString().trim()) {
      const marks = parseFloat(profileData.expectedMarks);
      if (isNaN(marks) || marks < 0 || marks > 100) {
        newErrors.expectedMarks = 'Expected marks must be a number between 0 and 100';
      }
    }
    
    // Parent phone validation - only validate if parent phone is provided
    if (profileData.parentPhone && profileData.parentPhone.trim()) {
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(profileData.parentPhone.trim())) {
        newErrors.parentPhone = 'Please enter a valid 10-digit mobile number starting with 6-9';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSave = async () => {
    if (!validateForm()) {
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        toast.error(`Please fix the following errors: ${errorFields.join(', ')}`);
      } else {
        toast.error('Please fix the errors before saving');
      }
      return;
    }

    setIsLoading(true);
    try {
      // If there's a new image, upload it first
      console.log('Profile image state:', profileImage);
      if (profileImage) {
        console.log('Uploading profile image:', profileImage);
        const uploadResult = await uploadProfilePicture(profileImage);
        console.log('Upload result:', uploadResult);
        
        // Update the profile data with the new image URL
        profileData.profilePicture = uploadResult.profilePictureUrl;
      } else {
        console.log('No profile image to upload');
      }
      
      await updateProfile(profileData);
      setIsEditing(false);
      setErrors({});
      setProfileImage(null); // Clear the temporary image state
      // Success toast is handled by AuthContext
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.message.includes('upload')) {
        toast.error('Failed to upload profile picture: ' + error.message);
      } else {
        toast.error(error.message || 'Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onCancel = () => {
    // Reset to original user data
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        gender: user.gender || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        currentSchool: user.currentSchool || '',
        currentClass: user.currentClass || '10th',
        boardOfStudy: user.boardOfStudy || '',
        expectedMarks: user.expectedMarks || '',
        subjects: Array.isArray(user.subjects) ? user.subjects : [],
        interestedStreams: Array.isArray(user.interestedStreams) ? user.interestedStreams : [],
        preferredLocation: user.preferredLocation || '',
        budgetRange: user.budgetRange || '',
        parentName: user.parentName || '',
        parentPhone: user.parentPhone || '',
        parentOccupation: user.parentOccupation || '',
        goals: user.goals || '',
        hobbies: user.hobbies || '',
        achievements: user.achievements || '',
        profilePicture: user.profilePicture || ''
      }));
      
      // Reset image states
      setProfileImage(null);
      if (user.profilePicture) {
        setImagePreview(user.profilePicture);
      } else {
        setImagePreview(null);
      }
    }
    setIsEditing(false);
    setErrors({});
  };

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
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onLoad={() => console.log('Image loaded successfully:', imagePreview)}
                      onError={(e) => console.error('Image failed to load:', imagePreview, e)}
                    />
                  ) : (
                  <span className="text-black font-bold text-3xl">
                    {profileData.name?.charAt(0) || 'S'}
                  </span>
                  )}
                </div>
                {isEditing && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-picture-input"
                    />
                    <label
                      htmlFor="profile-picture-input"
                      className="absolute bottom-0 right-0 bg-gray-700 hover:bg-gray-600 p-2 rounded-full border-2 border-gray-800 transition-colors cursor-pointer"
                    >
                  <Camera className="h-4 w-4 text-yellow-400" />
                    </label>
                    {imagePreview && (
                      <button
                        onClick={removeImage}
                        className="absolute top-0 right-0 bg-red-600 hover:bg-red-700 p-1 rounded-full text-white text-xs"
                        title="Remove image"
                      >
                        ×
                </button>
                    )}
                    {/* Debug info */}
                    {isEditing && (
                      <div className="absolute -bottom-8 left-0 text-xs text-gray-400">
                        {profileImage ? `File: ${profileImage.name}` : 'No file selected'}
                      </div>
                    )}
                  </>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {profileData.name || 'Student Profile'}
                </h1>
                <p className="text-gray-300 mb-2">Class {profileData.currentClass} Student</p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {profileData.email}
                  </span>
                  {profileData.phone && (
                    <span className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {profileData.phone}
                    </span>
                  )}
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

          {/* Profile Status */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6 mt-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Star className="h-5 w-5 text-yellow-400 mr-2" /> Profile Status
            </h2>
            <div className="space-y-3 text-gray-300">
              <div className="flex justify-between items-center">
                <span>Profile Completion</span>
                <span className="text-yellow-400 font-bold">
                  {(() => {
                    // Define which fields are required for profile completion
                    const requiredFields = [
                      'name', 'phone', 'dateOfBirth', 'gender', 'address', 'city', 'state', 'pincode',
                      'currentSchool', 'currentClass', 'boardOfStudy', 'expectedMarks',
                      'interestedStreams', 'budgetRange', 'subjects',
                      'parentName', 'parentPhone', 'parentOccupation',
                      'goals', 'hobbies', 'achievements'
                    ];
                    
                    const filledFields = requiredFields.filter(field => {
                      const value = profileData[field];
                      if (Array.isArray(value)) {
                        return value.length > 0;
                      }
                      return value && value !== '';
                    });
                    
                    return Math.round((filledFields.length / requiredFields.length) * 100);
                  })()}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Streams Selected</span>
                <span className="text-yellow-400 font-bold">{profileData.interestedStreams.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Subjects Selected</span>
                <span className="text-yellow-400 font-bold">{profileData.subjects.length}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(() => {
                      const requiredFields = [
                        'name', 'phone', 'dateOfBirth', 'gender', 'address', 'city', 'state', 'pincode',
                        'currentSchool', 'currentClass', 'boardOfStudy', 'expectedMarks',
                        'interestedStreams', 'budgetRange', 'subjects',
                        'parentName', 'parentPhone', 'parentOccupation',
                        'goals', 'hobbies', 'achievements'
                      ];
                      
                      const filledFields = requiredFields.filter(field => {
                        const value = profileData[field];
                        if (Array.isArray(value)) {
                          return value.length > 0;
                        }
                        return value && value !== '';
                      });
                      
                      return Math.round((filledFields.length / requiredFields.length) * 100);
                    })()}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Subscription Status - Only for College Admins */}
          {(user?.role === 'college_admin' || user?.role === 'college') && (
            <div className="mt-8">
              <SubscriptionStatus />
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Personal Information */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <User className="h-5 w-5 text-yellow-400 mr-2" /> Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    value={profileData.name} 
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
                  <label className="block text-gray-400 text-sm mb-1">Email</label>
                  <input 
                    type="email" 
                    value={profileData.email} 
                    disabled 
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 opacity-60" 
                  />
                  <p className="text-gray-500 text-xs mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Phone</label>
                  <input 
                    type="tel" 
                    value={profileData.phone} 
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
                  <label className="block text-gray-400 text-sm mb-1">Date of Birth</label>
                  <input 
                    type="date" 
                    value={profileData.dateOfBirth} 
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)} 
                    disabled={!isEditing} 
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Gender</label>
                  <select 
                    value={profileData.gender} 
                    onChange={(e) => handleInputChange('gender', e.target.value)} 
                    disabled={!isEditing} 
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Education */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <GraduationCap className="h-5 w-5 text-yellow-400 mr-2" /> Education
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Current School</label>
                  <input 
                    type="text" 
                    value={profileData.currentSchool} 
                    onChange={(e) => handleInputChange('currentSchool', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="Name of your current school"
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Class</label>
                  <select 
                    value={profileData.currentClass} 
                    onChange={(e) => handleInputChange('currentClass', e.target.value)} 
                    disabled={!isEditing} 
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
                  >
                    {['8th','9th','10th','11th','12th'].map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Board of Study</label>
                  <select 
                    value={profileData.boardOfStudy} 
                    onChange={(e) => handleInputChange('boardOfStudy', e.target.value)} 
                    disabled={!isEditing} 
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
                  >
                    <option value="">Select Board</option>
                    {boardOptions.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Expected Marks (%)</label>
                  <input 
                    type="number" 
                    value={profileData.expectedMarks} 
                    onChange={(e) => handleInputChange('expectedMarks', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="Expected percentage"
                    min="0"
                    max="100"
                    className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 disabled:opacity-60 ${
                      errors.expectedMarks 
                        ? 'border-red-400 focus:ring-red-400' 
                        : 'border-yellow-400/20 focus:ring-yellow-400'
                    }`} 
                  />
                  {errors.expectedMarks && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.expectedMarks}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Parent/Guardian */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <User className="h-5 w-5 text-yellow-400 mr-2" /> Parent/Guardian
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Parent Name</label>
                  <input 
                    type="text" 
                    value={profileData.parentName} 
                    onChange={(e) => handleInputChange('parentName', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="Father/Mother/Guardian name"
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Parent Phone</label>
                  <input 
                    type="tel" 
                    value={profileData.parentPhone} 
                    onChange={(e) => handleInputChange('parentPhone', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="10-digit mobile number"
                    className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 disabled:opacity-60 ${
                      errors.parentPhone 
                        ? 'border-red-400 focus:ring-red-400' 
                        : 'border-yellow-400/20 focus:ring-yellow-400'
                    }`} 
                  />
                  {errors.parentPhone && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.parentPhone}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Occupation</label>
                  <input 
                    type="text" 
                    value={profileData.parentOccupation} 
                    onChange={(e) => handleInputChange('parentOccupation', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="Parent's profession"
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <MapPin className="h-5 w-5 text-yellow-400 mr-2" /> Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-gray-400 text-sm mb-1">Address</label>
                  <input 
                    type="text" 
                    value={profileData.address} 
                    onChange={(e) => handleInputChange('address', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="House number, street, area"
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">City</label>
                  <input 
                    type="text" 
                    value={profileData.city} 
                    onChange={(e) => handleInputChange('city', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="e.g., Belagavi"
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">State</label>
                  <input 
                    type="text" 
                    value={profileData.state} 
                    onChange={(e) => handleInputChange('state', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="e.g., Karnataka"
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Pincode</label>
                  <input 
                    type="text" 
                    value={profileData.pincode} 
                    onChange={(e) => handleInputChange('pincode', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="6-digit pincode"
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">

            {/* College Preferences */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Target className="h-5 w-5 text-yellow-400 mr-2" /> College Preferences
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Interested Streams for 11th</label>
                  <div className="grid grid-cols-1 gap-2">
                    {streamOptions.map(stream => (
                      <label key={stream} className="flex items-center space-x-2 text-gray-300 bg-gray-700/40 px-3 py-2 rounded-lg border border-yellow-400/10">
                        <input 
                          type="checkbox" 
                          checked={profileData.interestedStreams.includes(stream)} 
                          onChange={(e) => handleArrayChange('interestedStreams', stream, e.target.checked)} 
                          disabled={!isEditing} 
                          className="accent-yellow-400" 
                        />
                        <span className="text-sm">{stream}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Budget Range (Annual)</label>
                  <select 
                    value={profileData.budgetRange} 
                    onChange={(e) => handleInputChange('budgetRange', e.target.value)} 
                    disabled={!isEditing} 
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60"
                  >
                    <option value="">Select Budget Range</option>
                    {budgetOptions.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Favorite Subjects</label>
                  <div className="grid grid-cols-1 gap-2">
                    {subjectOptions.map(sub => (
                      <label key={sub} className="flex items-center space-x-2 text-gray-300 bg-gray-700/40 px-3 py-2 rounded-lg border border-yellow-400/10">
                        <input 
                          type="checkbox" 
                          checked={profileData.subjects.includes(sub)} 
                          onChange={(e) => handleArrayChange('subjects', sub, e.target.checked)} 
                          disabled={!isEditing} 
                          className="accent-yellow-400" 
                        />
                        <span className="text-sm">{sub}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Goals & About */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <FileText className="h-5 w-5 text-yellow-400 mr-2" /> Goals & About
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Academic/Career Goals</label>
                  <textarea 
                    rows={3} 
                    value={profileData.goals} 
                    onChange={(e) => handleInputChange('goals', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="What are your career aspirations? What do you want to achieve after 12th?"
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Hobbies & Interests</label>
                  <input 
                    type="text" 
                    value={profileData.hobbies} 
                    onChange={(e) => handleInputChange('hobbies', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="Sports, music, art, reading, etc."
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Achievements</label>
                  <input 
                    type="text" 
                    value={profileData.achievements} 
                    onChange={(e) => handleInputChange('achievements', e.target.value)} 
                    disabled={!isEditing} 
                    placeholder="Awards, competitions, leadership roles, etc."
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400 disabled:opacity-60" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
