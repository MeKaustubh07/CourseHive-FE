import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const loadUserData = () => {
      try {
        const savedUser = localStorage.getItem("user_user");
        const savedAdmin = localStorage.getItem("admin_user");

        let parsed = null;
        if (savedUser && savedUser !== "undefined") {
          parsed = JSON.parse(savedUser);
          setIsAdmin(false); // ✅ It's a USER
        } else if (savedAdmin && savedAdmin !== "undefined") {
          parsed = JSON.parse(savedAdmin);
          setIsAdmin(true); // ✅ It's an ADMIN
        }

        if (parsed) {
          setUser(parsed);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error parsing user/admin data:", error);
        localStorage.removeItem("user_user");
        localStorage.removeItem("admin_user");
        setUser(null);
        setIsAdmin(false);
      }
    };

    loadUserData();
    const handleUpdate = () => loadUserData();

    window.addEventListener("sessionUpdate", handleUpdate);
    window.addEventListener("sessionUpdateAdmin", handleUpdate);

    return () => {
      window.removeEventListener("sessionUpdate", handleUpdate);
      window.removeEventListener("sessionUpdateAdmin", handleUpdate);
    };
  }, []);

  // Function to get display name with fallbacks
  const getDisplayName = (user) => {
    if (!user) return null;
    if (user.firstName) return user.firstName;
    if (user.fullName) return user.fullName.split(" ")[0];
    if (user.name) return user.name.split(" ")[0];
    if (user.email) return user.email.split("@")[0];
    return "User";
  };

  const displayName = getDisplayName(user);

  return (
    <section className="flex-1 flex flex-col justify-center items-center text-center px-6 py-30 relative overflow-hidden">
      {/* ✅ Removed gradient background + circles so global background shows */}

      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-8xl font-extrabold tracking-tight mb-6 text-black drop-shadow-xl"
      >
        CourseHive
      </motion.h1>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 text-gray-800"
      >
        Learn. Grow. Manage.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed"
      >
        A dynamic platform for students to{" "}
        <span className="font-semibold text-blue-600">learn</span> and for users
        to <span className="font-semibold text-purple-600">manage</span>.
        <br /> Beautifully designed, just for you.
      </motion.p>

      <div className="flex space-x-6">
        {/* ✅ Case 1: If Admin Logged In → Show Enroll Now */}
        {isAdmin ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/user/signup")}
            className="px-6 py-3 rounded-xl bg-blue-100 text-blue-700 font-medium text-base shadow-sm hover:bg-blue-200 transition"
          >
            Enroll Now
          </motion.button>
        ) : user ? (
          /* ✅ Case 2: User Logged In → Show Welcome */
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 rounded-xl bg-blue-100 text-blue-700 font-medium text-base shadow-sm hover:bg-blue-200 transition"
          >
            Welcome, {displayName}!
          </motion.button>
        ) : (
          /* ✅ Case 3: No User/Admin → Show Enroll Now */
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/user/signup")}
            className="px-6 py-3 rounded-xl bg-blue-100 text-blue-700 font-medium text-base shadow-sm hover:bg-blue-200 transition"
          >
            Enroll Now
          </motion.button>
        )}
      </div>
    </section>
  );
}