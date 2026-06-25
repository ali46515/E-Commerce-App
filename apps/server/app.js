// app.js or server.js (in your main application file)
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import AppError from "./utils/AppError.js";

const app = express();

// Built-in middlewares
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  
  if (process.env.NODE_ENV === "development") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {    
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    } else {      
      console.error("ERROR", err);
      res.status(500).json({
        success: false,
        message: "Something went wrong!",
      });
    }
  }
});

export default app;