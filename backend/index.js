import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import placeRoutes from "./src/routes/places.js";

dotenv.config();

const app = express();

// Middleware
// В backend/server.js замени app.use(cors()) с:
// Тестов маршрут директно в index.js (без външни файлове)
app.get("/api/test-live", (req, res) => {
  res.json({ message: "Бекендът на Попинци е напълно жив в Render!" });
});
app.use(
  cors({
    origin: ["https://map-popintsi.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
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
