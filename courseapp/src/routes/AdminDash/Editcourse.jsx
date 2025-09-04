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

  // ✅ Fetch courses on mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // --- UI ---
  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Dual Gradient Overlay Background */}
      <div
        className="absolute inset-0 z-0"
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
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-10">
      Question Papers
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
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition p-4 flex flex-col"
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
                  onClick={() => setEditingCourse({ ...c })}
                  className="bg-blue-500 text-white px-4 py-1 rounded-lg hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCourse(c._id)}
                  className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingCourse && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-40 flex items-center justify-center p-4 pt-20">
            {/* --- Your existing edit modal code remains unchanged --- */}
          </div>
        )}
      </div>
    </div>
  );
}
