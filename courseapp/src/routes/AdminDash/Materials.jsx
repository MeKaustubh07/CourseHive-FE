import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

        const res = await axios.get(`/api/admin/materials`, { headers });

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
    if (!file || !title) return alert("Please enter title and choose a file");

    const headers = getAuthHeaders();
    if (!headers) {
      alert("Please login first");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("type", type);

    try {
      console.log("📤 Uploading file with headers:", headers);

      const res = await axios.post(`/api/admin/materials/upload`, formData, {
        headers: {
          ...headers,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("✅ Upload response:", res.data);

      if (res.data.success && res.data.material) {
        setUploads([res.data.material, ...uploads]); // Add new upload to the top
        setFile(null);
        setTitle("");
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
        alert("File uploaded successfully!");
      }
    } catch (err) {
      console.error("❌ Error uploading file:", err);
      console.error("❌ Upload error response:", err.response?.data);

      if (err.response?.status === 401) {
        localStorage.removeItem("admin_token");
        setIsAuthenticated(false);
        alert("Session expired. Please login again.");
      } else {
        alert(`Upload failed: ${err.response?.data?.error || err.message}`);
      }
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

      const res = await axios.delete(`/api/admin/materials/${id}`, { headers });

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
    <div className="p-6">
      {/* Upload Form */}
      <Card className="shadow-md rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Upload Study Material / Paper
        </h2>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Title Input */}
            <input
              type="text"
              placeholder="Enter title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border rounded-lg px-3 py-2 flex-1"
            />

            {/* Type Select */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="material">Material</option>
              <option value="paper">Paper</option>
            </select>

            {/* File Input */}
            <input
              type="file"
              accept="application/pdf,.doc,.docx,.ppt,.pptx"
              onChange={(e) => setFile(e.target.files[0])}
              className="border rounded-lg px-3 py-2"
            />

            <Button
              onClick={handleUpload}
              className="bg-black text-white hover:bg-gray-800"
            >
              Upload
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files Grid */}
      <h3 className="text-lg font-medium mb-4 text-gray-700">
        Your Uploads ({uploads.length})
      </h3>
      {uploads.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">
            No files uploaded yet. Upload your first file above.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {uploads.map((u) => (
            <motion.div
              key={u._id}
              whileHover={{ scale: 1.03 }}
              className="bg-white shadow-lg rounded-2xl p-4 flex flex-col items-center text-center"
            >
              {/* File Type Icon */}
              {u.type === "paper" ? (
                <div className="w-16 h-16 bg-red-500 text-white flex items-center justify-center rounded-xl mb-3 text-xl font-bold">
                  📄
                </div>
              ) : (
                <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-xl mb-3 text-xl font-bold">
                  📚
                </div>
              )}

              {/* File Info */}
              <p
                className="font-medium text-gray-800 truncate w-full"
                title={u.title}
              >
                {u.title}
              </p>
              <span className="text-xs text-gray-500 uppercase mt-1">
                {u.type}
              </span>
              <span className="text-xs text-gray-400 mt-1">
                {new Date(u.createdAt).toLocaleDateString()}
              </span>

              {/* File size if available */}
              {u.fileSize && (
                <span className="text-xs text-gray-400">
                  {(u.fileSize / 1024 / 1024).toFixed(2)} MB
                </span>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-4 flex-wrap justify-center">
                <button
                  onClick={() => handleDownload(u)}
                  disabled={downloading === u._id}
                  className={`text-sm px-3 py-1 rounded-lg flex items-center gap-1 ${
                    downloading === u._id
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-green-100 text-green-600 hover:bg-green-200"
                  }`}
                >
                  {downloading === u._id ? (
                    <>
                      <div className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full"></div>
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <span>📥</span>
                      <span>Download</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(u._id)}
                  className="text-sm px-3 py-1 rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}