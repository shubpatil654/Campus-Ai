import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import { collegeService } from '../services/collegeService';
import mediaService from '../services/mediaService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import LeafletMap from '../components/LeafletMap';
import { 
  MapPin, 
  Star, 
  Phone, 
  Mail, 
  Globe, 
  Calendar,
  Users,
  Award,
  GraduationCap,
  Shield,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
  Clock,
  DollarSign,
  UserCheck,
  Building,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Library,
  Home
} from 'lucide-react';
import toast from 'react-hot-toast';

const CollegeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    name: '',
    email: '',
    phone: '',
    tenthPercentage: '',
    interestedStream: '',
    hostelRequired: false,
    neetCoaching: false,
    cetCoaching: false
  });

  // Fetch college details
  const { data: college, isLoading, error } = useQuery(
    ['college', id],
    () => collegeService.getCollegeById(id),
    {
      enabled: !!id,
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  // Check if college is in favorites when user and college data are available
  // Fetch college media (images, brochures)
  const { data: mediaData, isLoading: mediaLoading } = useQuery(
    ['collegeMedia', id],
    () => mediaService.getCollegeMedia(id),
    {
      enabled: !!id,
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  const media = mediaData || [];
  const images = media.filter(item => item.type === 'image' && item.category === 'gallery');
  const brochures = media.filter(item => item.category === 'brochure');

  // Handle image modal navigation
  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle favorite toggle
  // Handle brochure download
  const downloadBrochure = (brochure) => {
    const link = document.createElement('a');
    link.href = brochure.url;
    link.download = brochure.title || 'college-brochure';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download started');
  };

  // Handle application form input changes
  const handleApplicationInputChange = (field, value) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle application form submission
  const handleApplicationSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!applicationData.name || !applicationData.email || !applicationData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!applicationData.tenthPercentage || applicationData.tenthPercentage < 0 || applicationData.tenthPercentage > 100) {
      toast.error('Please enter a valid 10th percentage (0-100)');
      return;
    }

    try {
      // Here you would typically send the application to your backend
      // For now, we'll just show a success message
      console.log('Application Data:', {
        ...applicationData,
        collegeId: college.id,
        collegeName: college.name,
        appliedAt: new Date().toISOString()
      });
      
      toast.success('Application submitted successfully!');
      setShowApplicationForm(false);
      
      // Reset form
      setApplicationData({
        name: '',
        email: '',
        phone: '',
        tenthPercentage: '',
        interestedStream: '',
        hostelRequired: false,
        neetCoaching: false,
        cetCoaching: false
      });
    } catch (error) {
      toast.error('Failed to submit application. Please try again.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-700 rounded"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-32 bg-gray-700 rounded"></div>
                <div className="h-48 bg-gray-700 rounded"></div>
              </div>
              <div className="space-y-6">
                <div className="h-48 bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-6 text-center">
            <h1 className="text-2xl font-bold text-red-400 mb-4">College Not Found</h1>
            <p className="text-gray-300 mb-6">
              The college you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/colleges')}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300"
            >
              Back to Colleges
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!college) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/colleges')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="h-5 w-5" />
          Back to Colleges
        </button>

        {/* College Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* College Logo/Image */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-4xl">
                  {college.name.charAt(0)}
                </span>
              </div>
            </div>

            {/* College Info */}
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">{college.name}</h1>
                  <div className="flex items-center gap-4 text-gray-300 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-5 w-5 text-yellow-400" />
                      <span>{college.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-5 w-5 text-yellow-400" />
                      <span>Est. {college.established_year}</span>
                    </div>
                  </div>
                  {college.description && (
                    <p className="text-gray-400 text-lg leading-relaxed">
                      {college.description}
                    </p>
                  )}
                </div>

                {/* Rating and Actions */}
                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-4 py-2">
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                    <span className="text-white font-semibold">
                      {college.rating || 'N/A'}
                    </span>
                    <span className="text-gray-400 text-sm">
                      ({college.total_ratings || 0} reviews)
                    </span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setShowApplicationForm(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 font-medium"
                    >
                      <UserCheck className="h-5 w-5" />
                      <span>Apply Now</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Eye className="h-6 w-6 text-yellow-400" />
                  College Gallery
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      onClick={() => {
                        setSelectedImageIndex(index);
                        setShowImageModal(true);
                      }}
                      className="aspect-square bg-gray-700 rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 relative group"
                      title={image.title || `College Image ${index + 1}`}
                    >
                      <img
                        src={image.url}
                        alt={image.title || `College image ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Hover overlay with image name */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                        <div className="p-3 w-full">
                          <p className="text-white text-sm font-medium truncate">
                            {image.title || `Image ${index + 1}`}
                          </p>
                          {image.description && (
                            <p className="text-gray-300 text-xs mt-1 line-clamp-2">
                              {image.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Courses */}
            {college.courses && college.courses.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-yellow-400" />
                  Available Courses
                </h2>
                <div className="space-y-4">
                  {college.courses.map((course) => (
                    <div
                      key={course.id}
                      className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-6 hover:border-yellow-400/30 transition-all duration-300"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">
                            {course.name}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                            <div className="flex items-center gap-1">
                              <GraduationCap className="h-4 w-4 text-yellow-400" />
                              <span>{course.stream}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-yellow-400" />
                              <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-yellow-400" />
                              <span>{course.seats_available} seats</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1 text-lg font-semibold text-yellow-400">
                            <span>₹{course.fees?.toLocaleString()}</span>
                          </div>
                          {course.eligibility_criteria && (
                            <div className="text-sm text-gray-400">
                              Eligibility: {course.eligibility_criteria}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities */}
            {college.facilities && college.facilities.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Building className="h-6 w-6 text-yellow-400" />
                  Facilities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {college.facilities.map((facility, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-gray-700/30 rounded-lg p-3"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                        {facility.toLowerCase().includes('library') && <Library className="h-4 w-4 text-white" />}
                        {facility.toLowerCase().includes('wifi') && <Wifi className="h-4 w-4 text-white" />}
                        {facility.toLowerCase().includes('transport') && <Car className="h-4 w-4 text-white" />}
                        {facility.toLowerCase().includes('cafeteria') && <Utensils className="h-4 w-4 text-white" />}
                        {facility.toLowerCase().includes('sports') && <Dumbbell className="h-4 w-4 text-white" />}
                        {!facility.toLowerCase().includes('library') && 
                         !facility.toLowerCase().includes('wifi') && 
                         !facility.toLowerCase().includes('transport') && 
                         !facility.toLowerCase().includes('cafeteria') && 
                         !facility.toLowerCase().includes('sports') && 
                         <Building className="h-4 w-4 text-white" />}
                      </div>
                      <span className="text-gray-300 font-medium">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* College Location Map */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-yellow-400" />
                College Location
              </h2>
              <div className="h-64 rounded-xl overflow-hidden">
                <LeafletMap
                  center={college.latitude && college.longitude ? [college.latitude, college.longitude] : [15.3173, 75.7139]}
                  zoom={college.latitude && college.longitude ? 15 : 10}
                  markers={college.latitude && college.longitude ? [{
                    position: [college.latitude, college.longitude],
                    title: college.name,
                    description: college.address || college.location
                  }] : []}
                />
              </div>
              {college.address && (
                <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-yellow-400 mt-1 flex-shrink-0" />
                    <div>
                      <div className="text-white font-medium">Address</div>
                      <div className="text-gray-300 text-sm">{college.address}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-yellow-400" />
                Contact Information
              </h3>
              <div className="space-y-3">
                {college.phone && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Phone className="h-4 w-4 text-yellow-400" />
                    <span>{college.phone}</span>
                  </div>
                )}
                {college.email && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Mail className="h-4 w-4 text-yellow-400" />
                    <span>{college.email}</span>
                  </div>
                )}
                {college.website && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Globe className="h-4 w-4 text-yellow-400" />
                    <a
                      href={college.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-yellow-400 transition-colors"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                {college.address && (
                  <div className="flex items-start gap-3 text-gray-300">
                    <MapPin className="h-4 w-4 text-yellow-400 mt-1" />
                    <span>{college.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Brochures */}
            {brochures.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Download className="h-5 w-5 text-yellow-400" />
                  Download Brochures
                </h3>
                <div className="space-y-3">
                  {brochures.map((brochure) => (
                    <div
                      key={brochure.id}
                      className="flex items-center justify-between bg-gray-700/30 rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Download className="h-4 w-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-white font-medium truncate">
                            {brochure.title || 'College Brochure'}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {brochure.type?.toUpperCase() || 'PDF'}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => downloadBrochure(brochure)}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-lg hover:shadow-lg transition-all duration-300 text-sm font-medium flex-shrink-0 ml-3"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* College Stats */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-400" />
                College Information
              </h3>
              <div className="space-y-3">
                {college.accreditation && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <Shield className="h-4 w-4 text-yellow-400" />
                    <span>Accreditation: {college.accreditation}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-gray-300">
                  <Calendar className="h-4 w-4 text-yellow-400" />
                  <span>Established: {college.established_year}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <UserCheck className="h-4 w-4 text-yellow-400" />
                  <span>Status: {college.is_verified ? 'Verified' : 'Unverified'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && images.length > 0 && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <img
              src={images[selectedImageIndex]?.url}
              alt={images[selectedImageIndex]?.title || `College image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            {/* Image info overlay */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-center max-w-md">
              <p className="font-medium text-sm">
                {images[selectedImageIndex]?.title || `Image ${selectedImageIndex + 1}`}
              </p>
              {images[selectedImageIndex]?.description && (
                <p className="text-xs text-gray-300 mt-1">
                  {images[selectedImageIndex].description}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {selectedImageIndex + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Application Form Modal */}
      {showApplicationForm && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-yellow-400" />
                  Apply to {college?.name}
                </h2>
                <button
                  onClick={() => setShowApplicationForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleApplicationSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={applicationData.name}
                        onChange={(e) => handleApplicationInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={applicationData.email}
                        onChange={(e) => handleApplicationInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                        placeholder="Enter your email"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={applicationData.phone}
                        onChange={(e) => handleApplicationInputChange('phone', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        10th Percentage *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={applicationData.tenthPercentage}
                        onChange={(e) => handleApplicationInputChange('tenthPercentage', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                        placeholder="Enter your 10th percentage"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Academic Preferences
                  </h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Interested Stream
                    </label>
                    <select
                      value={applicationData.interestedStream}
                      onChange={(e) => handleApplicationInputChange('interestedStream', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                    >
                      <option value="">Select your interested stream</option>
                      <option value="Science">Science</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Arts">Arts</option>
                    </select>
                  </div>
                </div>

                {/* Additional Services */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Additional Services
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="hostelRequired"
                        checked={applicationData.hostelRequired}
                        onChange={(e) => handleApplicationInputChange('hostelRequired', e.target.checked)}
                        className="mr-3 w-4 h-4 rounded border-gray-500/50 bg-gray-600/50 text-yellow-400 focus:ring-yellow-400/50 focus:ring-2"
                      />
                      <label htmlFor="hostelRequired" className="text-gray-300 flex items-center">
                        <Home className="h-4 w-4 mr-2 text-yellow-400" />
                        Hostel accommodation required
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="neetCoaching"
                        checked={applicationData.neetCoaching}
                        onChange={(e) => handleApplicationInputChange('neetCoaching', e.target.checked)}
                        className="mr-3 w-4 h-4 rounded border-gray-500/50 bg-gray-600/50 text-yellow-400 focus:ring-yellow-400/50 focus:ring-2"
                      />
                      <label htmlFor="neetCoaching" className="text-gray-300 flex items-center">
                        <GraduationCap className="h-4 w-4 mr-2 text-yellow-400" />
                        NEET coaching required
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="cetCoaching"
                        checked={applicationData.cetCoaching}
                        onChange={(e) => handleApplicationInputChange('cetCoaching', e.target.checked)}
                        className="mr-3 w-4 h-4 rounded border-gray-500/50 bg-gray-600/50 text-yellow-400 focus:ring-yellow-400/50 focus:ring-2"
                      />
                      <label htmlFor="cetCoaching" className="text-gray-300 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-yellow-400" />
                        CET coaching required
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationForm(false)}
                    className="flex-1 px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 font-medium"
                  >
                    Submit Application
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollegeDetails;