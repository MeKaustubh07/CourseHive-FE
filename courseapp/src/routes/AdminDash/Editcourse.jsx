import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// 🔹 Token validation helper
const isTokenExpired = (token) => {
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("admin_token");
  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("admin_token");
    alert("Your session has expired. Please login again.");
    return null;
  }
  return { Authorization: `Bearer ${token}` };
};

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);
  const navigate = useNavigate();

  // --- API Calls ---
  const fetchCourses = async () => {
    const headers = getAuthHeaders();
    if (!headers) return setLoading(false);

    try {
      const res = await axios.get("http://localhost:3000/api/admin/mycourses", {
        headers,
      });

      console.log("✅ Fetched courses:", res.data);

      const data = res.data?.courses?.map((c) => ({
        ...c,
        thumbnailUrl: c.thumbnailUrl || c.thumbnail,
        videoUrl: c.videoUrl || c.video,
      }));

      setCourses(data || []);
    } catch (err) {
      console.error("❌ Fetch error:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        localStorage.removeItem("admin_token");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateCourse = async () => {
    try {
      const headers = getAuthHeaders();
      if (!headers) return;

      if (!editingCourse.title?.trim()) {
        alert("Title is required!");
        return;
      }

      console.log("📝 Updating course with ID:", editingCourse._id);

      const payload = {
        courseId: editingCourse._id,
        title: editingCourse.title.trim(),
        description: editingCourse.description?.trim() || "",
        price:
          editingCourse.price === "" || editingCourse.price == null
            ? 0
            : Number(editingCourse.price),
        thumbnailUrl: editingCourse.thumbnailUrl?.trim() || "",
        videoUrl: editingCourse.videoUrl?.trim() || "",
      };

      console.log("📤 Update payload:", payload);

      const response = await axios.put(
        "http://localhost:3000/api/admin/editcourse",
        payload,
        { headers }
      );

      console.log("✅ Update response:", response.data);

      alert("Course updated successfully! ✅");
      setEditingCourse(null);
      await fetchCourses();
    } catch (err) {
      console.error("❌ Update failed:", err.response?.data || err.message);
      console.error("Full error:", err);

      if (err.response?.status === 404) {
        alert("Course not found or you don't have permission to edit it.");
      } else if (err.response?.status === 400) {
        alert("Invalid course ID format or invalid data.");
      } else {
        alert(err.response?.data?.message || "Update failed");
      }
    }
  };

  const deleteCourse = async (id) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      console.log("🗑️ Deleting course with ID:", id);

      const response = await axios.delete(
        "http://localhost:3000/api/admin/deletecourse",
        {
          headers,
          data: { courseId: id },
        }
      );

      console.log("✅ Delete response:", response.data);
      alert("Course deleted successfully! ✅");
      await fetchCourses();
    } catch (err) {
      console.error("❌ Delete failed:", err.response?.data || err.message);
      console.error("Full error:", err);

      if (err.response?.status === 404) {
        alert("Course not found or you don't have permission to delete it.");
      } else if (err.response?.status === 400) {
        alert("Invalid course ID format.");
      } else {
        alert(err.response?.data?.message || "Delete failed");
      }
    }
  };

  // ✅ FIXED: actually call fetchCourses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // --- UI ---
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Course Management
      </h1>

      {loading && <p className="text-gray-600">⏳ Loading courses...</p>}
      {!loading && courses.length === 0 && (
        <p className="text-gray-600">No courses found.</p>
      )}

      {/* Courses Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition p-4 flex flex-col"
          >
            {/* Thumbnail */}
            <div
              className="w-full h-48 mb-4 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer"
              onClick={() => {
                if (c.videoUrl) window.open(c.videoUrl, "_blank");
              }}
              title={c.videoUrl ? "Click to watch video" : ""}
            >
              {c.thumbnailUrl ? (
                <img
                  src={c.thumbnailUrl}
                  alt={c.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.parentElement.innerHTML =
                      '<span class="text-gray-400">❌ Image load failed</span>';
                  }}
                />
              ) : (
                <span className="text-gray-400">📷 No Image</span>
              )}
            </div>

            <h2 className="font-semibold text-lg text-gray-900 line-clamp-2">
              {c.title}
            </h2>
            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
              {c.description}
            </p>
            <p className="text-blue-600 font-bold mt-2">
              {c.price > 0 ? `₹${c.price}` : "Free"}
            </p>

            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => {
                  console.log("📝 Editing course:", c);
                  setEditingCourse({ ...c });
                }}
                className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  console.log("🗑️ Delete button clicked for course:", c._id);
                  deleteCourse(c._id);
                }}
                className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {/* Advanced Edit Modal */}
{editingCourse && (
  <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40 flex items-center justify-center p-4" style={{ paddingTop: '80px' }}>
    <div className="w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black px-8 py-6 text-white relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Edit Course</h2>
            <p className="text-gray-300 mt-1">Update course information and media</p>
          </div>
          <button
            onClick={() => setEditingCourse(null)}
            className="p-3 hover:bg-white/20 rounded-full transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 h-full">
          {/* Left Column - Form Fields */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Course Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white"
                    placeholder="Enter course title"
                    value={editingCourse.title || ""}
                    onChange={(e) =>
                      setEditingCourse({ ...editingCourse, title: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white resize-none"
                    placeholder="Describe your course content and objectives"
                    value={editingCourse.description || ""}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 text-lg">$</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white"
                      placeholder="0.00"
                      value={editingCourse.price ?? 0}
                      onChange={(e) =>
                        setEditingCourse({
                          ...editingCourse,
                          price: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Media URLs
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white"
                    placeholder="https://example.com/thumbnail.jpg"
                    value={editingCourse.thumbnailUrl || ""}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        thumbnailUrl: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL
                  </label>
                  <input
                    type="url"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                    placeholder="https://example.com/video.mp4"
                    value={editingCourse.videoUrl || ""}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        videoUrl: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Media Preview */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Media Preview
              </h3>

              {/* Thumbnail Preview */}
              {editingCourse.thumbnailUrl && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Course Thumbnail</span>
                    <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded-full">Active</span>
                  </div>
                  <div className="relative group">
                    <img
                      src={editingCourse.thumbnailUrl}
                      alt="Course Thumbnail"
                      className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-48 bg-gray-200 rounded-lg items-center justify-center">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-gray-500 text-sm">Invalid thumbnail URL</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Video Preview */}
              {editingCourse.videoUrl && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-600">Course Video</span>
                    <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded-full">Preview</span>
                  </div>
                  <div className="relative">
                    <video
                      src={editingCourse.videoUrl}
                      className="w-full h-48 object-cover rounded-lg shadow-md"
                      controls
                      preload="metadata"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-48 bg-gray-200 rounded-lg items-center justify-center">
                      <div className="text-center">
                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <p className="text-gray-500 text-sm">Invalid video URL</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!editingCourse.thumbnailUrl && !editingCourse.videoUrl && (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500">Add media URLs to see preview</p>
                </div>
              )}
            </div>

            {/* Course Info Card */}
            <div className="bg-gray-100 p-6 rounded-xl border border-gray-300">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Course Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                  <span className="text-gray-600">Title:</span>
                  <span className="font-medium text-gray-800 max-w-48 truncate">
                    {editingCourse.title || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-300">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-gray-800">
                    ${editingCourse.price || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Media:</span>
                  <div className="flex space-x-2">
                    {editingCourse.thumbnailUrl && (
                      <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded">Image</span>
                    )}
                    {editingCourse.videoUrl && (
                      <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded">Video</span>
                    )}
                    {!editingCourse.thumbnailUrl && !editingCourse.videoUrl && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Actions */}
      <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            * Required fields must be filled
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setEditingCourse(null)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={updateCourse}
              disabled={!editingCourse.title}
              className="px-8 py-3 bg-gradient-to-r from-gray-800 to-black text-white rounded-lg hover:from-gray-900 hover:to-gray-900 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
    </div>
  );
}