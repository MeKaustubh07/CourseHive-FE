import { useRecoilState } from "recoil";
import { userLoginEmailAtom, userLoginPasswordAtom } from "../../store/userAtoms";
import AuthLayout from "../../Components/AuthLayout";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../lib/api";

export default function UserLogin() {
    const userType = "user";
    const [email, setEmail] = useRecoilState(userLoginEmailAtom(userType));
    const [password, setPassword] = useRecoilState(userLoginPasswordAtom(userType));
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email || !password) {
            setMsg("Email & password are required.");
            return;
        }

        try {
            setLoading(true);
            setMsg("");
            const res = await api.post("/api/user/login", { email, password });

            if (res.data?.success) {
              
              if (res.data.user) {
                const userData = {
                  firstName: res.data.user.firstName,
                  lastName: res.data.user.lastName,
                  email: res.data.user.email,
                };

              // 🔴 Clear any active user session first
              localStorage.removeItem("admin_token");
              localStorage.removeItem("admin_user");


              localStorage.setItem("user_user", JSON.stringify(userData));        
                // notify Topbar (or any listener)
                window.dispatchEvent(new Event("sessionUpdate"));
              }

              if (res.data.token) {
                localStorage.setItem("user_token", res.data.token);
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
            setMsg(err.response?.data?.message || err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout title="User Login">
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
                <button onClick={handleLogin} disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
                <div className="links">
                    <Link to="/user/signup">Sign up </Link> |
                    <Link to="/admin/signup"> Start as Admin</Link>
                </div>
                {msg && (
                    <p style={{ color: msg.includes("successful") ? "green" : "red" }}>
                        {msg}
                    </p>
                )}
            </AuthLayout>
    );
}