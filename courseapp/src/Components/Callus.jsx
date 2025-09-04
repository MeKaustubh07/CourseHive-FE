import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PhoneIcon } from "../react-icons/fa"; 

const CallUsButton = () => {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Phone Icon (smaller, consistent with topbar size) */}
      <div className="cursor-pointer flex items-center justify-center">
        <PhoneIcon className="text-lg text-gray-700 hover:text-blue-600 transition-colors duration-300" />
      </div>

      {/* Animated tooltip */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-10"
          >
            <p className="font-bold text-gray-800">Toll-Free Number:</p>
            <a
              href="tel:1-800-000-0000"
              className="text-lg text-blue-600 hover:underline"
            >
              1-800-000-0000
            </a>
            <hr className="my-3" />
            <p className="font-bold text-gray-800">Contact Email:</p>
            <a
              href="mailto:support@yourcompany.com"
              className="text-lg text-blue-600 hover:underline"
            >
              support@yourcompany.com
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CallUsButton;