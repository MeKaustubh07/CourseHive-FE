import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../Components/ui/button";
import api from "../../lib/api";

export default function UserMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await api.get("/api/user/materials");
        console.log("📦 Materials response:", res.data);
        setMaterials(res.data.materials || []);
      } catch (error) {
        console.error("❌ Error fetching materials:", error);
        if (error.response) {
          console.error("🔍 Error details:", error.response.data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const handleDownload = async (id, name) => {
    try {
      const res = await api.get(
        `/api/user/materials/download/${id}`,
        {
          responseType: "blob", // Important for files
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name || "file.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("❌ Download failed:", error);
      alert("Failed to download file. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading Materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Dual Gradient Overlay (Top) Background */}
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

      {/* Content Section */}
      <section className="relative z-10 py-8 sm:py-12 lg:py-16 px-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">
            Study Materials
          </h2>
          
          {materials.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 sm:p-8 shadow-sm max-w-md mx-auto">
                <div className="text-4xl sm:text-5xl mb-4">📖</div>
                <p className="text-gray-600 text-base sm:text-lg font-medium mb-2">No materials available</p>
                <p className="text-gray-500 text-sm">Materials will appear here once uploaded by your instructor</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {materials.map((m, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200/50 overflow-hidden"
                >
                  {/* Header */}
                  <div className="p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2 line-clamp-2">
                          {m.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 truncate" title={m.originalName}>
                          📄 {m.originalName}
                        </p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="p-4 sm:p-6">
                    <Button
                      onClick={() => handleDownload(m._id, m.originalName)}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 sm:py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download</span>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}