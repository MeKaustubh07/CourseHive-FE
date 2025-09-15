import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPhone } from "react-icons/fa"; 

const CallUsButton = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleMobileClick = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Phone Icon */}
      <div 
        className="cursor-pointer flex items-center justify-center"
        onClick={handleMobileClick}
      >
        <FaPhone className="text-lg text-gray-700 hover:text-blue-600 transition-colors duration-300" />
      </div>

      {/* Desktop tooltip */}
      <AnimatePresence>
        {isHovering && !isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-10 hidden md:block"
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

      {/* Mobile popup */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setIsMobileOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Contact Us</h3>
              <button 
                onClick={() => setIsMobileOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-bold text-gray-800 mb-2">Toll-Free Number:</p>
                <a
                  href="tel:1-800-000-0000"
                  className="text-lg text-blue-600 hover:underline block"
                >
                  1-800-000-0000
                </a>
              </div>
              <div>
                <p className="font-bold text-gray-800 mb-2">Contact Email:</p>
                <a
                  href="mailto:support@yourcompany.com"
                  className="text-lg text-blue-600 hover:underline block"
                >
                  support@yourcompany.com
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallUsButton;