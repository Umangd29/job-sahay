
const express = require("express");
const router = express.Router();

const {
  createApplicationController,
  getApplicationsController,
  getDashboardStatsController,
  getApplicationByIdController,
  updateApplicationController,
  updateApplicationStatusController,
  deleteApplicationController,
} = require("../controllers/application.controller");

const { authUser } = require("../middlewares/auth.middleware");

// All application routes require authentication.
router.use(authUser);

// Dashboard statistics
router.get("/stats", getDashboardStatsController);

// Create and list applications
router.post("/", createApplicationController);
router.get("/", getApplicationsController);

// Update application status
router.patch("/:id/status", updateApplicationStatusController);

// Read, update, and delete a specific application
router.get("/:id", getApplicationByIdController);
router.patch("/:id", updateApplicationController);
router.delete("/:id", deleteApplicationController);

module.exports = router;
