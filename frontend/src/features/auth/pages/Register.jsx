import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import "../auth.form.scss";

const Register = () => {
  const { handleRegister, loading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
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

    const trimmedUsername = formData.username.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedUsername || !trimmedEmail || !formData.password) {
      setErrorMessage("All fields are required.");
      return;
    }

    if (trimmedUsername.length < 3) {
      setErrorMessage("Username must be at least 3 characters.");
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    const result = await handleRegister({
      username: trimmedUsername,
      email: trimmedEmail,
      password: formData.password
    });

    if (result.success) {
      navigate("/");
    } else {
      setErrorMessage(result.message || "Failed to create account.");
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
            /></div>
          <span className="auth-eyebrow">Get Started</span>
          <h1>Create Account</h1>
          <p>Organize and streamline your job search in one place.</p>
        </div>

        {errorMessage && (
          <div className="auth-error-alert" role="alert">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g. samlee"
              autoComplete="username"
              required
              disabled={loading}
            />
          </div>

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
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-submit"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account →"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
