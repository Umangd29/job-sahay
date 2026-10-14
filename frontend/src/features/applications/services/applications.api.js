import { API } from "../../auth/services/auth.api";

/**
 * Fetch all applications with optional search, status filtering, and sorting
 */
export async function getApplications(params = {}) {
  try {
    const response = await API.get("/api/applications", { params });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch applications";
    throw new Error(message);
  }
}

/**
 * Fetch dashboard statistics
 */
export async function getDashboardStats() {
  try {
    const response = await API.get("/api/applications/stats");
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to fetch dashboard statistics";
    throw new Error(message);
  }
}

/**
 * Create a new job application
 */
export async function createApplication(applicationData) {
  try {
    const response = await API.post("/api/applications", applicationData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to create application";
    throw new Error(message);
  }
}

/**
 * Update an existing job application
 */
export async function updateApplication(id, applicationData) {
  try {
    const response = await API.patch(`/api/applications/${id}`, applicationData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to update application";
    throw new Error(message);
  }
}

/**
 * Direct status update for an application
 */
export async function updateApplicationStatus(id, status) {
  try {
    const response = await API.patch(`/api/applications/${id}/status`, { status });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to update application status";
    throw new Error(message);
  }
}

/**
 * Delete a job application
 */
export async function deleteApplication(id) {
  try {
    const response = await API.delete(`/api/applications/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.message || "Failed to delete application";
    throw new Error(message);
  }
}
