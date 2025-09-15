import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { motion } from "framer-motion";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("material"); // material | paper
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null); // Track which file is downloading
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if user is on mobile device
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Mobile-optimized file size limit
  const getMaxFileSize = () => {
    return isMobile() ? 3 * 1024 * 1024 : 10 * 1024 * 1024; // 3MB for mobile, 10MB for desktop
  };

  // Get authentication headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem("admin_token");

    console.log("🔍 Token check:");
    console.log("- Token exists:", !!token);
    console.log(
      "- Token preview:",
      token ? `${token.substring(0, 20)}...` : "null"
    );

    if (!token || token === "null" || token === "undefined") {
      console.error("❌ No valid token found");
      setIsAuthenticated(false);
      return null;
    }

    setIsAuthenticated(true);
    return { Authorization: `Bearer ${token}` };
  };

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token || token === "null" || token === "undefined") {
      console.log("❌ No token found, user needs to login");
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }
    setIsAuthenticated(true);
  }, []);

  // Fetch materials on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const headers = getAuthHeaders();
        if (!headers) {
          setLoading(false);
          return;
        }

        console.log("📡 Fetching materials with headers:", headers);

        const res = await api.get(`/api/admin/materials`, { headers });

        console.log("✅ Materials response:", res.data);

        setUploads(res.data.materials || []); // backend sends { materials: [...] }
      } catch (err) {
        console.error("❌ Error fetching materials:", err);
        console.error("❌ Error response:", err.response?.data);

        if (err.response?.status === 401) {
          console.log("🔄 Token expired or invalid");
          localStorage.removeItem("admin_token");
          setIsAuthenticated(false);
          alert("Your session has expired. Please login again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  // Upload new file
  const handleUpload = async () => {
    if (!file || !title.trim()) {
      alert("Please enter a title and choose a file");
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) {
      alert("Please login first");
      return;
    }

    // Check file size (mobile-optimized limits)
    const maxSize = getMaxFileSize();
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      alert(`File size too large. Please choose a file smaller than ${maxSizeMB}MB${isMobile() ? ' (mobile limit)' : ''}.`);
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload PDF, DOC, DOCX, PPT, PPTX, or TXT files only.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title.trim());
    formData.append("type", type);

    try {
      console.log("📤 Starting upload from mobile/PC:", {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: file.type,
        title: title.trim(),
        uploadType: type,
        isMobileDevice: isMobile(),
        maxAllowedSize: `${(getMaxFileSize() / (1024 * 1024)).toFixed(1)} MB`,
        userAgent: navigator.userAgent.substring(0, 50) + "..."
      });

      setLoading(true);
      
      // Use relative URL for mobile compatibility with optimized settings
      const uploadConfig = {
        headers: {
          ...headers,
          // Let browser set Content-Type for FormData automatically
        },
        timeout: isMobile() ? 180000 : 120000, // 3 minutes for mobile, 2 for desktop
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      };

      if (isMobile()) {
        // Add mobile-specific configuration
        uploadConfig.onUploadProgress = (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`📱 Mobile upload progress: ${percentCompleted}%`);
        };
      }

      const res = await api.post("/api/admin/materials/upload", formData, uploadConfig);

      console.log("✅ Upload response:", res.data);

      if (res.data?.success && res.data?.material) {
        setUploads([res.data.material, ...uploads]);
        setFile(null);
        setTitle("");
        // Reset file input properly
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
        alert("✅ File uploaded successfully!");
      } else {
        console.error("❌ Upload failed - invalid response:", res.data);
        throw new Error(res.data?.message || "Upload failed - invalid server response");
      }
    } catch (err) {
      console.error("❌ Error uploading file:", err);
      
      // Enhanced error logging for mobile debugging
      if (err.response) {
        console.error("❌ Server Error Details:", {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
          headers: err.response.headers
        });
        
        // Handle specific error codes
        if (err.response.status === 401) {
          localStorage.removeItem("admin_token");
          setIsAuthenticated(false);
          alert("❌ Session expired. Please login again.");
        } else if (err.response.status === 413) {
          alert("❌ File too large. Server rejected the upload.");
        } else if (err.response.status === 500) {
          const errorMessage = err.response.data?.message || err.response.data?.error || 'Internal server error';
          console.error("❌ 500 Error Details for debugging:", {
            isMobile: isMobile(),
            fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
            fileType: file.type,
            fileName: file.name,
            serverMessage: errorMessage
          });
          alert(`❌ Server error (500): ${errorMessage}.\n\n${isMobile() ? 'Mobile upload issue detected. Try:\n1. Use a smaller file (under 3MB)\n2. Try a different file format\n3. Check your mobile connection' : 'Try using a smaller file or different format.'}`);
        } else {
          alert(`❌ Upload failed (${err.response.status}): ${err.response.data?.message || err.response.data?.error || err.message}`);
        }
      } else if (err.request) {
        console.error("❌ Network Error:", err.request);
        alert("❌ Network error. Please check your connection and try again.");
      } else {
        console.error("❌ Request Error:", err.message);
        alert(`❌ Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
  if (!material?.fileUrl) {
    alert("No file available to download");
    return;
  }

  try {
    setDownloading(material._id);
    
    // ✅ Direct download using the stored fileUrl
    const link = document.createElement("a");
    link.href = material.fileUrl;
    link.download = material.originalName || material.title || "file";
    link.target = "_blank"; // Open in new tab as fallback
    
    // Add to DOM temporarily
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (err) {
    console.error("❌ Download error:", err);
    alert("Failed to download file");
  } finally {
    setDownloading(null);
  }
};

  // Delete file
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      console.log("🗑️ Deleting file with ID:", id);

      const res = await api.delete(`/api/admin/materials/${id}`, { headers });

      console.log("✅ Delete response:", res.data);

      if (res.data.success) {
        setUploads(uploads.filter((u) => u._id !== id));
        alert("File deleted successfully!");
      }
    } catch (err) {
      console.error("❌ Error deleting file:", err);
      console.error("❌ Delete error response:", err.response?.data);

      if (err.response?.status === 401) {
        localStorage.removeItem("admin_token");
        setIsAuthenticated(false);
        alert("Session expired. Please login again.");
      } else {
        alert(`Delete failed: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated && !loading) {
    return (
      <div className="p-6">
        <Card className="shadow-md rounded-2xl p-6 text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            🔐 Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            You need to login to access the materials upload feature.
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => navigate("/admin/login")}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Go to Login
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-y-auto">
      {/* Background layer */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(229,231,235,0.8) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(229,231,235,0.8) 1px, transparent 1px),
            radial-gradient(circle 500px at 0% 20%, rgba(139,92,246,0.3), transparent),
            radial-gradient(circle 500px at 100% 0%, rgba(59,130,246,0.3), transparent)
          `,
          backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
        }}
      />

      <div className="container mx-auto px-4 py-10">
        {/* Upload Form */}
        <div className="w-full rounded-2xl p-4 sm:p-6 mb-8 bg-white/40 backdrop-blur-md shadow-lg">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">
            Upload Study Material / Paper
          </h2>

          <div className="space-y-4">
            {/* Title Input - Full Width on Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                placeholder="Enter title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-3 rounded-lg border border-gray-300/30 focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 bg-white/70 text-base"
                maxLength={100}
              />
            </div>

            {/* Type and File - Responsive Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Type Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-3 rounded-lg border border-gray-300/30 focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 bg-white/70 text-base"
                >
                  <option value="material">📚 Study Material</option>
                  <option value="paper">📄 Question Paper</option>
                </select>
              </div>

              {/* File Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File * (Max {isMobile() ? '3MB' : '10MB'}{isMobile() ? ' - Mobile' : ''})
                </label>
                <input
                  type="file"
                  accept="application/pdf,.doc,.docx,.ppt,.pptx,.txt"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full px-3 py-3 rounded-lg border border-gray-300/30 focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 bg-white/70 text-base file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
              </div>
            </div>

            {/* File Info Display */}
            {file && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">Selected File:</p>
                <p className="text-sm text-green-700">{file.name}</p>
                <p className="text-xs text-green-600">
                  Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            )}

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!file || !title.trim() || loading}
              className="w-full sm:w-auto rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 py-3 px-6 text-base font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Uploading...
                </div>
              ) : (
                "📤 Upload File"
              )}
            </Button>
          </div>
        </div>

        {/* Uploaded Files Grid */}
        <div className="mt-8 sm:mt-12">
          <h3 className="text-lg sm:text-xl font-medium mb-6 text-gray-700 flex items-center gap-2">
            <span>📁 Your Uploads</span>
            <span className="bg-gray-100 text-gray-600 text-sm px-2 py-1 rounded-full">
              {uploads.length}
            </span>
          </h3>

          {uploads.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 sm:p-8 shadow-sm max-w-md mx-auto">
                <div className="text-4xl sm:text-5xl mb-4">📂</div>
                <p className="text-gray-600 text-base sm:text-lg font-medium mb-2">No files uploaded yet</p>
                <p className="text-gray-500 text-sm">Upload your first study material or question paper above</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {uploads.map((u) => (
                <motion.div
                  key={u._id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200/50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2 line-clamp-2" title={u.title}>
                          {u.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 truncate" title={u.originalName}>
                          {u.type === "paper" ? "📋" : "📄"} {u.originalName || u.title}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            u.type === "paper" 
                              ? "bg-red-100 text-red-700" 
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {u.type === "paper" ? "Question Paper" : "Study Material"}
                          </span>
                          {u.fileSize && (
                            <span className="text-xs text-gray-400">
                              {(u.fileSize / 1024 / 1024).toFixed(2)} MB
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                          u.type === "paper" ? "bg-red-100" : "bg-blue-100"
                        }`}>
                          <span className={`text-lg ${
                            u.type === "paper" ? "text-red-600" : "text-blue-600"
                          }`}>
                            {u.type === "paper" ? "📋" : "📚"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="p-4 sm:p-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(u)}
                        disabled={downloading === u._id}
                        className={`flex-1 font-medium py-2 sm:py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base ${
                          downloading === u._id
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                        }`}
                      >
                        {downloading === u._id ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full"></div>
                            <span className="hidden sm:inline">Downloading...</span>
                            <span className="sm:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Download</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(u._id)}
                        className="flex-shrink-0 bg-red-100 text-red-600 hover:bg-red-200 font-medium py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-200 flex items-center justify-center text-sm sm:text-base"
                        title="Delete file"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline ml-1">Delete</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}