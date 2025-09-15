import { useState, useEffect } from "react";
import axios from "axios";
import api from "../../lib/api";

export default function CourseForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [video, setVideo] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  
  // Get admin token with multiple possible keys
  const getAdminToken = () => {
    const possibleKeys = ["admin_token", "adminToken", "token", "authToken"];
    for (const key of possibleKeys) {
      const token = localStorage.getItem(key);
      if (token) {
        console.log(`🔑 Found token with key: ${key}`);
        return token;
      }
    }
    console.log("❌ No admin token found in localStorage");
    console.log("🔍 Available localStorage keys:", Object.keys(localStorage));
    return null;
  };

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      setCoursesLoading(true);
      console.log("🔍 Fetching admin courses...");
      
      const token = getAdminToken();
      if (!token) {
        console.log("⚠️ No admin token available, cannot fetch courses");
        setCourses([]);
        return;
      }
      
      console.log("🔑 Using token:", token.substring(0, 20) + "...");
      
      // Try multiple potential endpoints
      const endpoints = [
        "/api/admin/mycourses",  // Found in Editcourse.jsx - most likely correct
        "/api/admin/courses",    // Found in adminAtoms.jsx
        "/api/admin/allcourses",
        "/api/courses"
      ];
      
      let coursesData = [];
      let success = false;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Trying endpoint: ${endpoint}`);
          // No need to manually add Authorization header - api instance handles it
          const { data } = await api.get(endpoint);
          
          console.log(`📦 Response from ${endpoint}:`, data);
          
          // Handle different response structures
          if (data.success && data.courses && Array.isArray(data.courses)) {
            coursesData = data.courses;
            success = true;
            console.log(`✅ Successfully fetched ${coursesData.length} courses from ${endpoint}`);
            break;
          } else if (data.courses && Array.isArray(data.courses)) {
            coursesData = data.courses;
            success = true;
            console.log(`✅ Successfully fetched ${coursesData.length} courses from ${endpoint} (no success flag)`);
            break;
          } else if (Array.isArray(data)) {
            // Handle case where data itself is the courses array
            coursesData = data;
            success = true;
            console.log(`✅ Successfully fetched ${coursesData.length} courses from ${endpoint} (direct array)`);
            break;
          } else {
            console.log(`📦 Unexpected response structure from ${endpoint}:`, data);
          }
        } catch (endpointError) {
          console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.response?.status, endpointError.response?.data?.message || endpointError.message);
          continue;
        }
      }
      
      if (success) {
        setCourses(coursesData);
        console.log("🎉 Courses set successfully:", coursesData);
      } else {
        console.log("⚠️ No courses found from any endpoint");
        setCourses([]);
      }
      
    } catch (error) {
      console.error("❌ Error fetching courses:", error);
      console.error("🔍 Error details:", error.response?.data);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  // Delete course
  const handleDelete = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    
    try {
      await api.delete(`/api/admin/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("✅ Course deleted successfully!");
      fetchCourses(); // Refresh the list
    } catch (error) {
      console.error("❌ Error deleting course:", error);
      alert("❌ Failed to delete course");
    }
  };

  // Edit course
  const handleEdit = (course) => {
    setEditing(course._id);
    setForm({
      title: course.title,
      description: course.description,
      price: course.price.toString(),
    });
    // Note: We can't pre-populate file inputs for security reasons
    setThumbnail(null);
    setVideo(null);
  };

  // Cancel edit
  const handleCancel = () => {
    setEditing(null);
    setForm({ title: "", description: "", price: "" });
    setThumbnail(null);
    setVideo(null);
    // Clear file inputs
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => input.value = '');
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Submit form + files in one request
  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.price) {
      alert("Please fill all fields");
      return;
    }
    
    // For new courses, require files. For edits, files are optional
    if (!editing && (!thumbnail || !video)) {
      alert("Please select both thumbnail & video files");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description);
      data.append("price", form.price);

      // ✅ Updated field names to match backend
      if (thumbnail) {
        data.append("thumbnailUrl", thumbnail);
      }
      if (video) {
        data.append("videoUrl", video);
      }

      console.log("📤 Sending course data:", {
        title: form.title,
        description: form.description,
        price: form.price,
        thumbnailSize: thumbnail?.size,
        videoSize: video?.size,
        thumbnailType: thumbnail?.type,
        videoType: video?.type,
        editing: editing
      });

      let res;
      if (editing) {
        // Update existing course
        res = await api.put(`/api/admin/courses/${editing}`, data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          timeout: 60000,
        });
        alert("✅ Course Updated Successfully!");
      } else {
        // Create new course
        res = await api.post("/api/admin/addcourse", data, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 60000,
        });
        alert("✅ Course Created Successfully!");
      }

      console.log("📦 Server Response:", res.data);

      // Reset form
      handleCancel();
      fetchCourses(); // Refresh courses list
      
    } catch (err) {
      console.error("❌ Error saving course:", err);
      if (err.response) {
        console.error("🔍 Server Response:", err.response.data);
        alert(`❌ Server Error: ${err.response.data.message || 'Unknown error'}`);
      } else if (err.request) {
        console.error("🌐 Network Error:", err.request);
        alert("❌ Network Error - Please check your connection");
      } else {
        console.error("⚠️ Request Error:", err.message);
        alert(`❌ Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

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

      {/* Content */}
      <div className="relative z-10 p-4 sm:p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editing ? "Edit Course" : "Create New Course"}
          </h2>
          {editing && (
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel Edit
            </button>
          )}
        </div>

        {/* Stepper like UI */}
        <div className="flex flex-wrap gap-2 mb-6 text-sm sm:text-base text-gray-600">
          <span className="font-medium text-purple-600">1. Course Information</span>
          <span className="hidden sm:inline">›</span>
          <span className="text-gray-400">Upload Materials</span>
          <span className="hidden sm:inline">›</span>
          <span className="text-gray-400">Pricing</span>
          <span className="hidden sm:inline">›</span>
          <span className="text-gray-400">Publish</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column */}
          <div className="order-1">
            <h2 className="text-xl font-semibold mb-4">Course Information</h2>

            <input
              type="text"
              name="title"
              placeholder="Course Title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            <textarea
              name="description"
              placeholder="Course Description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-base resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            <input
              type="number"
              name="price"
              placeholder="Price (₹)"
              value={form.price}
              onChange={handleChange}
              min="0"
              step="1"
              className="w-full border border-gray-300 rounded-lg p-3 mb-6 text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium text-base focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {editing ? "Updating Course..." : "Creating Course..."}
                </div>
              ) : (
                editing ? "Update Course" : "Create Course"
              )}
            </button>
          </div>

          {/* Right Column */}
          <div className="order-2">
            <div className="mb-6">
              <h3 className="font-medium mb-3 text-lg">Course Thumbnail</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white/70 backdrop-blur-sm hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnail(e.target.files[0])}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                    file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700
                    hover:file:bg-purple-100 cursor-pointer"
                />
                {thumbnail && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 font-medium">✅ {thumbnail.name}</p>
                    <p className="text-xs text-gray-500">Size: {(thumbnail.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                )}
                {!thumbnail && (
                  <p className="text-sm text-gray-500 mt-2">Select an image file (JPG, PNG)</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-3 text-lg">Course Preview Video</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-white/70 backdrop-blur-sm hover:border-purple-400 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideo(e.target.files[0])}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
                    file:text-sm file:font-medium file:bg-green-50 file:text-green-700
                    hover:file:bg-green-100 cursor-pointer"
                />
                {video && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 font-medium">✅ {video.name}</p>
                    <p className="text-xs text-gray-500">Size: {(video.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                )}
                {!video && (
                  <p className="text-sm text-gray-500 mt-2">Select a video file (MP4, MOV, AVI)</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Existing Courses List */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Existing Courses</h3>
            
          </div>
          {coursesLoading ? (
            <div className="bg-white/70 backdrop-blur rounded-2xl p-8 text-center shadow">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading courses...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="bg-white/70 backdrop-blur rounded-2xl p-8 text-center shadow">
              <p className="text-gray-600 text-base">📚 No courses created yet.</p>
              <p className="text-gray-500 text-sm mt-2">
                Create your first course using the form above!
              </p>
              <p className="text-yellow-600 text-xs mt-2">
                💡 Check the debug info above and browser console for API errors
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white/95 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No Image</span>
                      </div>
                    )}
                    {course.isPurchased && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Owned
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-gray-600 text-sm font-medium">
                          {course.creatorId?.firstname?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {course.creatorId?.firstname} {course.creatorId?.lastname}
                        </p>
                        <p className="text-xs text-gray-500">Instructor</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-gray-900">
                        ₹{course.price || 0}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(course)}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                      Edit
                      </button>
                      <button
                        onClick={() => handleDelete(course._id)}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                      Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
