import { motion } from "framer-motion";

export default function TextBar() {
  return (
    <div className="w-full bg-sky-100 text-sky-700 py-2 overflow-hidden border-b border-sky-200">
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: "-100%" }}
        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
        className="whitespace-nowrap font-medium flex items-center space-x-10"
      >
        <span>📢 LIVE BATCH STARTS 19th AUG ✨</span>
        <span>🔥 Get up to 90% off based on NEET 2025 rank 🔥</span>
        <span>🚀 Join EduPortal today and start your journey! 🚀</span>
      </motion.div>
    </div>
  );
}