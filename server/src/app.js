import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes.js";
import obligationRoutes from "./routes/obligationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import negotiationRoutes from "./routes/negotiationRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// IMPORTANT: must come before protected routes
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "DueAI API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/obligations", obligationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/negotiations", negotiationRoutes);
app.use("/api/webhooks", webhookRoutes);

export default app;
