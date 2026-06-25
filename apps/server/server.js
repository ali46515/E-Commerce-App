import app from "./app.js";
import mongoose from "mongoose";
import { config } from "dotenv";
import { connectDB } from "./config/dbConfig.js";

config();

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();

    const port = process.env.PORT || 3000;

    const server = app.listen(port, () => {
      console.log(`
      Server is running!
      Environment: ${process.env.NODE_ENV || "development"}
      Port: ${port}
      API URL: http://localhost:${port}/api
      Started at: ${new Date().toISOString()}
      `);
    });

    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! Shutting down...");
      console.error(err.name, err.message);

      server.close(() => {
        process.exit(1);
      });
    });

    process.on("SIGTERM", () => {
      console.log("SIGTERM RECEIVED. Shutting down gracefully...");
      server.close(() => {
        console.log("Process terminated!");
        mongoose.connection.close(false).then(() => {
          process.exit(0);
        });
      });
    });

    process.on("SIGINT", () => {
      console.log("\nSIGINT RECEIVED. Shutting down gracefully...");
      server.close(() => {
        console.log("Process terminated!");
        mongoose.connection.close(false).then(() => {
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
