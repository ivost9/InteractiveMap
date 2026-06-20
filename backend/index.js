import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import placeRoutes from "./src/routes/places.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/places", placeRoutes);

// Database Connection
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Успешно свързване с MongoDB!");
    app.listen(PORT, () =>
      console.log(`Бекенд сървърът работи на порт ${PORT}`),
    );
  })
  .catch((err) => console.error("Грешка при връзка с MongoDB:", err));
