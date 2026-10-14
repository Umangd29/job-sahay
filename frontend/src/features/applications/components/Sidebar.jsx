
import { NavLink } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth";
import {
  LayoutDashboard,
  Kanban,
  BarChart3,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const { user, handleLogout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand">
          <div className="brand-icon">
            <img
              src="/Job Sahay Career Growth Logo.png"
              alt="Job Sahay Logo"
            />
          </div>
          <span className="brand-name">Job Sahay</span>
        </div>

        <nav className="nav-menu" aria-label="Main Navigation">
          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <LayoutDashboard size={18} className="nav-icon" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/board"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Kanban size={18} className="nav-icon" />
            <span>Board</span>
          </NavLink>

          <NavLink
            to="/statistics"
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <BarChart3 size={18} className="nav-icon" />
            <span>Statistics</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="user-profile">
          <div
            className="user-avatar"
            title={user?.username || "User"}
          >
            {(user?.username?.[0] || "U").toUpperCase()}
          </div>

          <div className="user-info">
            <span className="user-name">
              {user?.username || "Job Seeker"}
            </span>
            <span className="user-email">
              {user?.email || ""}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="btn-logout"
          title="Sign out of your account"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
