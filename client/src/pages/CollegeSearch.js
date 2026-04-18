import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { collegeService } from '../services/collegeService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { 
  Search, 
  MapPin, 
  Star, 
  Filter, 
  BookOpen, 
  Users, 
  Award,
  Home,
  GraduationCap,
  Shield,
  Wifi,
  Car,
  Utensils,
  Dumbbell,
  Library,
  SortAsc,
  SortDesc,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const CollegeSearch = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    stream: '',
    minRating: '',
    maxFees: '',
    minFees: '',
    collegeType: '',
    accreditation: '',
    facilities: '',
    hasHostel: false,
    hasScholarship: false,
    sortBy: 'rating',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Fetch colleges with filters
  const { data: collegesData, isLoading, error, refetch } = useQuery(
    ['colleges', filters],
    () => collegeService.getAllColleges(filters),
    {
      keepPreviousData: true,
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  const colleges = collegesData || [];

  // Search functionality
  const { data: searchResults, isLoading: searchLoading } = useQuery(
    ['collegeSearch', searchTerm],
    () => collegeService.searchColleges(searchTerm),
    {
      enabled: searchTerm.length > 2,
      keepPreviousData: true,
      retry: 1,
      refetchOnWindowFocus: false
    }
  );

  const displayedColleges = searchTerm.length > 2 ? (searchResults || []) : colleges;

  // Filter options
  const streams = ['Science', 'Commerce', 'Arts'];
  const collegeTypes = ['Government', 'Private', 'Autonomous', 'Deemed'];
  const accreditations = ['NAAC A++', 'NAAC A+', 'NAAC A', 'NAAC B++', 'NAAC B+', 'NAAC B'];
  const facilities = ['Library', 'Laboratory', 'Sports', 'Hostel', 'Cafeteria', 'WiFi', 'Transport'];
  
  const sortOptions = [
    { value: 'rating', label: 'Rating' },
    { value: 'name', label: 'Name' },
    { value: 'location', label: 'Location' },
    { value: 'established_year', label: 'Established Year' }
  ];

  // Clear filters
  const clearFilters = () => {
    setFilters({
      location: '',
      stream: '',
      minRating: '',
      maxFees: '',
      minFees: '',
      collegeType: '',
      accreditation: '',
      facilities: '',
      hasHostel: false,
      hasScholarship: false,
      sortBy: 'rating',
      sortOrder: 'desc'
    });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.stream) count++;
    if (filters.minRating) count++;
    if (filters.maxFees) count++;
    if (filters.minFees) count++;
    if (filters.collegeType) count++;
    if (filters.accreditation) count++;
    if (filters.facilities) count++;
    if (filters.hasHostel) count++;
    if (filters.hasScholarship) count++;
    return count;
  };

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-white mb-4">College Search</h1>
          <div className="text-red-400">
            Error loading colleges: {error.message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 space-y-6">
        {/* Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <h1 className="text-3xl font-bold text-white mb-2">Find Your Perfect College</h1>
          <p className="text-gray-400">
            Discover colleges that match your preferences and goals
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1 relative max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search colleges by name, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white hover:bg-gray-600/50 hover:border-yellow-400/50 transition-all duration-300 relative"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              {getActiveFiltersCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {getActiveFiltersCount()}
                </span>
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Advanced Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-gray-400 hover:text-yellow-400 text-sm flex items-center gap-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Belagavi, Bangalore"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                  />
                </div>

                {/* Stream Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <BookOpen className="h-4 w-4 inline mr-1" />
                    Stream
                  </label>
                  <select
                    value={filters.stream}
                    onChange={(e) => handleFilterChange('stream', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                  >
                    <option value="">All Streams</option>
                    {streams.map(stream => (
                      <option key={stream} value={stream}>{stream}</option>
                    ))}
                  </select>
                </div>

                {/* College Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <GraduationCap className="h-4 w-4 inline mr-1" />
                    College Type
                  </label>
                  <select
                    value={filters.collegeType}
                    onChange={(e) => handleFilterChange('collegeType', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                  >
                    <option value="">All Types</option>
                    {collegeTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Accreditation Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Accreditation
                  </label>
                  <select
                    value={filters.accreditation}
                    onChange={(e) => handleFilterChange('accreditation', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                  >
                    <option value="">All Accreditations</option>
                    {accreditations.map(acc => (
                      <option key={acc} value={acc}>{acc}</option>
                    ))}
                  </select>
                </div>

                {/* Min Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Star className="h-4 w-4 inline mr-1" />
                    Min Rating
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) => handleFilterChange('minRating', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                  >
                    <option value="">Any Rating</option>
                    <option value="4.5">4.5+ Stars</option>
                    <option value="4.0">4.0+ Stars</option>
                    <option value="3.5">3.5+ Stars</option>
                    <option value="3.0">3.0+ Stars</option>
                  </select>
                </div>

                {/* Min Fees Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Fees (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 50000"
                    value={filters.minFees}
                    onChange={(e) => handleFilterChange('minFees', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                  />
                </div>

                {/* Max Fees Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Fees (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 200000"
                    value={filters.maxFees}
                    onChange={(e) => handleFilterChange('maxFees', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                  />
                </div>

                {/* Facilities Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Wifi className="h-4 w-4 inline mr-1" />
                    Facilities
                  </label>
                  <select
                    value={filters.facilities}
                    onChange={(e) => handleFilterChange('facilities', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                  >
                    <option value="">All Facilities</option>
                    {facilities.map(facility => (
                      <option key={facility} value={facility}>{facility}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Checkbox Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasHostel"
                    checked={filters.hasHostel}
                    onChange={(e) => handleFilterChange('hasHostel', e.target.checked)}
                    className="mr-3 w-4 h-4 rounded border-gray-500/50 bg-gray-600/50 text-yellow-400 focus:ring-yellow-400/50 focus:ring-2"
                  />
                  <label htmlFor="hasHostel" className="text-gray-300 flex items-center">
                    <Home className="h-4 w-4 mr-1" />
                    Has Hostel
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasScholarship"
                    checked={filters.hasScholarship}
                    onChange={(e) => handleFilterChange('hasScholarship', e.target.checked)}
                    className="mr-3 w-4 h-4 rounded border-gray-500/50 bg-gray-600/50 text-yellow-400 focus:ring-yellow-400/50 focus:ring-2"
                  />
                  <label htmlFor="hasScholarship" className="text-gray-300 flex items-center">
                    <Award className="h-4 w-4 mr-1" />
                    Has Scholarship
                  </label>
                </div>
              </div>

              {/* Sort Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sort Order
                  </label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-600/50 border border-gray-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/50 transition-all duration-300"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-600/50">
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 font-medium"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center">
            <p className="text-gray-300 font-medium">
              {isLoading || searchLoading ? 'Loading...' : `${displayedColleges.length} colleges found`}
            </p>
            {getActiveFiltersCount() > 0 && (
              <div className="text-sm text-gray-400 bg-gray-700/50 px-3 py-1 rounded-lg">
                {getActiveFiltersCount()} filter{getActiveFiltersCount() !== 1 ? 's' : ''} applied
              </div>
            )}
          </div>
        </div>

        {/* Colleges Grid */}
        {isLoading || searchLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 animate-pulse shadow-xl">
                <div className="h-48 bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : displayedColleges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
            {displayedColleges.map((college) => (
              <div key={college.id} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-yellow-400/10 hover:border-yellow-400/30 transition-all duration-300 transform hover:scale-[1.02] group">
                {/* College Image */}
                <div className="h-48 bg-gradient-to-br from-yellow-400/20 via-orange-500/20 to-yellow-400/20 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-orange-500/10"></div>
                  <div className="text-center text-white relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                      <span className="text-black font-bold text-2xl">{college.name.charAt(0)}</span>
                    </div>
                    <div className="text-sm opacity-90 font-medium px-4">{college.name}</div>
                  </div>
                </div>

                {/* College Info */}
                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-xl font-semibold text-white line-clamp-2 group-hover:text-yellow-400 transition-colors">
                      {college.name}
                    </h3>
                    
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-4 w-4 mr-2 text-yellow-400" />
                      <span className="text-sm">{college.location}</span>
                    </div>

                    {college.description && (
                      <p className="text-gray-400 text-sm line-clamp-2">
                        {college.description}
                      </p>
                    )}

                    {/* Rating */}
                    <div className="flex items-center">
                      <div className="flex items-center bg-gray-700/50 rounded-lg px-3 py-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-white font-medium ml-1 text-sm">{college.rating || 'N/A'}</span>
                        <span className="text-gray-400 text-xs ml-1">({college.total_ratings || 0})</span>
                      </div>
                    </div>
                  </div>

                  {/* College Type & Accreditation */}
                  <div className="space-y-2">
                    {college.college_type && (
                      <div className="flex items-center text-sm bg-gray-700/30 rounded-lg px-3 py-2">
                        <GraduationCap className="h-4 w-4 text-yellow-400 mr-2" />
                        <span className="text-gray-300">{college.college_type}</span>
                      </div>
                    )}
                    {college.accreditation && (
                      <div className="flex items-center text-sm bg-gray-700/30 rounded-lg px-3 py-2">
                        <Shield className="h-4 w-4 text-yellow-400 mr-2" />
                        <span className="text-gray-300">{college.accreditation}</span>
                      </div>
                    )}
                    {college.established_year && (
                      <div className="flex items-center text-sm bg-gray-700/30 rounded-lg px-3 py-2">
                        <Award className="h-4 w-4 text-yellow-400 mr-2" />
                        <span className="text-gray-300">Est. {college.established_year}</span>
                      </div>
                    )}
                  </div>

                  {/* Courses */}
                  {college.courses && college.courses.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-gray-300 text-sm font-medium">Available Courses:</p>
                      <div className="flex flex-wrap gap-2">
                        {college.courses.slice(0, 3).map((course, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-300 text-xs rounded-full border border-yellow-400/30"
                          >
                            {course.stream}
                          </span>
                        ))}
                        {college.courses.length > 3 && (
                          <span className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full border border-gray-600">
                            +{college.courses.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Facilities */}
                  {college.facilities && college.facilities.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-gray-300 text-sm font-medium">Facilities:</p>
                      <div className="flex flex-wrap gap-2">
                        {college.facilities.slice(0, 3).map((facility, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-green-400/20 to-emerald-500/20 text-green-300 text-xs rounded-full border border-green-400/30"
                          >
                            {facility}
                          </span>
                        ))}
                        {college.facilities.length > 3 && (
                          <span className="px-3 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full border border-gray-600">
                            +{college.facilities.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end pt-4 border-t border-gray-700/50">
                    <a
                      href={`/colleges/${college.id}`}
                      className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-lg hover:shadow-lg hover:shadow-yellow-400/25 transition-all duration-300 transform hover:scale-105 text-sm font-medium"
                    >
                      <span>View Details</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-12 text-center mx-4">
            <div className="text-gray-400 mb-6">
              <Search className="h-16 w-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No colleges found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Try adjusting your search terms or filters to find more colleges.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeSearch;
