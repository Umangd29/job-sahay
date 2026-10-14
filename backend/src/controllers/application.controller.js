
const mongoose = require("mongoose");
const applicationService = require("../services/application.service");

/**
 * Return a consistent error response.
 * Do not expose internal database errors to clients.
 */
function handleError(res, error, fallbackMessage) {
  const message =
    typeof error?.message === "string" ? error.message : "";

  // Known validation errors from the service layer
  const isClientError =
    /required|invalid|cannot be empty|no valid fields|must be|not allowed|unsupported|too long|too short/i.test(
      message
    );

  if (isClientError) {
    return res.status(400).json({
      success: false,
      message,
    });
  }

  if (
    error instanceof mongoose.Error.CastError ||
    error instanceof mongoose.Error.ValidationError
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid application data",
    });
  }

  console.error(fallbackMessage, error);

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
}

/**
 * Validate request body.
 */
function isValidBody(body) {
  return (
    body !== null &&
    typeof body === "object" &&
    !Array.isArray(body)
  );
}

/**
 * Validate query parameters.
 */
function isValidQueryValue(value) {
  return value === undefined || typeof value === "string";
}

/**
 * Create a new job application
 * POST /api/applications
 */
async function createApplicationController(req, res) {
  try {
    if (!isValidBody(req.body)) {
      return res.status(400).json({
        success: false,
        message: "A valid request body is required",
      });
    }

    const userId = req.user.id;

    const application = await applicationService.createApplication(
      userId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Application created successfully",
      application,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to create application"
    );
  }
}

/**
 * Get applications with optional search, filtering, and sorting
 * GET /api/applications
 */
async function getApplicationsController(req, res) {
  try {
    const { search, status, sortBy, sortOrder } = req.query;

    if (
      !isValidQueryValue(search) ||
      !isValidQueryValue(status) ||
      !isValidQueryValue(sortBy) ||
      !isValidQueryValue(sortOrder)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
      });
    }

    const userId = req.user.id;

    const applications = await applicationService.getApplications(
      userId,
      {
        search,
        status,
        sortBy,
        sortOrder,
      }
    );

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to fetch applications"
    );
  }
}

/**
 * Get dashboard statistics
 * GET /api/applications/stats
 */
async function getDashboardStatsController(req, res) {
  try {
    const stats = await applicationService.getDashboardStats(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to retrieve statistics"
    );
  }
}

/**
 * Get a single application
 * GET /api/applications/:id
 */
async function getApplicationByIdController(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application =
      await applicationService.getApplicationById(
        req.user.id,
        id
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found or inaccessible",
      });
    }

    return res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to retrieve application"
    );
  }
}

/**
 * Update application fields
 * PATCH /api/applications/:id
 */
async function updateApplicationController(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    if (!isValidBody(req.body)) {
      return res.status(400).json({
        success: false,
        message: "A valid request body is required",
      });
    }

    const application =
      await applicationService.updateApplication(
        req.user.id,
        id,
        req.body
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found or inaccessible",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application updated successfully",
      application,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to update application"
    );
  }
}

/**
 * Update application status
 * PATCH /api/applications/:id/status
 */
async function updateApplicationStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    if (typeof status !== "string" || !status.trim()) {
      return res.status(400).json({
        success: false,
        message: "A valid status string is required",
      });
    }

    const application =
      await applicationService.updateApplicationStatus(
        req.user.id,
        id,
        status.trim()
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found or inaccessible",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to update application status"
    );
  }
}

/**
 * Delete an application
 * DELETE /api/applications/:id
 */
async function deleteApplicationController(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid application ID",
      });
    }

    const application =
      await applicationService.deleteApplication(
        req.user.id,
        id
      );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found or inaccessible",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Application deleted successfully",
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "Failed to delete application"
    );
  }
}

module.exports = {
  createApplicationController,
  getApplicationsController,
  getDashboardStatsController,
  getApplicationByIdController,
  updateApplicationController,
  updateApplicationStatusController,
  deleteApplicationController,
};
