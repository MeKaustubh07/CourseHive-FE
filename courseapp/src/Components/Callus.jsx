import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPhone, FaTimes } from "react-icons/fa"; 

const CallUsButton = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMouseEnter = () => {
    console.log('Mouse entered CallUs button');
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    console.log('Mouse left CallUs button');
    setIsHovering(false);
  };

  const handleClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        className="relative flex items-center"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Phone Icon */}
        <div 
          className="cursor-pointer flex items-center justify-center callus-icon"
          onClick={handleClick}
        >
          <FaPhone className="text-lg text-gray-700 hover:text-blue-600 transition-colors duration-300" />
        </div>

        {/* Desktop hover tooltip - quick preview */}
        <AnimatePresence>
          {isHovering && !isModalOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-[9999] hidden md:block border"
              style={{ 
                position: 'absolute',
                right: '0px',
                top: '100%',
                marginTop: '8px',
                zIndex: 9999,
                boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                backgroundColor: 'white'
              }}
            >
              <div className="text-center mb-3">
                <p className="text-sm font-semibold text-gray-800 mb-2">Contact Us</p>
              </div>
              
              {/* Phone */}
              <div className="mb-3 pb-2 border-b border-gray-100">
                <div className="flex items-center mb-1">
                  <FaPhone className="text-blue-600 mr-2 text-xs" />
                  <p className="text-xs font-medium text-gray-700">Phone</p>
                </div>
                <a
                  href="tel:1-800-000-0000"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  1-800-000-0000
                </a>
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center mb-1">
                  <svg className="w-3 h-3 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                  <p className="text-xs font-medium text-gray-700">Email</p>
                </div>
                <a
                  href="mailto:support@yourcompany.com"
                  className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors break-all"
                >
                  support@yourcompany.com
                </a>
              </div>
              
              <div className="absolute -top-1 right-4 w-2 h-2 bg-white transform rotate-45 border-t border-l"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Popup - Works on both mobile and desktop */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FaPhone className="mr-2 text-blue-600" />
                  Contact Us
                </h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Get in touch with us through any of the following ways:</p>
                </div>
                
                <div className="space-y-4">
                  {/* Phone Number */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <FaPhone className="text-blue-600 mr-2" />
                      <p className="font-semibold text-gray-800">Toll-Free Number</p>
                    </div>
                    <a
                      href="tel:1-800-000-0000"
                      className="text-lg text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      1-800-000-0000
                    </a>
                  </div>

                  {/* Email */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                      </svg>
                      <p className="font-semibold text-gray-800">Email Support</p>
                    </div>
                    <a
                      href="mailto:support@yourcompany.com"
                      className="text-lg text-green-600 hover:text-green-800 font-medium transition-colors break-all"
                    >
                      support@yourcompany.com
                    </a>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">Available 24/7 to assist you</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CallUsButton;