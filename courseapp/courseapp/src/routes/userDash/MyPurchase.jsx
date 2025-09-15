import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

export default function MyPurchase() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPurchases = async () => {
    try {
      const token = localStorage.getItem('user_token');
      if (!token) {
        navigate('/user/login');
        return;
      }
      const { data } = await api.get('/api/user/mypurchase');
      if (data.success) {
        setPurchases(data.purchases);
      } else {
        console.error('Failed to fetch purchases:', data.message);
      }
    } catch (error) {
      console.error('Error fetching purchases:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-white relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(229,231,235,0.4) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(229,231,235,0.4) 1px, transparent 1px),
              radial-gradient(circle 500px at 0% 20%, rgba(139,92,246,0.15), transparent),
              radial-gradient(circle 500px at 100% 0%, rgba(59,130,246,0.15), transparent)
            `,
            backgroundSize: "48px 48px, 48px 48px, 100% 100%, 100% 100%",
          }}
        />
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Gradient/Grid Background */}
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
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900">My Purchased Courses</h1>
          <p className="text-gray-600 mt-2">
            Access all your purchased courses and continue learning
          </p>
        </div>

        {purchases.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-6">
              <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">No purchases yet</h3>
            <p className="text-gray-600 mb-6">Start learning by purchasing your first course</p>
            <button
              onClick={() => navigate('/user/explore')}
              className="bg-gray-900 text-white px-8 py-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow p-6 text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{purchases.length}</div>
                <div className="text-gray-600">Total Courses</div>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  ${purchases.reduce((total, purchase) => total + (purchase.amount || 0), 0).toFixed(2)}
                </div>
                <div className="text-gray-600">Total Spent</div>
              </div>
              <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {new Date().getMonth() - new Date(purchases[0]?.purchaseDate).getMonth() + 1}
                </div>
                <div className="text-gray-600">Learning Months</div>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {purchases.map((purchase) => (
                <div
                  key={purchase.purchaseId}
                  className="bg-white/70 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
                >
                  <div className="relative">
                    {purchase.course?.thumbnailUrl ? (
                      <img
                        src={purchase.course.thumbnailUrl}
                        alt={purchase.course.title}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Owned
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{purchase.course?.title}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{purchase.course?.description}</p>
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Purchased:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(purchase.purchaseDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-bold text-green-600">${purchase.amount || 0}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/user/watch/${purchase.course?._id}`)}
                      className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      Continue Learning
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}