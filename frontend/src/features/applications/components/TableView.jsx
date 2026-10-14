import { useApplications } from "../hooks/useApplications";
import { Pencil, Trash2 } from "lucide-react";

const TableView = () => {
  const { applications, handleStatusChange, openEditModal, openDeleteConfirm } = useApplications();

  if (applications.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "48px 20px",
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px dashed #cbd5e1",
          color: "#64748b"
        }}
      >
        <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>No job applications found</p>
      </div>
    );
  }

  return (
    <div className="table-view-container" aria-label="Job applications table view">
      <table>
        <thead>
          <tr>
            <th>Company</th>
            <th>Job Title</th>
            <th>Application Date</th>
            <th>Status</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => {
            const formattedDate = (() => {
              if (!app.applicationDate) return "N/A";
              const d = new Date(app.applicationDate);
              return isNaN(d.getTime())
                ? "N/A"
                : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
            })();

            return (
              <tr key={app._id}>
                <td style={{ fontWeight: 600, color: "#0f172a" }}>{app.companyName}</td>
                <td>{app.jobTitle}</td>
                <td>{formattedDate}</td>
                <td>
                  <select
                    className={`status-select-badge status-${app.status.toLowerCase()}`}
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                    aria-label={`Status for ${app.companyName}`}
                  >
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td style={{ maxWidth: "260px", color: "#64748b", fontSize: "0.82rem" }}>
                  {app.notes || "—"}
                </td>
                <td>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="btn-icon"
                      onClick={() => openEditModal(app)}
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      className="btn-icon btn-delete"
                      onClick={() => openDeleteConfirm(app._id)}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;
