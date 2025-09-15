import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "../../Components/ui/button";
import api from "../../lib/api";

export default function UserPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await api.get("/api/user/papers");
        setPapers(res.data.papers);
      } catch (error) {
        console.error("❌ Error fetching papers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPapers();
  }, []);

  const handleDownload = async (id, name) => {
    try {
      const res = await api.get(
        `/api/user/materials/download/${id}`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", name || "paper.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("❌ Download failed:", error);
    }
  };

  if (loading) return <p className="text-center py-10">Loading Papers...</p>;

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

      {/* Your Content */}
      <section className="relative z-10 py-16 px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
           Question Papers
        </h2>
        {papers.length === 0 ? (
          <p className="text-center text-gray-500">No papers available.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {papers.map((p, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md border"
              >
                <h3 className="font-semibold text-lg text-gray-800">
                  {p.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{p.originalName}</p>
                <Button
                  onClick={() => handleDownload(p._id, p.originalName)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Download ⬇
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}