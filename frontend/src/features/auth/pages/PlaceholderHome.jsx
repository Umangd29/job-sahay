import { useAuth } from "../hooks/useAuth";

const PlaceholderHome = () => {
  const { user, handleLogout } = useAuth();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "24px"
      }}
    >
      <div
        style={{
          background: "#ffffff",
          padding: "32px 40px",
          borderRadius: "16px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          textAlign: "center",
          maxWidth: "480px"
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "12px" }}>💎</div>
        <h2 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "8px", color: "#0f172a" }}>
          Welcome, {user?.username || "Job Seeker"}!
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "24px" }}>
          Authentication & Frontend Foundation (Phase 3) is active. The Kanban Board and Dashboard will be mounted in Phase 4.
        </p>
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ padding: "8px 20px" }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default PlaceholderHome;
