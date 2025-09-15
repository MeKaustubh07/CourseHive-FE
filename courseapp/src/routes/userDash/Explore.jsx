import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function Explore() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState({ min: '', max: '' });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Fetch all courses
  const fetchCourses = async () => {
    try {
      const token = localStorage.getItem('user_token');
      if (!token) {
        navigate('/user/login');
        return;
      }
      const { data } = await api.get('/api/user/explore');
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (courseId) => {
    try {
      setPurchasing(courseId);
      const token = localStorage.getItem('user_token');
      if (!token) {
        navigate('/user/login');
        return;
      }
      const { data } = await api.post('/api/user/purchase', { courseid: courseId });
      if (data.success) {
        alert('Course purchased successfully!');
        fetchCourses();
      } else {
        alert(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error?.response?.data || error.message);
      alert(error?.response?.data?.message || 'Purchase failed. Please try again.');
    } finally {
      setPurchasing(null);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('user_token');
      if (!token) {
        navigate('/user/login');
        return;
      }
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (priceFilter.min) params.append('minPrice', priceFilter.min);
      if (priceFilter.max) params.append('maxPrice', priceFilter.max);

      const { data } = await api.get(`/user/search?${params.toString()}`);
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Search error:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {/* Static Background */}
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

      {/* Foreground Content */}
      <div className="relative z-10">
        {/* Transparent Header (Search + Filters) */}
        <header className="sticky top-0 z-10 bg-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
            {/* Mobile: Stacked Layout, Desktop: Single Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input - Full Width on Mobile */}
              <div className="flex-1 flex gap-2 sm:gap-3">
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="
                    flex-1 h-10 sm:h-12 px-3 sm:px-4 rounded-lg sm:rounded-xl text-sm sm:text-base
                    bg-white/70 backdrop-blur-sm border border-gray-200
                    placeholder-gray-500 text-gray-900
                    focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/30
                    focus:bg-white/90 outline-none transition-all
                  "
                />
                <button
                  onClick={handleSearch}
                  className="h-10 sm:h-12 px-3 sm:px-5 rounded-lg sm:rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors text-sm sm:text-base font-medium"
                >
                  <span className="hidden sm:inline">Search</span>
                  <span className="sm:hidden">🔍</span>
                </button>
              </div>
              
              {/* Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="h-10 sm:h-12 px-3 sm:px-5 rounded-lg sm:rounded-xl border border-gray-200 bg-white/70 hover:bg-white/90 backdrop-blur-sm transition-colors text-sm sm:text-base font-medium text-gray-700"
              >
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden">⚙️</span>
              </button>
            </div>

            {/* Filters Section */}
            {showFilters && (
              <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200">
                {/* Mobile: Stacked, Desktop: Row */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex gap-4 flex-1">
                    <div className="flex-1">
                      <label className="block text-sm text-gray-700 mb-1 font-medium">Min Price</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={priceFilter.min}
                        onChange={(e) =>
                          setPriceFilter((p) => ({ ...p, min: e.target.value }))
                        }
                        className="w-full h-10 px-3 rounded-lg bg-white border border-gray-200 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/30 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-700 mb-1 font-medium">Max Price</label>
                      <input
                        type="number"
                        placeholder="1000"
                        value={priceFilter.max}
                        onChange={(e) =>
                          setPriceFilter((p) => ({ ...p, max: e.target.value }))
                        }
                        className="w-full h-10 px-3 rounded-lg bg-white border border-gray-200 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/30 text-sm"
                      />
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:flex-col sm:justify-end">
                    <button
                      onClick={handleSearch}
                      className="flex-1 sm:flex-none h-10 px-4 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors text-sm font-medium"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => {
                        setPriceFilter({ min: '', max: '' });
                        setSearchQuery('');
                        fetchCourses();
                      }}
                      className="flex-1 sm:flex-none h-10 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Courses Grid */}
        <main className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {courses.length === 0 ? (
            <div className="text-center py-8 sm:py-12 px-4">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-sm sm:text-base text-gray-600">Try adjusting your search criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {courses.map((course) => (
                <div
                  key={course._id}
                  className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-40 sm:h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-40 sm:h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">No Image</span>
                      </div>
                    )}
                    {course.isPurchased && (
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                        <span className="bg-green-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                          Owned
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">
                      {course.description}
                    </p>
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-300 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                        <span className="text-gray-600 text-xs sm:text-sm font-medium">
                          {course.creatorId?.firstname?.charAt(0) || 'A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">
                          {course.creatorId?.firstname} {course.creatorId?.lastname}
                        </p>
                        <p className="text-xs text-gray-500">Instructor</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      ₹{course.price || 0}
                      </div>
                      {course.isPurchased ? (
                        <button
                          onClick={() => navigate(`/user/watch/${course._id}`)}
                          className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Watch
                        </button>
                      ) : (
                        <button
                      onClick={() => handlePurchase(course._id)}
                      disabled={purchasing === course._id}
                      className={`px-3 sm:px-4 py-2 rounded-lg shadow-sm text-white transition-colors flex items-center justify-center text-sm font-medium
                        ${purchasing === course._id 
                          ? "bg-indigo-400 cursor-not-allowed" 
                          : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                    >
                      {purchasing === course._id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                          <span className="hidden sm:inline">Purchasing...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      ) : (
                        "Purchase"
                      )}
                    </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}