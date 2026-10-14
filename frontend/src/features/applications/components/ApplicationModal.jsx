import { useState, useEffect } from "react";
import { useApplications } from "../hooks/useApplications";
import { X } from "lucide-react";
import "../style/modal.scss";

const VALID_STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

const ApplicationModal = () => {
  const {
    isModalOpen,
    modalMode,
    selectedApplication,
    preselectedStatus,
    closeModal,
    handleCreate,
    handleUpdate
  } = useApplications();

  const [formData, setFormData] = useState({
    companyName: "",
    jobTitle: "",
    applicationDate: new Date().toISOString().split("T")[0],
    status: "Applied",
    notes: ""
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Synchronize form when modal opens or selectedApplication changes
  useEffect(() => {
    if (isModalOpen) {
      setErrors({});
      setServerError("");
      if (modalMode === "edit" && selectedApplication) {
        const formattedDate = selectedApplication.applicationDate
          ? new Date(selectedApplication.applicationDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        setFormData({
          companyName: selectedApplication.companyName || "",
          jobTitle: selectedApplication.jobTitle || "",
          applicationDate: formattedDate,
          status: selectedApplication.status || "Applied",
          notes: selectedApplication.notes || ""
        });
      } else {
        // Create mode
        setFormData({
          companyName: "",
          jobTitle: "",
          applicationDate: new Date().toISOString().split("T")[0],
          status: preselectedStatus || "Applied",
          notes: ""
        });
      }
    }
  }, [isModalOpen, modalMode, selectedApplication, preselectedStatus]);

  if (!isModalOpen) return null;

  const validate = () => {
    const newErrors = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required";
    }

    if (!formData.applicationDate) {
      newErrors.applicationDate = "Application date is required";
    } else if (isNaN(new Date(formData.applicationDate).getTime())) {
      newErrors.applicationDate = "Please enter a valid date";
    }

    if (!VALID_STATUSES.includes(formData.status)) {
      newErrors.status = "Please select a valid status";
    }

    if (formData.notes && formData.notes.length > 2000) {
      newErrors.notes = "Notes cannot exceed 2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (serverError) setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        companyName: formData.companyName.trim(),
        jobTitle: formData.jobTitle.trim(),
        applicationDate: formData.applicationDate,
        status: formData.status,
        notes: formData.notes.trim()
      };

      let result;
      if (modalMode === "edit" && selectedApplication) {
        result = await handleUpdate(selectedApplication._id, payload);
      } else {
        result = await handleCreate(payload);
      }

      if (!result.success) {
        setServerError(result.message || "Failed to save application");
      }
    } catch (err) {
      setServerError(err.message || "Unexpected error saving application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-dialog">
        <div className="modal-header">
          <h3 id="modal-title">
            {modalMode === "edit" ? "Edit Job Application" : "Add New Job Application"}
          </h3>
          <button
            type="button"
            className="btn-close"
            onClick={closeModal}
            aria-label="Close dialog"
            disabled={submitting}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {serverError && (
              <div className="modal-error-alert" role="alert">
                <span>⚠️</span>
                <span>{serverError}</span>
              </div>
            )}

            {/* Company Name */}
            <div className="form-group">
              <label htmlFor="companyName">
                Company Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Google, Spotify, Microsoft"
                disabled={submitting}
                autoFocus
              />
              {errors.companyName && <span className="field-error">{errors.companyName}</span>}
            </div>

            {/* Job Title */}
            <div className="form-group">
              <label htmlFor="jobTitle">
                Job Title <span className="required-star">*</span>
              </label>
              <input
                type="text"
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder="e.g. Senior Frontend Engineer"
                disabled={submitting}
              />
              {errors.jobTitle && <span className="field-error">{errors.jobTitle}</span>}
            </div>

            {/* Application Date & Status in 2 Columns */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="applicationDate">
                  Application Date <span className="required-star">*</span>
                </label>
                <input
                  type="date"
                  id="applicationDate"
                  name="applicationDate"
                  value={formData.applicationDate}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.applicationDate && (
                  <span className="field-error">{errors.applicationDate}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="status">
                  Status <span className="required-star">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={submitting}
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
                {errors.status && <span className="field-error">{errors.status}</span>}
              </div>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="notes">Notes & Key Details</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Interview rounds, recruiter info, referral notes, etc."
                disabled={submitting}
                maxLength={2000}
                rows={3}
              />
              {errors.notes && <span className="field-error">{errors.notes}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting
                ? "Saving..."
                : modalMode === "edit"
                ? "Save Changes"
                : "Create Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal;
