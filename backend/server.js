
require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database");

const PORT = Number(process.env.PORT) || 3000;

let server;
let isShuttingDown = false;

const startServer = async () => {
  try {
    await connectToDB();

    server = app.listen(PORT, () => {
      console.log(
        `AI Job Tracker backend listening on port ${PORT}`
      );
    });

    server.on("error", (error) => {
      console.error("HTTP server error:", error.message);
      process.exitCode = 1;
    });

    return server;
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exitCode = 1;
    throw error;
  }
};

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} received. Shutting down gracefully...`);

  try {
    if (server?.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }

    const mongoose = require("mongoose");

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    console.log("Server shutdown complete.");
  } catch (error) {
    console.error("Error during shutdown:", error.message);
    process.exitCode = 1;
  }
}

// Start automatically only when executed directly.
if (require.main === module) {
  startServer().catch(() => {
    process.exit(1);
  });

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

module.exports = {
  startServer,
};
