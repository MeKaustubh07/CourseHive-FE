import { useRecoilState } from "recoil";
import { firstNameAtom, lastNameAtom, signupEmailAtom, signupPasswordAtom } from "../../store/adminAtoms";
import AuthLayout from "../../Components/AuthLayout";
import GoogleAuth from "../../Components/GoogleAuth";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/api";

export default function AdminSignup() {
  const userType = "admin";
  const [firstName, setFirstName] = useRecoilState(firstNameAtom(userType));
  const [lastName, setLastName] = useRecoilState(lastNameAtom(userType));
  const [email, setEmail] = useRecoilState(signupEmailAtom(userType));
  const [password, setPassword] = useRecoilState(signupPasswordAtom(userType));
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      setMsg("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      setMsg("");

      const res = await api.post("/api/admin/signup", { firstName, lastName, email, password });

      if (res.data?.success) {
        // ✅ clear any user session
        localStorage.removeItem("user_user");
        localStorage.removeItem("user_token");

        // ✅ persist admin session (user object is the source of truth)
        if (res.data.user) {
          const a = res.data.user;
          const adminData = { firstName: a.firstName, lastName: a.lastName, email: a.email };
          localStorage.setItem("admin_user", JSON.stringify(adminData));
        }
        if (res.data.token) {
          localStorage.setItem("admin_token", res.data.token);
        }

        // ✅ tell Topbar to refresh
        window.dispatchEvent(new Event("sessionUpdate"));

        setMsg("Signup successful! Welcome to EduPortal!");
        setFirstName(""); setLastName(""); setEmail(""); setPassword("");
        setTimeout(() => navigate("/"), 400);
      } else {
        setMsg(res.data?.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setMsg(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (googleUser, credential) => {
    try {
      setLoading(true);
      setMsg("");

      // Send Google auth data to backend for signup
      const response = await api.post("/api/admin/google-auth", {
        googleUser,
        credential,
        mode: 'signup'
      });

      if (response.data?.success) {
        // Clear any user session
        localStorage.removeItem("user_user");
        localStorage.removeItem("user_token");

        // Store admin session
        if (response.data.user) {
          const adminData = {
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            email: response.data.user.email,
            profilePicture: response.data.user.profilePicture
          };
          localStorage.setItem("admin_user", JSON.stringify(adminData));
        }
        if (response.data.token) {
          localStorage.setItem("admin_token", response.data.token);
        }

        // Tell Topbar to refresh
        window.dispatchEvent(new Event("sessionUpdate"));

        setMsg("Google signup successful! Welcome to EduPortal!");
        setFirstName(""); setLastName(""); setEmail(""); setPassword("");
        setTimeout(() => navigate("/"), 400);
      } else {
        setMsg(response.data?.message || "Google signup failed");
      }
    } catch (err) {
      console.error("Google signup error:", err);
      setMsg(err.response?.data?.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google Auth Error:", error);
    setMsg("Google authentication failed. Please try again.");
  };

  return (
    <AuthLayout title="Admin Signup">
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button onClick={handleSignup} disabled={loading}>
          {loading ? "Creating account..." : "Sign up"}
        </button>

        {/* Google Auth */}
        <GoogleAuth 
          onSuccess={handleGoogleAuth}
          onError={handleGoogleError}
          userType="admin"
          mode="signup"
        />

        {msg && (
          <p style={{ color: msg.includes("successful") ? "green" : "red", marginTop: "10px", textAlign: "center" }}>
            {msg}
          </p>
        )}

        <div className="links">
          <Link to="/admin/login">Already have an account?</Link>
        </div>
      </AuthLayout>
  );
}