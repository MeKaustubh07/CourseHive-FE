import { useRecoilState } from "recoil";
import { 
  userFirstNameAtom, 
  userLastNameAtom, 
  userSignupEmailAtom, 
  userSignupPasswordAtom 
} from "../../store/userAtoms";
import AuthLayout from "../../Components/AuthLayout";
import GoogleAuth from "../../Components/GoogleAuth";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/api";

export default function UserSignup() {
  const userType = "user";
  const [firstName, setFirstName] = useRecoilState(userFirstNameAtom(userType));
  const [lastName, setLastName] = useRecoilState(userLastNameAtom(userType));
  const [email, setEmail] = useRecoilState(userSignupEmailAtom(userType));
  const [password, setPassword] = useRecoilState(userSignupPasswordAtom(userType));

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

      const res = await api.post("/api/user/signup", { firstName, lastName, email, password });

      if (res.data?.success) {
         
        if (res.data.user) {
          const userData = {
            firstName: res.data.user.firstName,
            lastName: res.data.user.lastName,
            email: res.data.user.email,
          };
        
          // clear admin session
          localStorage.removeItem("admin_user");
          localStorage.removeItem("admin_token");
          
          // store user session
          localStorage.setItem("user_user", JSON.stringify(userData));
        
          window.dispatchEvent(new Event("sessionUpdate"));
        }

        if (res.data.token) {
          localStorage.setItem("user_token", res.data.token);
        }

        setMsg("Signup successful! Welcome to EduPortal!");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setTimeout(() => navigate("/"), 1000);
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

      console.log('🚀 Starting Google Auth for signup...');
      console.log('📍 Current Origin:', window.location.origin);
      console.log('👤 Google User:', googleUser);

      // Send Google auth data to backend for user signup
      const response = await api.post("/api/user/google-auth", {
        googleUser,
        credential,
        mode: 'signup'
      });

      console.log('📡 Backend Response:', response.data);

      if (response.data?.success) {
        if (response.data.user) {
          const userData = {
            firstName: response.data.user.firstName,
            lastName: response.data.user.lastName,
            email: response.data.user.email,
            profilePicture: response.data.user.profilePicture
          };

          // clear admin session
          localStorage.removeItem("admin_user");
          localStorage.removeItem("admin_token");
          
          // store user session
          localStorage.setItem("user_user", JSON.stringify(userData));
          window.dispatchEvent(new Event("sessionUpdate"));
        }

        if (response.data.token) {
          localStorage.setItem("user_token", response.data.token);
        }

        setMsg("Google signup successful! Welcome to EduPortal!");
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setTimeout(() => navigate("/"), 1000);
      } else {
        console.error('❌ Backend returned success=false:', response.data);
        setMsg(response.data?.message || "Google signup failed - Backend error");
      }
    } catch (err) {
      console.error("❌ Google signup error:", err);
      console.error("📡 Error response:", err.response?.data);
      console.error("🌐 Request details:", {
        origin: window.location.origin,
        url: err.config?.url,
        method: err.config?.method
      });
      
      let errorMessage = "Google signup failed";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = `Google signup failed: ${err.message}`;
      }
      
      setMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error) => {
    console.error("❌ Google Auth Error:", error);
    console.error("📍 Current Origin:", window.location.origin);
    
    let errorMessage = "Google authentication failed";
    if (error?.type === 'initialization_error') {
      errorMessage = `OAuth Config Error: Origin ${error.origin} may not be authorized`;
    } else if (error?.error) {
      errorMessage = `Google Auth Error: ${error.error}`;
    }
    
    setMsg(`${errorMessage}. Please check console for details.`);
  };

  return (
    <AuthLayout title="User Signup">
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button onClick={handleSignup} disabled={loading}>
          {loading ? "Signing up..." : "Sign up"}
        </button>

        {/* Google Auth */}
        <GoogleAuth 
          onSuccess={handleGoogleAuth}
          onError={handleGoogleError}
          userType="user"
          mode="signup"
        />

        {msg && (
          <p style={{ color: msg.includes("successful") ? "green" : "red", marginTop: "10px", textAlign: "center" }}>
            {msg}
          </p>
        )}

        <div className="links">
          <Link to="/user/login">Already have an account?</Link>
        </div>
      </AuthLayout>
  );
}