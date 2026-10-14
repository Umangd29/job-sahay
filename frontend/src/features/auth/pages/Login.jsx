import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "../auth.form.scss";

const Login = () => {
  const { handleLogin, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.email.trim() || !formData.password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    const result = await handleLogin({
      email: formData.email.trim(),
      password: formData.password
    });

    if (result.success) {
      navigate("/");
    } else {
      setErrorMessage(result.message || "Failed to log in. Please check your credentials.");
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <img
              src="/Job%20Sahay%20Career%20Growth%20Logo.png"
              alt="Job Sahay Logo"
              style={{
                width: "60px",
                height: "auto",
                objectFit: "contain",
                display: "block",
                margin: "10px auto 20px",
              }}
            />
          </div>
          <span className="auth-eyebrow">Welcome Back</span>
          <h1>Sign In</h1>
          <p>Track your job applications and stay organized.</p>
        </div>

        {errorMessage && (
          <div className="auth-error-alert" role="alert">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In →"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account yet?
          <Link to="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
