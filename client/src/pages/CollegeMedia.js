import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Upload, 
  Image, 
  FileText, 
  Trash2, 
  Edit3, 
  Eye,
  Download,
  X,
  Save,
  AlertCircle,
  Camera,
  File,
  FolderOpen
} from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import mediaService from '../services/mediaService';

const CollegeMedia = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [activeTab, setActiveTab] = useState('images');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState('image');
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'gallery',
    file: null
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});

  const mediaCategories = {
    images: [
      { value: 'gallery', label: 'College Gallery' },
      { value: 'campus', label: 'Campus Photos' },
      { value: 'classrooms', label: 'Classrooms' },
      { value: 'library', label: 'Library' },
      { value: 'laboratory', label: 'Laboratories' },
      { value: 'sports', label: 'Sports Facilities' },
      { value: 'hostel', label: 'Hostel' },
      { value: 'cafeteria', label: 'Cafeteria' },
      { value: 'events', label: 'Events' }
    ],
    documents: [
      { value: 'brochure', label: 'College Brochure' },
      { value: 'prospectus', label: 'Prospectus' },
      { value: 'admission_form', label: 'Admission Form' },
      { value: 'fee_structure', label: 'Fee Structure' },
      { value: 'syllabus', label: 'Syllabus' },
      { value: 'certificate', label: 'Certificates' },
      { value: 'other', label: 'Other Documents' }
    ]
  };

  const acceptedFileTypes = {
    image: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  };

  const maxFileSize = {
    image: 5 * 1024 * 1024, // 5MB
    document: 10 * 1024 * 1024 // 10MB
  };

  useEffect(() => {
    fetchMediaItems();
  }, []);

  useEffect(() => {
    filterMediaItems();
  }, [mediaItems, activeTab]);

  const fetchMediaItems = async () => {
    try {
      setIsLoading(true);
      const response = await mediaService.getMediaItems();
      if (response.success) {
        setMediaItems(response.data);
      } else {
        toast.error('Failed to load media items');
      }
    } catch (error) {
      console.error('Error fetching media items:', error);
      toast.error('Failed to load media items');
    } finally {
      setIsLoading(false);
    }
  };

  const filterMediaItems = () => {
    const filtered = mediaItems.filter(item => {
      if (activeTab === 'images') {
        return item.type === 'image';
      } else if (activeTab === 'documents') {
        return item.type === 'document';
      }
      return true;
    });
    setFilteredMedia(filtered);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = acceptedFileTypes[uploadType];
    if (!validTypes.includes(file.type)) {
      toast.error(`Invalid file type. Please select a ${uploadType} file.`);
      return;
    }

    // Validate file size
    if (file.size > maxFileSize[uploadType]) {
      const maxSizeMB = maxFileSize[uploadType] / (1024 * 1024);
      toast.error(`File size too large. Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    setUploadData(prev => ({ ...prev, file }));

    // Create preview for images
    if (uploadType === 'image') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleInputChange = (field, value) => {
    setUploadData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!uploadData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!uploadData.file) {
      newErrors.file = 'Please select a file';
    }

    if (uploadType === 'document' && !uploadData.description.trim()) {
      newErrors.description = 'Description is required for documents';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before uploading');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', uploadData.title);
      formData.append('description', uploadData.description);
      formData.append('category', uploadData.category);
      formData.append('type', uploadType);
      formData.append('file', uploadData.file);

      await mediaService.uploadMedia(formData);
      toast.success(`${uploadType === 'image' ? 'Image' : 'Document'} uploaded successfully`);
      
      setShowUploadModal(false);
      resetUploadForm();
      fetchMediaItems();
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error('Failed to upload media');
    }
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this media item?')) {
      return;
    }

    try {
      await mediaService.deleteMedia(mediaId);
      toast.success('Media item deleted successfully');
      fetchMediaItems();
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Failed to delete media item');
    }
  };

  const resetUploadForm = () => {
    setUploadData({
      title: '',
      description: '',
      category: 'gallery',
      file: null
    });
    setPreviewUrl(null);
    setErrors({});
  };

  const handleCancel = () => {
    setShowUploadModal(false);
    resetUploadForm();
  };

  const getFileIcon = (type, category) => {
    if (type === 'image') {
      return <Image className="h-8 w-8 text-blue-400" />;
    } else {
      switch (category) {
        case 'brochure':
        case 'prospectus':
          return <FileText className="h-8 w-8 text-green-400" />;
        case 'admission_form':
        case 'fee_structure':
          return <File className="h-8 w-8 text-yellow-400" />;
        default:
          return <FileText className="h-8 w-8 text-gray-400" />;
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
              <h1 className="text-3xl font-bold text-white mb-2">Media Management</h1>
              <p className="text-gray-400">Manage images, brochures, and documents for your college profile</p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-medium py-2 px-4 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Upload Media</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 mb-8">
          <div className="flex space-x-1 bg-gray-700/50 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('images')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'images'
                  ? 'bg-yellow-400 text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Camera className="h-4 w-4" />
              <span>Images ({mediaItems.filter(item => item.type === 'image').length})</span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'documents'
                  ? 'bg-yellow-400 text-black font-medium'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FolderOpen className="h-4 w-4" />
              <span>Documents ({mediaItems.filter(item => item.type === 'document').length})</span>
            </button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
          {filteredMedia.length === 0 ? (
            <div className="text-center py-12">
              {activeTab === 'images' ? (
                <Camera className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              ) : (
                <FolderOpen className="h-16 w-16 text-gray-500 mx-auto mb-4" />
              )}
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                No {activeTab} found
              </h3>
              <p className="text-gray-500">
                Start by uploading your first {activeTab === 'images' ? 'image' : 'document'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMedia.map((item) => (
                <div key={item.id} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(item.type, item.category)}
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-sm line-clamp-1">
                          {item.title}
                        </h3>
                        <p className="text-gray-400 text-xs">
                          {mediaCategories[item.type]?.find(cat => cat.value === item.category)?.label || item.category}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => window.open(item.url, '_blank')}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-300 p-1"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {item.type === 'image' && (
                    <div className="mb-3">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {item.description && (
                    <p className="text-gray-400 text-xs mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(item.file_size)}</span>
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Upload Media</h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                {/* Upload Type Selection */}
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Media Type</label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setUploadType('image')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                        uploadType === 'image'
                          ? 'bg-yellow-400 text-black font-medium'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <Camera className="h-4 w-4" />
                      <span>Image</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadType('document')}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-colors ${
                        uploadType === 'document'
                          ? 'bg-yellow-400 text-black font-medium'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                      <span>Document</span>
                    </button>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Select File *</label>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept={acceptedFileTypes[uploadType].join(',')}
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  {errors.file && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.file}
                    </p>
                  )}
                </div>

                {/* Preview */}
                {previewUrl && uploadType === 'image' && (
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Preview</label>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Title *</label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.title ? 'border-red-400 focus:ring-red-400' : 'border-yellow-400/20 focus:ring-yellow-400'
                    }`}
                    placeholder="Enter media title"
                  />
                  {errors.title && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Category</label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full bg-gray-700/50 border border-yellow-400/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  >
                    {mediaCategories[uploadType]?.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-gray-400 text-sm mb-1">
                    Description {uploadType === 'document' ? '*' : ''}
                  </label>
                  <textarea
                    value={uploadData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className={`w-full bg-gray-700/50 border text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                      errors.description ? 'border-red-400 focus:ring-red-400' : 'border-yellow-400/20 focus:ring-yellow-400'
                    }`}
                    placeholder={`Enter ${uploadType} description`}
                  />
                  {errors.description && (
                    <p className="text-red-400 text-xs mt-1 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
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
                    <Upload className="h-4 w-4" />
                    <span>Upload</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollegeMedia;

