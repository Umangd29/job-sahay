import { useApplications } from "../hooks/useApplications";
import { AlertTriangle, X } from "lucide-react";
import "../style/modal.scss";

const DeleteConfirmModal = () => {
  const {
    deleteConfirmId,
    deleteInProgress,
    closeDeleteConfirm,
    handleDelete,
    applications
  } = useApplications();

  if (!deleteConfirmId) return null;

  const targetApp = applications.find((app) => app._id === deleteConfirmId);
  const targetTitle = targetApp
    ? `${targetApp.jobTitle} at ${targetApp.companyName}`
    : "this job application";

  const onConfirmDelete = async () => {
    await handleDelete(deleteConfirmId);
  };

  return (
    <div
      className="modal-backdrop"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-desc"
    >
      <div className="modal-dialog delete-dialog">
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertTriangle size={20} color="#dc2626" />
            <h3 id="delete-dialog-title">Delete Application</h3>
          </div>
          <button
            type="button"
            className="btn-close"
            onClick={closeDeleteConfirm}
            aria-label="Close dialog"
            disabled={deleteInProgress}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p id="delete-dialog-desc" className="delete-prompt">
            Are you sure you want to delete <strong>{targetTitle}</strong>? This action cannot be
            undone.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={closeDeleteConfirm}
            disabled={deleteInProgress}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirmDelete}
            disabled={deleteInProgress}
          >
            {deleteInProgress ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
