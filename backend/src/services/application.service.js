
const mongoose = require("mongoose");

const {
  JobApplication,
  VALID_STATUSES,
} = require("../models/jobApplication.model");

/**
 * Validate MongoDB IDs.
 */
function validateObjectId(id, fieldName = "application ID") {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName}`);
  }
}

/**
 * Validate application status.
 */
function validateStatus(status) {
  if (
    typeof status !== "string" ||
    !VALID_STATUSES.includes(status)
  ) {
    throw new Error(
      `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
    );
  }
}

/**
 * Validate request data is a plain object.
 */
function validateObject(data, fieldName = "Application data") {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new Error(`${fieldName} must be a valid object`);
  }
}

/**
 * Create a new job application for the authenticated user.
 */
async function createApplication(userId, data) {
  validateObject(data);

  validateObjectId(userId, "user ID");

  const {
    companyName,
    jobTitle,
    applicationDate,
    status = "Applied",
    notes = "",
  } = data;

  if (
    typeof companyName !== "string" ||
    !companyName.trim()
  ) {
    throw new Error("Company name is required and cannot be empty");
  }

  if (
    typeof jobTitle !== "string" ||
    !jobTitle.trim()
  ) {
    throw new Error("Job title is required and cannot be empty");
  }

  if (!applicationDate) {
    throw new Error("Application date is required");
  }

  const parsedDate = new Date(applicationDate);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid application date provided");
  }

  validateStatus(status);

  if (typeof notes !== "string") {
    throw new Error("Notes must be a string");
  }

  const application = await JobApplication.create({
    companyName: companyName.trim(),
    jobTitle: jobTitle.trim(),
    applicationDate: parsedDate,
    status,
    notes: notes.trim(),
    userId,
  });

  return application;
}

/**
 * Get applications for the authenticated user.
 * Supports search, status filtering, and sorting.
 */
async function getApplications(userId, filters = {}) {
  validateObjectId(userId, "user ID");
  validateObject(filters, "Filters");

  const {
    search,
    status,
    sortBy = "applicationDate",
    sortOrder = "desc",
  } = filters;

  const query = { userId };

  // Status filter
  if (status && status !== "All") {
    validateStatus(status);
    query.status = status;
  }

  // Search company name and job title safely.
  if (search !== undefined) {
    if (typeof search !== "string") {
      throw new Error("Invalid search value");
    }

    const trimmedSearch = search.trim();

    if (trimmedSearch) {
      // Escape regex special characters to treat search as literal text.
      const escapedSearch = trimmedSearch.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

      query.$or = [
        {
          companyName: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
        {
          jobTitle: {
            $regex: escapedSearch,
            $options: "i",
          },
        },
      ];
    }
  }

  // Allow only approved sorting fields.
  const allowedSortFields = [
    "applicationDate",
    "companyName",
    "jobTitle",
    "createdAt",
  ];

  if (!allowedSortFields.includes(sortBy)) {
    throw new Error("Invalid sort field");
  }

  if (!["asc", "desc"].includes(sortOrder)) {
    throw new Error("Invalid sort order");
  }

  const sortOptions = {
    [sortBy]: sortOrder === "asc" ? 1 : -1,
  };

  // Ownership restriction is applied to every list query.
  return JobApplication.find(query).sort(sortOptions);
}

/**
 * Get one application belonging to the authenticated user.
 */
async function getApplicationById(userId, applicationId) {
  validateObjectId(userId, "user ID");
  validateObjectId(applicationId);

  return JobApplication.findOne({
    _id: applicationId,
    userId,
  });
}

/**
 * Update editable application fields.
 */
async function updateApplication(
  userId,
  applicationId,
  updateData
) {
  validateObjectId(userId, "user ID");
  validateObjectId(applicationId);
  validateObject(updateData, "Update data");

  const allowedUpdates = [
    "companyName",
    "jobTitle",
    "applicationDate",
    "status",
    "notes",
  ];

  const providedFields = Object.keys(updateData);

  // Reject unknown fields instead of silently accepting them.
  const invalidFields = providedFields.filter(
    (field) => !allowedUpdates.includes(field)
  );

  if (invalidFields.length > 0) {
    throw new Error(
      `Invalid update fields: ${invalidFields.join(", ")}`
    );
  }

  const sanitizedUpdates = {};

  for (const key of allowedUpdates) {
    if (updateData[key] === undefined) {
      continue;
    }

    const value = updateData[key];

    if (key === "companyName" || key === "jobTitle") {
      if (typeof value !== "string" || !value.trim()) {
        throw new Error(`${key} cannot be empty`);
      }

      sanitizedUpdates[key] = value.trim();
    } else if (key === "applicationDate") {
      if (
        typeof value !== "string" &&
        !(value instanceof Date) &&
        typeof value !== "number"
      ) {
        throw new Error("Invalid application date");
      }

      const parsedDate = new Date(value);

      if (Number.isNaN(parsedDate.getTime())) {
        throw new Error("Invalid application date");
      }

      sanitizedUpdates[key] = parsedDate;
    } else if (key === "status") {
      validateStatus(value);
      sanitizedUpdates[key] = value;
    } else if (key === "notes") {
      if (typeof value !== "string") {
        throw new Error("Notes must be a string");
      }

      sanitizedUpdates[key] = value.trim();
    }
  }

  if (Object.keys(sanitizedUpdates).length === 0) {
    throw new Error("No valid fields provided for update");
  }

  // Both ID and user ID are required for ownership protection.
  return JobApplication.findOneAndUpdate(
    {
      _id: applicationId,
      userId,
    },
    {
      $set: sanitizedUpdates,
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );
}

/**
 * Update application status directly.
 */
async function updateApplicationStatus(
  userId,
  applicationId,
  status
) {
  validateObjectId(userId, "user ID");
  validateObjectId(applicationId);
  validateStatus(status);

  return JobApplication.findOneAndUpdate(
    {
      _id: applicationId,
      userId,
    },
    {
      $set: { status },
    },
    {
      returnDocument: "after",
      runValidators: true,
    }
  );
}

/**
 * Delete an application belonging to the authenticated user.
 */
async function deleteApplication(userId, applicationId) {
  validateObjectId(userId, "user ID");
  validateObjectId(applicationId);

  return JobApplication.findOneAndDelete({
    _id: applicationId,
    userId,
  });
}

/**
 * Calculate dashboard statistics for the authenticated user.
 */
async function getDashboardStats(userId) {
  validateObjectId(userId, "user ID");

  const userObjectId = new mongoose.Types.ObjectId(userId);

  const statsAggregation = await JobApplication.aggregate([
    {
      $match: {
        userId: userObjectId,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  let totalApplications = 0;
  let interviews = 0;
  let offers = 0;
  let rejections = 0;

  for (const item of statsAggregation) {
    totalApplications += item.count;

    if (item._id === "Interview") {
      interviews = item.count;
    }

    if (item._id === "Offer") {
      offers = item.count;
    }

    if (item._id === "Rejected") {
      rejections = item.count;
    }
  }

  return {
    totalApplications,
    interviews,
    offers,
    rejections,
  };
}

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
  getDashboardStats,
};
