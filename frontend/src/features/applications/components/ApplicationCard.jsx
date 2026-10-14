import { useApplications } from "../hooks/useApplications";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

const ApplicationCard = ({ application }) => {
  const { handleStatusChange, openEditModal, openDeleteConfirm } = useApplications();

  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    e.dataTransfer.setData("application/x-ai-job-tracker-id", application._id);
    e.dataTransfer.setData(
      "application/x-ai-job-tracker-status",
      application.status
    );
    e.dataTransfer.effectAllowed = "move";
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const formattedDate = (() => {
    if (!application.applicationDate) return "No date";
    const d = new Date(application.applicationDate);
    return isNaN(d.getTime())
      ? "Invalid date"
      : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  })();

  const statusClass = `status-${application.status.toLowerCase()}`;

  return (
    <article
      className={`app-card${isDragging ? " dragging" : ""}`}
      aria-label={`${application.jobTitle} at ${application.companyName}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="card-top">
        <span className="card-company" title={application.companyName}>
          {application.companyName}
        </span>
        <div className="card-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={() => openEditModal(application)}
            title="Edit Application"
            aria-label={`Edit ${application.jobTitle}`}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            className="btn-icon btn-delete"
            onClick={() => openDeleteConfirm(application._id)}
            title="Delete Application"
            aria-label={`Delete ${application.jobTitle}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h4 className="card-title" title={application.jobTitle}>
        {application.jobTitle}
      </h4>

      <div className="card-meta-row">
        <Calendar size={13} className="meta-icon" />
        <span>{formattedDate}</span>
      </div>

      {application.notes && application.notes.trim() && (
        <p className="card-notes-preview" title={application.notes}>
          {application.notes}
        </p>
      )}

      <div className="card-bottom-controls">
        <label htmlFor={`status-${application._id}`} style={{ fontSize: "0.72rem", color: "#64748b" }}>
          Status:
        </label>
        <select
          id={`status-${application._id}`}
          className={`status-select-badge ${statusClass}`}
          value={application.status}
          onChange={(e) => handleStatusChange(application._id, e.target.value)}
          aria-label={`Change status for ${application.companyName}`}
        >
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>
    </article>
  );
};

export default ApplicationCard;
