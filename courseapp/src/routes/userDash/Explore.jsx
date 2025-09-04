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
        className="fixed inset-0 -z-10"
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
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="
                  flex-1 h-12 px-4 rounded-xl
                  bg-transparent border border-transparent
                  placeholder-gray-600 text-gray-900
                  focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/30
                  outline-none shadow-none
                "
              />
              <button
                onClick={handleSearch}
                className="h-12 px-5 rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              >
                Search
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="h-12 px-5 rounded-xl border border-white/10 bg-transparent hover:bg-white/5 transition-colors"
              >
                Filters
              </button>
            </div>

            {/* Filters Section */}
            {showFilters && (
              <div className="mt-4 flex items-end gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Min Price</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={priceFilter.min}
                    onChange={(e) =>
                      setPriceFilter((p) => ({ ...p, min: e.target.value }))
                    }
                    className="w-28 h-11 px-3 rounded-lg bg-transparent border border-white/20 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/30"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Max Price</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={priceFilter.max}
                    onChange={(e) =>
                      setPriceFilter((p) => ({ ...p, max: e.target.value }))
                    }
                    className="w-28 h-11 px-3 rounded-lg bg-transparent border border-white/20 focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/30"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="h-11 px-4 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors"
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    setPriceFilter({ min: '', max: '' });
                    setSearchQuery('');
                    fetchCourses();
                  }}
                  className="h-11 px-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Courses Grid */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
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
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-gray-900">
                      ₹{course.price || 0}
                      </div>
                      {course.isPurchased ? (
                        <button
                          onClick={() => navigate(`/user/watch/${course._id}`)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Watch Course
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePurchase(course._id)}
                          disabled={purchasing === course._id}
                          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                          {purchasing === course._id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Purchasing...
                            </>
                          ) : (
                            'Purchase'
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