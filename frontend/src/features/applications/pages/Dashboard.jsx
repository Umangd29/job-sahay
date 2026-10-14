
import { useApplications } from "../hooks/useApplications";
import { useLocation } from "react-router";
import Sidebar from "../components/Sidebar";
import HeaderToolbar from "../components/HeaderToolbar";
import StatsOverview from "../components/StatsOverview";
import KanbanBoard from "../components/KanbanBoard";
import TableView from "../components/TableView";
import ApplicationModal from "../components/ApplicationModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import "../style/dashboard.scss";
import "../style/kanban.scss";

const Dashboard = () => {
  const { loading, actionError, setActionError, viewMode } =
    useApplications();

  const location = useLocation();

  // Determine the current page from the URL.
  const isHomePage = location.pathname === "/dashboard";
  const isBoardPage = location.pathname === "/board";

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="main-viewport">
        <HeaderToolbar />

        <div className="content-area">
          {actionError && (
            <div className="error-banner" role="alert">
              <span>⚠️ {actionError}</span>
              <button
                type="button"
                onClick={() => setActionError(null)}
              >
                Dismiss
              </button>
            </div>
          )}

          {/* HOME PAGE */}
          {isHomePage && (
            <>
              <div className="page-heading">
                <h1>Dashboard Overview</h1>
                <p>
                  Welcome back! Here's an overview of your job applications.
                </p>
              </div>

              <StatsOverview />

              {loading ? (
                <p>Loading your recent applications...</p>
              ) : (
                <section className="home-overview">
                  <h2>Quick Actions</h2>
                  <p>
                    Open your Board to manage applications, update their
                    status, and track your job search progress.
                  </p>
                </section>
              )}
            </>
          )}

          {/* BOARD PAGE */}
          {isBoardPage && (
            <>
              <StatsOverview />

              {loading ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "320px",
                    color: "#64748b",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "3px solid #e2e8f0",
                      borderTopColor: "#7c3aed",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />

                  <p style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                    Updating board...
                  </p>
                </div>
              ) : viewMode === "table" ? (
                <TableView />
              ) : (
                <KanbanBoard />
              )}
            </>
          )}
        </div>
      </main>

      <ApplicationModal />
      <DeleteConfirmModal />
    </div>
  );
};

export default Dashboard;
