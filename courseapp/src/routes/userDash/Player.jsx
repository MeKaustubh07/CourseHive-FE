import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";

export default function WatchCourse() {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { courseid } = useParams();

  // Fetch course details for watching
  const fetchCourse = async () => {
    try {
      const token = localStorage.getItem("user_token");

      if (!token) {
        navigate("/user/login");
        return;
      }

      const { data } = await api.get(`/api/user/watch/${courseid}`);

      if (data.success) {
        setCourse(data.course);
      } else {
        setError(data.message || "Failed to load course");
        if (data.message?.includes("purchase")) {
          setTimeout(() => navigate("/user/explore"), 3000);
        }
      }
    } catch (error) {
      console.error(
        "Error fetching course:",
        error?.response?.data || error.message
      );
      setError("Failed to load course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseid) {
      fetchCourse();
    }
  }, [courseid]);

  if (loading) {
    return (
      <div className="relative min-h-screen overflow-y-auto">
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
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading course...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen overflow-y-auto">
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
        <div className="relative z-10 text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate("/user/explore")}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse Courses
            </button>
            <button
              onClick={() => navigate("/user/mypurchase")}
              className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              My Purchases
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white relative">
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
        <div className="relative z-10 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Course not found
          </h3>
          <p className="text-gray-600">
            The requested course could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Static Gradient Background */}
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
      <div className="relative z-10">
        {/* Course Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/user/mypurchase")}
              className="hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 text-sm">
              by {course.Admin?.firstName} {course.Admin?.lastName}              </p>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Purchased: {new Date(course.purchaseDate).toLocaleDateString()}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 px-6 pb-10">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
              {course.videoUrl ? (
                <video
                  controls
                  className="w-full h-full object-contain"
                  poster={course.thumbnailUrl}
                  preload="metadata"
                >
                  <source src={course.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p className="text-gray-400">
                    No video available for this course
                  </p>
                </div>
              )}
            </div>

            {/* Course Description */}
            <div className="mt-6 bg-white/70 backdrop-blur-sm rounded-lg p-6 shadow">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                About This Course
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {course.description}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-6 shadow sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Course Details
              </h3>

              <div className="space-y-4">
                {/* Instructor Info */}
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="font-medium text-gray-600">
                      {course.creatorId?.firstname?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {course.creatorId?.firstname} {course.creatorId?.lastname}
                    </p>
                    <p className="text-sm text-gray-600">Instructor</p>
                  </div>
                </div>

                {/* Purchase Info */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Course Price:</span>
                    <span className="font-bold text-gray-900">
                      ${course.price || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Purchase Date:</span>
                    <span className="text-gray-900">
                      {new Date(course.purchaseDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Access:</span>
                    <span className="text-green-600 font-medium">Lifetime</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/user/explore")}
                    className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Browse More Courses
                  </button>
                  <button
                    onClick={() => navigate("/user/mypurchase")}
                    className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    My Purchases
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
}