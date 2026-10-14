
const mongoose = require("mongoose");

/**
 * Connect to MongoDB using environment variables.
 *
 * Supports:
 * - MONGODB_URI
 * - MONGO_URI (fallback)
 */
async function connectToDB() {
  const mongoUri =
    process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!mongoUri || typeof mongoUri !== "string") {
    throw new Error(
      "MONGODB_URI or MONGO_URI is not defined in environment variables"
    );
  }

  try {
    const connection = await mongoose.connect(mongoUri);

    console.log(
      `MongoDB connected successfully: ${connection.connection.name}`
    );

    return connection;
  } catch (error) {
    console.error(
      "MongoDB connection failed:",
      error.message
    );

    throw error;
  }
}

module.exports = connectToDB;
