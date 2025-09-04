import { useRecoilState } from "recoil";
import { 
  userFirstNameAtom, 
  userLastNameAtom, 
  userSignupEmailAtom, 
  userSignupPasswordAtom 
} from "../../store/userAtoms";
import AuthLayout from "../../Components/AuthLayout";
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

  return (
    <div className="legacy">
      <AuthLayout title="User Signup">
        <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button onClick={handleSignup} disabled={loading}>
          {loading ? "Signing up..." : "Sign up"}
        </button>

        {msg && (
          <p style={{ color: msg.includes("successful") ? "green" : "red", marginTop: "10px", textAlign: "center" }}>
            {msg}
          </p>
        )}

        <div className="links">
          <Link to="/user/login">Already have an account?</Link>
        </div>
      </AuthLayout>
    </div>
  );
}