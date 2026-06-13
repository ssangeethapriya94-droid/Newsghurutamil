import React, { useState } from "react";
import API from "../config/api";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("reporter");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await API.post("/api/login", {
        email,
        password,
        role,
      });

      const token = res.data?.token;
      const verifiedRole = res.data?.user?.role;

      if (!token) {
        throw new Error("Token not received");
      }

      // store token and role
      localStorage.setItem("token", token);
      localStorage.setItem("role", verifiedRole);
      if (res.data?.user?.name) {
        localStorage.setItem("userName", res.data.user.name);
      }

      alert("Login successful 🎉");

      // Redirect based on role
      if (verifiedRole === "admin") {
        navigate("/admin/dashboard");
      } else if (verifiedRole === "editor") {
        navigate("/editor/pending");
      } else if (verifiedRole === "reporter") {
        navigate("/reporter/create-news");
      } else {
        navigate("/");
      }

      // Force a page reload to update App layout state
      window.location.reload();

    } catch (error) {
      console.error("Login Error:", error);
      alert("Invalid email, password, or role ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      <form className="login-form" onSubmit={handleLogin}>

        <h2>NewsGhuru Login</h2>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="reporter">News Reporter</option>
          <option value="editor">Content Editor</option>
          <option value="admin">Super Admin</option>
        </select>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

    </div>
  );
}

export default Login;