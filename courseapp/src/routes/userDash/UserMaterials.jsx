import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function UserMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const token = localStorage.getItem("user_token");
        const res = await axios.get("http://localhost:3000/api/user/materials", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMaterials(res.data.materials);
      } catch (error) {
        console.error("❌ Error fetching materials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const handleDownload = async (id, name) => {
    try {
      const token = localStorage.getItem("user_token");
      const res = await axios.get(
        `http://localhost:3000/api/user/materials/download/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
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
    }
  };

  if (loading) return <p className="text-center py-10">Loading Materials...</p>;

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
      <section className="relative z-10 py-16 px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
           Study Materials
        </h2>
        {materials.length === 0 ? (
          <p className="text-center text-gray-500">No materials available.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((m, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-md border"
              >
                <h3 className="font-semibold text-lg text-gray-800">
                  {m.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{m.originalName}</p>
                <Button
                  onClick={() => handleDownload(m._id, m.originalName)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
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