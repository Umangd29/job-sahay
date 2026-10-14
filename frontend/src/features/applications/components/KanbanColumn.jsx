
import { useState } from "react";
import { useApplications } from "../hooks/useApplications";
import ApplicationCard from "./ApplicationCard";
import { Plus, Send, Users, CheckCircle2, XCircle } from "lucide-react";

const STATUS_CONFIG = {
  Applied: {
    label: "APPLIED",
    headerClass: "header-applied",
    icon: <Send size={14} />,
  },
  Interview: {
    label: "INTERVIEW",
    headerClass: "header-interview",
    icon: <Users size={14} />,
  },
  Offer: {
    label: "OFFER",
    headerClass: "header-offer",
    icon: <CheckCircle2 size={14} />,
  },
  Rejected: {
    label: "REJECTED",
    headerClass: "header-rejected",
    icon: <XCircle size={14} />,
  },
};

const KanbanColumn = ({ status, applications }) => {
  const { openCreateModal, handleStatusChange } = useApplications();
  const [isDragOver, setIsDragOver] = useState(false);
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Applied;

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    // Ignore movement between children of the same column.
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setIsDragOver(false);

    const applicationId = event.dataTransfer.getData(
      "application/x-ai-job-tracker-id"
    );

    const previousStatus = event.dataTransfer.getData(
      "application/x-ai-job-tracker-status"
    );

    if (!applicationId || previousStatus === status) return;

    await handleStatusChange(applicationId, status);
  };

  return (
    <div
      className={`kanban-column${isDragOver ? " drag-over" : ""}`}
      aria-label={`${status} column`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className={`column-header ${config.headerClass}`}>
        <div className="column-title-wrap">
          <span className="column-icon">{config.icon}</span>
          <span className="column-title">{config.label}</span>
          <span className="column-count-badge">
            {applications.length}
          </span>
        </div>
      </div>

      <div className="cards-stack">
        {applications.length === 0 ? (
          <div className="empty-column">
            <span>No {status.toLowerCase()} jobs yet</span>
            <span className="drop-hint">Drop a card here to change its status</span>
          </div>
        ) : (
          applications.map((app) => (
            <ApplicationCard key={app._id} application={app} />
          ))
        )}
      </div>

      <button
        type="button"
        className="btn-column-add"
        onClick={() => openCreateModal(status)}
        title={`Add job to ${status}`}
      >
        <Plus size={14} />
        <span>Add job</span>
      </button>
    </div>
  );
};

export default KanbanColumn;
