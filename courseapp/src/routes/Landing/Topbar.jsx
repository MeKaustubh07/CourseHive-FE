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
  const hoverTimeoutRef = useRef(null);

  // ✅ session check logic
  useEffect(() => {
    const checkSession = () => {
      try {
        const userStr = localStorage.getItem("user_user");
        const adminStr = localStorage.getItem("admin_user");

        const user = userStr ? JSON.parse(userStr) : null;
        const admin = adminStr ? JSON.parse(adminStr) : null;

        if (user) setSession({ type: "user", data: user });
        else if (admin) setSession({ type: "admin", data: admin });
        else setSession(null);
      } catch (error) {
        console.error("Error parsing session data:", error);
        setSession(null);
      }
    };

    checkSession();
    const handleUpdate = () => checkSession();

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
        <Link to="/">
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrvaJMaCtx0exwrtEvIzdfopHdsoKOp7qLDg&s"
            alt="Logo"
            className="logo"
          />
        </Link>
      </div>

      <nav className="middle-section">
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
        <CallUsButton />
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
    </header>
  );
}