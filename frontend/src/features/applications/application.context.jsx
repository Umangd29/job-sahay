import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  getApplications,
  getDashboardStats,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication
} from "./services/applications.api";

export const ApplicationContext = createContext(null);

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalApplications: 0,
    interviews: 0,
    offers: 0,
    rejections: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState(null);

  // Filters & Controls
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("applicationDate_desc");
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" or "table"

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create"); // "create" | "edit"
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [preselectedStatus, setPreselectedStatus] = useState("Applied");

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // Parse sortBy dropdown value into backend query params
  const { sortField, sortDirection } = useMemo(() => {
    switch (sortBy) {
      case "applicationDate_asc":
        return { sortField: "applicationDate", sortDirection: "asc" };
      case "companyName_asc":
        return { sortField: "companyName", sortDirection: "asc" };
      case "companyName_desc":
        return { sortField: "companyName", sortDirection: "desc" };
      case "jobTitle_asc":
        return { sortField: "jobTitle", sortDirection: "asc" };
      case "applicationDate_desc":
      default:
        return { sortField: "applicationDate", sortDirection: "desc" };
    }
  }, [sortBy]);

  // Fetch applications & stats from backend
  const refreshData = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const [appsData, statsData] = await Promise.all([
        getApplications({
          search: search.trim() || undefined,
          status: statusFilter !== "All" ? statusFilter : undefined,
          sortBy: sortField,
          sortOrder: sortDirection
        }),
        getDashboardStats()
      ]);

      setApplications(appsData.applications || []);
      if (statsData.stats) {
        setStats(statsData.stats);
      }
    } catch (error) {
      setActionError(error.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortField, sortDirection]);

  // Initial & reactive data fetch
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Create Application
  const handleCreate = async (formData) => {
    setActionError(null);
    try {
      const result = await createApplication(formData);
      if (result.success && result.application) {
        // Refresh to guarantee consistent sorting and accurate aggregation
        await refreshData();
        setIsModalOpen(false);
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (error) {
      setActionError(error.message);
      return { success: false, message: error.message };
    }
  };

  // Update Application
  const handleUpdate = async (id, formData) => {
    setActionError(null);
    try {
      const result = await updateApplication(id, formData);
      if (result.success && result.application) {
        await refreshData();
        setIsModalOpen(false);
        return { success: true };
      }
      return { success: false, message: result.message };
    } catch (error) {
      setActionError(error.message);
      return { success: false, message: error.message };
    }
  };

  // Direct Status Update with Optimistic UI & Server Sync
  const handleStatusChange = async (id, newStatus) => {
    setActionError(null);
    const previousApplications = [...applications];

    // Optimistically update local application status
    setApplications((prev) =>
      prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
    );

    try {
      const result = await updateApplicationStatus(id, newStatus);
      if (!result.success) {
        throw new Error(result.message || "Failed to update status");
      }
      // Re-sync dashboard stats with MongoDB
      const statsData = await getDashboardStats();
      if (statsData.stats) {
        setStats(statsData.stats);
      }
      return { success: true };
    } catch (error) {
      // Rollback to previous state on failure
      setApplications(previousApplications);
      setActionError(error.message);
      return { success: false, message: error.message };
    }
  };

  // Delete Application with Optimistic UI & Server Sync
  const handleDelete = async (id) => {
    setActionError(null);
    setDeleteInProgress(true);
    const previousApplications = [...applications];

    // Optimistic delete
    setApplications((prev) => prev.filter((app) => app._id !== id));

    try {
      const result = await deleteApplication(id);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete application");
      }
      const statsData = await getDashboardStats();
      if (statsData.stats) {
        setStats(statsData.stats);
      }
      setDeleteConfirmId(null);
      return { success: true };
    } catch (error) {
      // Rollback on failure
      setApplications(previousApplications);
      setActionError(error.message);
      return { success: false, message: error.message };
    } finally {
      setDeleteInProgress(false);
    }
  };

  // Modal Handlers
  const openCreateModal = (status = "Applied") => {
    setModalMode("create");
    setPreselectedStatus(status);
    setSelectedApplication(null);
    setIsModalOpen(true);
  };

  const openEditModal = (application) => {
    setModalMode("edit");
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
  };

  const openDeleteConfirm = (id) => {
    setDeleteConfirmId(id);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmId(null);
  };

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        stats,
        loading,
        actionError,
        setActionError,
        search,
        setSearch,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        isModalOpen,
        modalMode,
        selectedApplication,
        preselectedStatus,
        deleteConfirmId,
        deleteInProgress,
        refreshData,
        handleCreate,
        handleUpdate,
        handleStatusChange,
        handleDelete,
        openCreateModal,
        openEditModal,
        closeModal,
        openDeleteConfirm,
        closeDeleteConfirm
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};
