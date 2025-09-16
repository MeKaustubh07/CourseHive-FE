import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import CallUsButton from "../../Components/Callus.jsx";
import "../../App.css";
import "../../index.css";


export default function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const hoverTimeoutRef = useRef(null);

  // ✅ session check logic
  useEffect(() => {
    const checkSession = () => {
      try {
        const userStr = localStorage.getItem("user_user");
        const adminStr = localStorage.getItem("admin_user");
        const userToken = localStorage.getItem("user_token");
        const adminToken = localStorage.getItem("admin_token");

        // Debug logging
        console.log("🔍 TopBar Session Check:");
        console.log("  User data:", userStr);
        console.log("  Admin data:", adminStr);
        console.log("  User token:", userToken ? "✅ Present" : "❌ Missing");
        console.log("  Admin token:", adminToken ? "✅ Present" : "❌ Missing");

        const user = userStr ? JSON.parse(userStr) : null;
        const admin = adminStr ? JSON.parse(adminStr) : null;

        if (admin && adminToken) {
          console.log("🔐 Setting admin session:", admin);
          setSession({ type: "admin", data: admin });
        } else if (user && userToken) {
          console.log("👤 Setting user session:", user);
          setSession({ type: "user", data: user });
        } else {
          console.log("❌ No valid session found");
          setSession(null);
        }
      } catch (error) {
        console.error("Error parsing session data:", error);
        setSession(null);
      }
    };

    checkSession();
    const handleUpdate = () => {
      console.log("🔄 Session update event triggered");
      checkSession();
    };

    window.addEventListener("sessionUpdate", handleUpdate);
    return () => {
      window.removeEventListener("sessionUpdate", handleUpdate);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // ✅ logout
  const handleLogout = () => {
    localStorage.clear();
    setSession(null);
    window.dispatchEvent(new Event("sessionUpdate"));
    setTimeout(() => navigate("/"), 100);
  };

  // Enhanced navigation handler for mobile
  const handleMobileNavigation = (path, label) => {
    console.log(`Mobile Navigation: ${label} -> ${path}`);
    try {
      navigate(path);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Navigation error:', error);
      alert(`Failed to navigate to ${label}. Please try again.`);
    }
  };

  // ✅ hover delay functions
  const handleMouseEnter = (item) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setHoveredItem(item);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredItem(null);
    }, 300); // 300ms delay before hiding
  };

  const navigationData = {
    courses: {
      admin: [
        { label: "Manage Courses", path: "/admin/mycourses" },
        { label: "Add Course", path: "/admin/addcourse" },
      ],
      user: [
        { label: "Explore", path: "/user/explore" },
        { label: "My Purchase", path: "/user/mypurchase" },
        // { label: "Class 6-10", path: "/courses/class-6-10" },
        // { label: "View All Options", path: "/courses" },
      ],
    },
    testSeries: {
      admin: [
        { label: "Manage Tests", path: "/admin/managetests" },
      ],
      user: [
        { label: "Give Tests", path: "/user/givetests" },
      ],
    },
    material: {
      user: [
        { label: "Study Materials", path: "/user/materials" },
        { label: "Previous Papers", path: "/user/papers" },
      ],
      admin: [
        { label: "Manage Materials", path: "/admin/materials" },
      ],
    },
    more: {
      user: [
        { label: "About Us", path: "/aboutus" },
        { label: "About Project", path: "/aboutproject" },
      ],
      admin: [
        { label: "About Us", path: "/aboutus" },
        { label: "About Project", path: "/aboutproject" },
      ],
    },
  };

  const HoverPopup = ({ data }) => (
    <div 
      className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 w-64 z-50 animate-fadeIn"
      onMouseEnter={() => handleMouseEnter(hoveredItem)}
      onMouseLeave={handleMouseLeave}
    >
      <ul className="flex flex-col py-2">
        {data.map((navItem, index) => (
          <li key={index}>
            <Link
              to={navItem.path}
              className="flex items-center justify-between px-4 py-3 
                         text-gray-700 hover:bg-gray-100 
                         transition-all duration-200 rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="font-medium">{navItem.label}</span>
              <svg
                className="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <header className="topbar">
      <div className="left-section">
        {/* Allen Logo - clickable to open sidebar on mobile, regular link on desktop */}
        <div className="block md:hidden">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrvaJMaCtx0exwrtEvIzdfopHdsoKOp7qLDg&s"
            alt="Logo"
            className="logo cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>
        
        {/* Logo - regular link for desktop */}
        <Link to="/" className="hidden md:block">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrvaJMaCtx0exwrtEvIzdfopHdsoKOp7qLDg&s"
            alt="Logo"
            className="logo"
          />
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className="middle-section desktop-nav">
        {["courses", "testSeries", "material", "more"].map((item) => (
          <div
            key={item}
            className="relative"
            onMouseEnter={() => handleMouseEnter(item)}
            onMouseLeave={handleMouseLeave}
          >
            <span className="link cursor-pointer capitalize">{item}</span>
            {hoveredItem === item && (
              <HoverPopup
                data={
                  session?.type === "admin"
                    ? navigationData[item].admin
                    : navigationData[item].user
                }
              />
            )}
          </div>
        ))}
      </nav>

      <div className="right-section">
        <div className="hidden md:block">
          <CallUsButton />
        </div>
        
        {/* Phone button - always shown in mobile view */}
        <div className="block md:hidden mr-1">
          <CallUsButton />
        </div>
        
        {session ? (
          <button
            onClick={handleLogout}
            className="login-btn bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/user/login"
            className="login-btn bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Login
          </Link>
        )}
      </div>

      {/* Mobile Menu - Slide from right */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-menu-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="mobile-menu-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-menu-header">
              <h2 
                className="text-lg font-bold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => {
                  navigate('/');
                  setIsMobileMenuOpen(false);
                }}
              >
                Menu
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mobile-menu-content">
              {["courses", "testSeries", "material", "more"].map((item) => (
                <div key={item} className="mobile-menu-section">
                  <h3 className="mobile-menu-title capitalize">{item}</h3>
                  <div className="mobile-menu-links">
                    {(session?.type === "admin"
                      ? navigationData[item].admin
                      : navigationData[item].user
                    ).map((navItem, index) => (
                      <div
                        key={index}
                        className="mobile-menu-link"
                        onClick={() => handleMobileNavigation(navItem.path, navItem.label)}
                      >
                        {navItem.label}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

