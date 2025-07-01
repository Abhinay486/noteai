import React, { useState } from 'react';
import { Upload, Image, Loader2, X, FileText, Sparkles } from 'lucide-react';
import axios from "axios";

const ImageUpload = ({ userId, fetchUser }) => {
  const [imageBase64, setImageBase64] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      setImageBase64(base64);
      setPreviewUrl(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };
  const handleUpload = async () => {
    if (!imageBase64) {
      setError('Please upload an image first.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/image-upload`,
        { image: imageBase64 },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { title, correctedContent } = data;

      setResponse({
        title: title || 'Untitled',
        correctedContent: correctedContent || 'No content extracted.',
      });
    } catch (err) {
      console.error('Upload failed:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };




  const clearImage = () => {
    setImageBase64(null);
    setPreviewUrl(null);
    setResponse(null);
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result.split(',')[1];
        setImageBase64(base64);
        setPreviewUrl(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };
  const handleNewAdd = async () => {
    if (!response) return;
    const { title, correctedContent } = response;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/notes/${userId}/newnote`,
        { title, content: correctedContent },
        {
          credentials: "include",
          withCredentials: true,
        }
      );
      if (fetchUser) await fetchUser();
      // Optionally clear state or show a success message here
    } catch (error) {
      console.error("Failed to add note:", error.response?.data || error.message);
    }
  }
  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50 py-8 px-4 font-['Inter',system-ui,sans-serif]"
      onDragEnter={handleDrag}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/25">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-light text-gray-900 tracking-tight mb-3">
            Image to Notes
          </h1>
          <p className="text-gray-500 text-lg font-light max-w-md mx-auto leading-relaxed">
            Transform your images into structured, readable notes with AI precision
          </p>
        </div>

        {/* Upload Area */}
        <div className="mb-8" onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
          {!previewUrl ? (
            <div
              className={`relative bg-white/70 backdrop-blur-sm rounded-3xl border-2 border-dashed transition-all duration-300 shadow-sm hover:shadow-lg ${dragActive
                  ? 'border-blue-400 bg-blue-50/50 shadow-lg shadow-blue-500/10'
                  : 'border-gray-200 hover:border-gray-300'
                }`}
            >
              <label htmlFor="file-upload" className="block cursor-pointer">
                <div className="px-8 py-16 text-center">
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-all duration-300 ${dragActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                      }`}
                  >
                    <Upload className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-800 mb-2">
                    {dragActive ? 'Drop your image here' : 'Upload an image'}
                  </h3>
                  <p className="text-gray-500 mb-4 font-light">Drag and drop or click to browse</p>
                  <p className="text-sm text-gray-400 font-light">
                    Supports PNG, JPG, JPEG • Max 10MB
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
              </label>
            </div>
          ) : (
            <div className="relative bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="relative group">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-96 object-cover rounded-2xl shadow-md hover:scale-[1.02] transition-transform duration-300"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-200 group-hover:opacity-100 opacity-75"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={loading || !imageBase64}
          className={`w-full py-4 px-8 rounded-2xl text-lg font-medium transition-all duration-300 shadow-sm ${loading || !imageBase64
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md active:scale-[0.98]'
            }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-3" />
              Processing with AI...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <FileText className="w-5 h-5 mr-3" />
              Create Notes
            </div>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 text-red-600 rounded-2xl shadow-sm font-light">
            {error}
          </div>
        )}

        {/* AI Response */}
        {response && (
          <div className="mt-12 space-y-6 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-light text-gray-800 mb-2">Your Notes</h2>
              <p className="text-gray-500 font-light">AI-powered extraction and formatting</p>
            </div>

            <div className="space-y-6">
              {/* Title Section */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-medium text-gray-800">Title</h3>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100/50">
                  <p className="text-gray-700 font-light text-lg leading-relaxed">
                    {response.title}
                  </p>
                </div>
              </div>

              {/* Content Section */}
              <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-medium text-gray-800">Content</h3>
                </div>
                <div className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100/50">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed font-light">
                    {response.correctedContent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {response && (
          <div className="flex justify-center mt-10">
            <button
              onClick={handleNewAdd}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-lg font-semibold shadow-lg hover:from-blue-700 hover:to-blue-600 hover:shadow-xl active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              <Sparkles className="w-6 h-6 text-white animate-pulse" />
              Add This Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
