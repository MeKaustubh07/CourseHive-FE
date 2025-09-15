import { useRecoilState, useRecoilValueLoadable } from "recoil";
import { loginEmailAtom, loginPasswordAtom, loginSelector } from "../../store/adminAtoms";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../../Components/AuthLayout";
import GoogleAuth from "../../Components/GoogleAuth";
import api from "../../lib/api";


export default function Login() {
  const userType = "admin";
  const [email, setEmail] = useRecoilState(loginEmailAtom(userType));
  const [password, setPassword] = useRecoilState(loginPasswordAtom(userType));
  const [triggerLogin, setTriggerLogin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  let loginLoadable;
  if (triggerLogin) {
    loginLoadable = useRecoilValueLoadable(
      loginSelector({ type: userType, email, password })
    );
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setMsg("Email & password are required.");
      return;
    }
    try {
      setLoading(true);
      setMsg("");
  
      const res = await api.post("/api/admin/login", { email, password });
  
      if (res.data?.success) {
        // 🔴 Clear any active user session first
        localStorage.removeItem("user_token");
        localStorage.removeItem("user_user");
  
        // ✅ Store admin token + data
        if (res.data.token) {
          localStorage.setItem("admin_token", res.data.token);
        }
  
        if (res.data.user) {
          const adminData = {
            firstName: res.data.user.firstName,
            lastName: res.data.user.lastName,
            email: res.data.user.email,
          };
          localStorage.setItem("admin_user", JSON.stringify(adminData));
          console.log("✅ Admin data stored:", adminData);
  
          // notify Topbar (or any listener)
          window.dispatchEvent(new Event("sessionUpdate"));
        }
  
        setMsg("Signin successful! Welcome to EduPortal!");
        setEmail("");
        setPassword("");
  
        setTimeout(() => navigate("/"), 1000);
      } else {
        setMsg(res.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMsg(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (googleUser, credential) => {
    try {
      setLoading(true);
      setMsg("");

      // Send Google auth data to your backend
      const response = await api.post("/api/admin/google-auth", {
        googleUser,
        credential,
        mode: 'login'
      });

      if (response.data?.success) {
        // Clear any active user session first
        localStorage.removeItem("user_token");
        localStorage.removeItem("user_user");

        // Store admin token + data
        if (response.data.token) {
          localStorage.setItem("admin_token", response.data.token);
        }

        if (response.data.user) {
          const adminData = {
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            email: response.data.user.email,
            profilePicture: response.data.user.profilePicture
          };
          localStorage.setItem("admin_user", JSON.stringify(adminData));
          console.log("✅ Admin Google auth successful:", adminData);

          // notify Topbar
          window.dispatchEvent(new Event("sessionUpdate"));
        }

        setMsg("Google signin successful! Welcome to EduPortal!");
        setTimeout(() => navigate("/"), 1000);
      } else {
        setMsg(response.data?.message || "Google signin failed");
      }
    } catch (err) {
      console.error("Google auth error:", err);
      setMsg(err.response?.data?.message || "Google signin failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google Auth Error:", error);
    setMsg("Google authentication failed. Please try again.");
  };

  return (
    <AuthLayout title="Admin Login">
      {/* Inputs */}
      <input
        type="email"
        placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login button */}
        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Google Auth */}
        <GoogleAuth 
          onSuccess={handleGoogleAuth}
          onError={handleGoogleError}
          userType="admin"
          mode="login"
        />

        {/* Show message */}
        {msg && (
          <p style={{ color: msg.includes("successful") ? "green" : "red" }}>
            {msg}
          </p>
        )}

        {/* Links */}
        <div className="links">
          <Link to="/admin/signup">Don’t have an account?</Link>
        </div>

        {/* Status from Recoil */}
        {triggerLogin && (
          <div className="status">
            {loginLoadable.state === "loading" && <p>Logging in...</p>}
            {loginLoadable.state === "hasValue" &&
              (loginLoadable.contents.success ? (
                <p style={{ color: "green" }}>Login successful!</p>
              ) : (
                <p style={{ color: "red" }}>{loginLoadable.contents.message}</p>
              ))}
            {loginLoadable.state === "hasError" && (
              <p style={{ color: "red" }}>Error occurred</p>
            )}
          </div>
        )}
      </AuthLayout>
  );
}