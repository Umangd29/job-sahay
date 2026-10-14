
const mongoose = require("mongoose");

const blacklistTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // Automatically remove after 24 hours
    },
  },
  {
    versionKey: false,
  }
);

const Blacklist = mongoose.model(
  "Blacklist",
  blacklistTokenSchema
);

module.exports = Blacklist;
