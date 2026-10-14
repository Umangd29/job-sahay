
const mongoose = require("mongoose");

const VALID_STATUSES = [
  "Applied",
  "Interview",
  "Offer",
  "Rejected",
];

const jobApplicationSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [
        120,
        "Company name cannot exceed 120 characters",
      ],
    },

    jobTitle: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: [
        120,
        "Job title cannot exceed 120 characters",
      ],
    },

    applicationDate: {
      type: Date,
      required: [true, "Application date is required"],
      validate: {
        validator(value) {
          return (
            value instanceof Date &&
            !Number.isNaN(value.getTime())
          );
        },
        message: "Application date must be a valid date",
      },
    },

    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: VALID_STATUSES,
        message:
          "{VALUE} is not a supported status. Must be Applied, Interview, Offer, or Rejected",
      },
      default: "Applied",
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [
        2000,
        "Notes cannot exceed 2000 characters",
      ],
      default: "",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for user-specific filtering, sorting, and statistics.
jobApplicationSchema.index({ userId: 1, status: 1 });
jobApplicationSchema.index({
  userId: 1,
  applicationDate: -1,
});
jobApplicationSchema.index({ userId: 1, companyName: 1 });

const JobApplication = mongoose.model(
  "JobApplication",
  jobApplicationSchema
);

module.exports = {
  JobApplication,
  VALID_STATUSES,
};
