import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export function AdminTeaser() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const loadAdmin = () => {
      const savedAdmin = localStorage.getItem("admin_user");
      if (savedAdmin && savedAdmin !== "undefined") {
        setAdmin(JSON.parse(savedAdmin));
      } else {
        setAdmin(null);
      }
    };

    loadAdmin();
    window.addEventListener("adminDataUpdated", loadAdmin);
    window.addEventListener("storage", loadAdmin);

    return () => {
      window.removeEventListener("adminDataUpdated", loadAdmin);
      window.removeEventListener("storage", loadAdmin);
    };
  }, []);

  return (
    <section className="px-12 py-24 text-center">
      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-5xl font-bold mb-8 tracking-tight text-gray-900"
      >
        For Admins
      </motion.h2>

      {/* Description */}
      <p className="text-xl max-w-3xl mx-auto mb-12 text-gray-700 leading-relaxed">
        Effortlessly manage{" "}
        <span className="font-semibold text-blue-600">courses</span>,{" "}
        <span className="font-semibold text-purple-600">materials</span>,{" "}
        test series, and more—all from one intuitive dashboard.
      </p>

      {/* Admin State */}
      {admin ? (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-2xl font-semibold text-gray-800"
        >
          Welcome {admin.firstName}!
        </motion.p>
      ) : (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate("/admin/signup")}
          className="px-8 py-4 rounded-2xl bg-blue-600 text-white text-lg font-semibold shadow-md hover:bg-blue-700 transition"
        >
          Get Started as Admin
        </motion.button>
      )}
    </section>
  );
}

/* ✅ Basic Footer */
export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-6 mt-16">
      <div className="text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} CourseHive. All rights reserved.
      </div>
    </footer>
  );
}