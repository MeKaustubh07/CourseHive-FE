import { useEffect, useState } from "react";
import api from "../../lib/api";
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
      const res = await api.get("/api/admin/mycourses", {
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

      const response = await api.put(
        "/api/admin/editcourse",
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

      const response = await api.delete(
        "/api/admin/deletecourse",
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

  // ✅ Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // --- UI ---
  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Dual Gradient Overlay Background */}
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

        {/* Main Content */}
        <div className="relative z-10 p-4 sm:p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-10">
        Manage Courses
        </h1>

          {loading && <p className="text-gray-600 text-center">⏳ Loading courses...</p>}
          {!loading && courses.length === 0 && (
            <p className="text-gray-600 text-center">No courses found.</p>
          )}        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">{courses.map((c) => (
            <div
              key={c._id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-4 flex flex-col"
            >
              {/* Thumbnail */}
              <div
                className="w-full h-40 sm:h-48 mb-4 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center cursor-pointer group"
                onClick={() => {
                  if (c.videoUrl) window.open(c.videoUrl, "_blank");
                }}
                title={c.videoUrl ? "Click to watch video" : ""}
              >
                {c.thumbnailUrl ? (
                  <img
                    src={c.thumbnailUrl}
                    alt={c.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.parentElement.innerHTML =
                        '<span class="text-gray-400 text-sm">❌ Image failed to load</span>';
                    }}
                  />
                ) : (
                  <span className="text-gray-400 text-sm">📷 No Image</span>
                )}
              </div>

              <h2 className="font-semibold text-base sm:text-lg text-gray-900 line-clamp-2 mb-2">
                {c.title}
              </h2>
              <p className="text-gray-600 text-sm mt-1 line-clamp-3 flex-grow">
                {c.description || "No description available"}
              </p>
              <p className="text-blue-600 font-bold mt-3 text-lg">
                {c.price > 0 ? `₹${c.price}` : "Free"}
              </p>

              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <button
                  onClick={() => setEditingCourse({ ...c })}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                >
                 Edit
                </button>
                <button
                  onClick={() => deleteCourse(c._id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                >
                 Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingCourse && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Edit Course</h2>
                  <button
                    onClick={() => setEditingCourse(null)}
                    className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Course Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={editingCourse.title}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, title: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter course title"
                      required
                    />
                  </div>

                  {/* Course Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={editingCourse.description}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, description: e.target.value })
                      }
                      rows={4}
                      className="w-full border border-gray-300 rounded-lg p-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter course description"
                    />
                  </div>

                  {/* Course Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={editingCourse.price}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, price: e.target.value })
                      }
                      min="0"
                      step="1"
                      className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter price (0 for free)"
                    />
                  </div>

                  {/* Thumbnail URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thumbnail URL
                    </label>
                    <input
                      type="url"
                      value={editingCourse.thumbnailUrl}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, thumbnailUrl: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter thumbnail image URL"
                    />
                    {editingCourse.thumbnailUrl && (
                      <div className="mt-2">
                        <img
                          src={editingCourse.thumbnailUrl}
                          alt="Thumbnail preview"
                          className="w-20 h-20 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Video URL */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Video URL
                    </label>
                    <input
                      type="url"
                      value={editingCourse.videoUrl}
                      onChange={(e) =>
                        setEditingCourse({ ...editingCourse, videoUrl: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter video URL"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <button
                    onClick={() => setEditingCourse(null)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updateCourse}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Update Course
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
