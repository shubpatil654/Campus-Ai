import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  Image, 
  FileText, 
  Plus, 
  Trash2, 
  Eye, 
  Edit3,
  X,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';
import mediaService from '../../services/mediaService';

const ManageMedia = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentForm, setDocumentForm] = useState({
    title: '',
    file: null,
    description: ''
  });

  // Separate media items by category and type
  const images = mediaItems.filter(item => item.type === 'image' && item.category === 'gallery');
  const brochures = mediaItems.filter(item => item.category === 'brochure');
  const documents = mediaItems.filter(item => item.category === 'document');

  useEffect(() => {
    fetchMediaItems();
  }, []);

  const fetchMediaItems = async () => {
    try {
      setIsLoading(true);
      const response = await mediaService.getMediaItems();
      if (response.success) {
        setMediaItems(response.data);
      }
    } catch (error) {
      console.error('Error fetching media items:', error);
      toast.error('Failed to load media items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Check if adding these files would exceed the 9 image limit
    const currentImageCount = images.length;
    const totalAfterUpload = currentImageCount + files.length;
    
    if (totalAfterUpload > 9) {
      const remainingSlots = 9 - currentImageCount;
      if (remainingSlots <= 0) {
        toast.error('Maximum 9 images allowed. Please delete some images before uploading new ones.');
        return;
      } else {
        toast.error(`You can only upload ${remainingSlots} more image(s). Maximum 9 images allowed.`);
        return;
      }
    }

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'image');
        formData.append('category', 'gallery');
        formData.append('title', file.name.split('.')[0]);
        formData.append('description', 'College gallery image');

        const response = await mediaService.uploadMedia(formData);
        if (response.success) {
          toast.success(`${file.name} uploaded successfully`);
        }
      }
      fetchMediaItems();
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  const handleBrochureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if adding this file would exceed the 3 brochure limit
    if (brochures.length >= 3) {
      toast.error('Maximum 3 brochures allowed. Please delete some brochures before uploading new ones.');
      return;
    }

    // Determine file type based on MIME type
    const isImage = file.type.startsWith('image/');
    const fileType = isImage ? 'image' : 'document';

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', fileType);
      formData.append('category', 'brochure');
      formData.append('title', file.name.split('.')[0]);
      formData.append('description', 'College brochure');

      const response = await mediaService.uploadMedia(formData);
      if (response.success) {
        toast.success('Brochure uploaded successfully');
        fetchMediaItems();
      }
    } catch (error) {
      console.error('Error uploading brochure:', error);
      toast.error('Failed to upload brochure');
    } finally {
      setUploading(false);
    }
  };

  const handleDocumentUpload = async () => {
    if (!documentForm.file || !documentForm.title.trim()) {
      toast.error('Please provide both title and file');
      return;
    }

    // Check if adding this file would exceed the 5 document limit
    if (documents.length >= 5) {
      toast.error('Maximum 5 documents allowed. Please delete some documents before uploading new ones.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', documentForm.file);
      formData.append('type', 'document');
      formData.append('category', 'document');
      formData.append('title', documentForm.title);
      formData.append('description', documentForm.description);

      const response = await mediaService.uploadMedia(formData);
      if (response.success) {
        toast.success('Document uploaded successfully');
        setShowDocumentModal(false);
        setDocumentForm({ title: '', file: null, description: '' });
        fetchMediaItems();
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Are you sure you want to delete this media item?')) {
      return;
    }

    try {
      const response = await mediaService.deleteMedia(mediaId);
      if (response.success) {
        toast.success('Media item deleted successfully');
        fetchMediaItems();
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Failed to delete media item');
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
              <h1 className="text-3xl font-bold text-white mb-2">Manage Media</h1>
              <p className="text-gray-400">Upload and manage your college images, brochures, and documents</p>
            </div>
            <button
              onClick={() => navigate('/college/dashboard')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Section - Image Upload */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Image className="h-6 w-6 text-yellow-400 mr-2" />
                  College Images
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {images.length}/9 images uploaded
                </p>
              </div>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading || images.length >= 9}
                />
                <button
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    uploading || images.length >= 9
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
                  } text-black font-medium`}
                  disabled={uploading || images.length >= 9}
                >
                  {uploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>{uploading ? 'Uploading...' : 'Upload Images'}</span>
                </button>
              </div>
            </div>

            {/* Image Gallery */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {images.length > 0 ? (
                images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                      <button
                        onClick={() => window.open(image.url, '_blank')}
                        className="p-1 bg-white rounded-full hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="h-4 w-4 text-gray-800" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedia(image.id)}
                        className="p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                    <div className="absolute bottom-1 left-1 right-1">
                      <p className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded truncate">
                        {image.title}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <Image className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No images uploaded yet</p>
                  <p className="text-gray-500 text-sm">Upload images to showcase your college</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Brochure Upload */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center">
                  <FileText className="h-6 w-6 text-yellow-400 mr-2" />
                  College Brochure
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {brochures.length}/3 brochures uploaded
                </p>
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleBrochureUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading || brochures.length >= 3}
                />
                <button
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    uploading || brochures.length >= 3
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
                  } text-black font-medium`}
                  disabled={uploading || brochures.length >= 3}
                >
                  {uploading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span>{uploading ? 'Uploading...' : 'Upload Brochure'}</span>
                </button>
              </div>
            </div>

            {/* Brochure List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {brochures.length > 0 ? (
                brochures.map((brochure) => (
                  <div key={brochure.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      {brochure.type === 'image' ? (
                        <img
                          src={brochure.url}
                          alt={brochure.title}
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-red-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{brochure.title}</p>
                        <p className="text-gray-400 text-sm">{formatFileSize(brochure.file_size)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => window.open(brochure.url, '_blank')}
                        className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4 text-white" />
                      </button>
                      <button
                        onClick={() => handleDeleteMedia(brochure.id)}
                        className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No brochures uploaded yet</p>
                  <p className="text-gray-500 text-sm">Upload images, PDFs, or documents as your college brochure</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Other Documents Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center">
                <FileText className="h-6 w-6 text-yellow-400 mr-2" />
                Other Documents
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {documents.length}/5 documents uploaded
              </p>
            </div>
            <button
              onClick={() => setShowDocumentModal(true)}
              disabled={documents.length >= 5}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                documents.length >= 5
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
              } text-black font-medium`}
            >
              <Plus className="h-4 w-4" />
              <span>Upload Document</span>
            </button>
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            {documents.length > 0 ? (
              documents.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{document.title}</p>
                      <p className="text-gray-400 text-sm">{formatFileSize(document.file_size)}</p>
                      {document.description && (
                        <p className="text-gray-500 text-xs">{document.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => window.open(document.url, '_blank')}
                      className="p-2 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4 text-white" />
                    </button>
                    <button
                      onClick={() => handleDeleteMedia(document.id)}
                      className="p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No documents uploaded yet</p>
                <p className="text-gray-500 text-sm">Upload additional documents like certificates, policies, etc.</p>
              </div>
            )}
          </div>
        </div>

        {/* Document Upload Modal */}
        {showDocumentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Upload Document</h3>
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    value={documentForm.title}
                    onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                    placeholder="Enter document title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={documentForm.description}
                    onChange={(e) => setDocumentForm({ ...documentForm, description: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                    placeholder="Enter document description (optional)"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select File *
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => setDocumentForm({ ...documentForm, file: e.target.files[0] })}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-400 file:text-black hover:file:bg-yellow-500"
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => setShowDocumentModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDocumentUpload}
                    disabled={uploading || !documentForm.file || !documentForm.title.trim()}
                    className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                      uploading || !documentForm.file || !documentForm.title.trim()
                        ? 'bg-gray-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
                    } text-black font-medium`}
                  >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMedia;
