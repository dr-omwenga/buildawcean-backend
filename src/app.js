import express from "express";
import cors from "cors";
import morgan from "morgan";
import errorHandler from "./middleware/errorHandler.js";

import routes from "./routes/index.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api", routes);

// Error handler
app.use(errorHandler);

// Health check
app.get("/", (req, res) => {
  res.send("Welcome, you've spinned it up successfully! Go to /api to see the API routes.");
});

export default app;