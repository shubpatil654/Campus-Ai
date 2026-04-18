import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Mail, Phone, MapPin, GraduationCap, Users, Award, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const CollegeRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    collegeName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
    website: '',
    establishedYear: '',
    collegeType: '',
    courses: '',
    facilities: '',
    description: '',
    accreditation: '',
    totalStudents: '',
    facultyCount: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.collegeName.trim()) newErrors.collegeName = 'College name is required';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Pincode validation
    const pincodeRegex = /^\d{6}$/;
    if (formData.pincode && !pincodeRegex.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    // Year validation
    if (formData.establishedYear && (formData.establishedYear < 1800 || formData.establishedYear > new Date().getFullYear())) {
      newErrors.establishedYear = 'Please enter a valid establishment year';
    }

    // Latitude validation
    if (formData.latitude && (isNaN(formData.latitude) || formData.latitude < -90 || formData.latitude > 90)) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    // Longitude validation
    if (formData.longitude && (isNaN(formData.longitude) || formData.longitude < -180 || formData.longitude > 180)) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/colleges/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('College request submitted successfully! We will review and get back to you soon.');
        // Reset form
        setFormData({
          collegeName: '',
          contactPerson: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          state: '',
          pincode: '',
          latitude: '',
          longitude: '',
          website: '',
          establishedYear: '',
          collegeType: '',
          courses: '',
          facilities: '',
          description: '',
          accreditation: '',
          totalStudents: '',
          facultyCount: ''
        });
        // Redirect to home page after successful submission
        setTimeout(() => {
          navigate('/');
        }, 2000); // Wait 2 seconds to show the success message
      } else {
        toast.error(result.message || 'Failed to submit college request');
      }
    } catch (error) {
      console.error('Error submitting college request:', error);
      toast.error('Failed to submit college request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-gradient-to-r from-yellow-400/10 to-orange-500/10 border-b border-yellow-400/20 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Link
              to="/"
              className="inline-flex items-center bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-yellow-400/50 text-gray-300 hover:text-yellow-400 transition-all duration-300 px-4 py-2 rounded-lg mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Building2 className="h-8 w-8 text-black" />
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-white mb-4">
              List Your College
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Join CampusAI and reach thousands of students looking for the perfect college match
            </p>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-3xl shadow-2xl shadow-yellow-400/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Building2 className="h-6 w-6 mr-3 text-yellow-400" />
                Basic Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    College Name *
                  </label>
                  <input
                    type="text"
                    name="collegeName"
                    value={formData.collegeName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all ${
                      errors.collegeName ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter college name"
                  />
                  {errors.collegeName && (
                    <p className="text-red-400 text-sm mt-1">{errors.collegeName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all ${
                      errors.contactPerson ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter contact person name"
                  />
                  {errors.contactPerson && (
                    <p className="text-red-400 text-sm mt-1">{errors.contactPerson}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Mail className="h-6 w-6 mr-3 text-yellow-400" />
                Contact Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all ${
                      errors.phone ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter phone number"
                  />
                  {errors.phone && (
                    <p className="text-red-400 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all"
                  placeholder="https://www.college.edu"
                />
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <MapPin className="h-6 w-6 mr-3 text-yellow-400" />
                Address Information
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all resize-none ${
                    errors.address ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="Enter complete address"
                />
                {errors.address && (
                  <p className="text-red-400 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all ${
                      errors.city ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter city"
                  />
                  {errors.city && (
                    <p className="text-red-400 text-sm mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all ${
                      errors.state ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter state"
                  />
                  {errors.state && (
                    <p className="text-red-400 text-sm mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all ${
                      errors.pincode ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="Enter pincode"
                  />
                  {errors.pincode && (
                    <p className="text-red-400 text-sm mt-1">{errors.pincode}</p>
                  )}
                </div>
              </div>

              {/* Location Coordinates */}
              <div className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-yellow-400" />
                  Location Coordinates (Optional)
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Add precise latitude and longitude coordinates to display your college location on the map. 
                  You can find these coordinates using Google Maps or other mapping services.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      step="any"
                      min="-90"
                      max="90"
                      className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all ${
                        errors.latitude ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="e.g., 19.0760"
                    />
                    {errors.latitude && (
                      <p className="text-red-400 text-sm mt-1">{errors.latitude}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      step="any"
                      min="-180"
                      max="180"
                      className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all ${
                        errors.longitude ? 'border-red-500' : 'border-gray-600'
                      }`}
                      placeholder="e.g., 72.8777"
                    />
                    {errors.longitude && (
                      <p className="text-red-400 text-sm mt-1">{errors.longitude}</p>
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

            {/* College Details */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <GraduationCap className="h-6 w-6 mr-3 text-yellow-400" />
                College Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Established Year
                  </label>
                  <input
                    type="number"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all ${
                      errors.establishedYear ? 'border-red-500' : 'border-gray-600'
                    }`}
                    placeholder="e.g., 1995"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                  {errors.establishedYear && (
                    <p className="text-red-400 text-sm mt-1">{errors.establishedYear}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    College Type
                  </label>
                  <select
                    name="collegeType"
                    value={formData.collegeType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all"
                  >
                    <option value="">Select college type</option>
                    <option value="Government">Government</option>
                    <option value="Private">Private</option>
                    <option value="Deemed University">Deemed University</option>
                    <option value="Autonomous">Autonomous</option>
                    <option value="Aided">Aided</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Total Students
                  </label>
                  <input
                    type="number"
                    name="totalStudents"
                    value={formData.totalStudents}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all"
                    placeholder="e.g., 5000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Faculty Count
                  </label>
                  <input
                    type="number"
                    name="facultyCount"
                    value={formData.facultyCount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all"
                    placeholder="e.g., 200"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Award className="h-6 w-6 mr-3 text-yellow-400" />
                Academic Information
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Courses Offered
                </label>
                <textarea
                  name="courses"
                  value={formData.courses}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all resize-none"
                  placeholder="List the courses offered (e.g., Engineering, Medicine, Arts, Commerce, etc.)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Accreditation & Affiliations
                </label>
                <textarea
                  name="accreditation"
                  value={formData.accreditation}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all resize-none"
                  placeholder="e.g., NAAC, NBA, UGC, AICTE, etc."
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <FileText className="h-6 w-6 mr-3 text-yellow-400" />
                Additional Information
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Facilities
                </label>
                <textarea
                  name="facilities"
                  value={formData.facilities}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all resize-none"
                  placeholder="Describe the facilities available (library, labs, sports, hostel, etc.)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  College Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-transparent transition-all resize-none"
                  placeholder="Provide a brief description about your college, its mission, vision, and what makes it unique"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-8 border-t border-yellow-400/20">
              <button
                type="submit"
                disabled={isLoading}
                className="px-12 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <Building2 className="h-5 w-5" />
                    <span>Submit College Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CollegeRegistration;
