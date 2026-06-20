import express from "express";
import Place from "../models/place.js";

const router = express.Router();

// GET: Взимане на всички местности (форматирани като GeoJSON за фронтенда)
router.get("/", async (req, res) => {
  try {
    const places = await Place.find();

    // Трансформираме данните от базата в чист FeatureCollection стандарт за картата
    const geoJsonData = {
      type: "FeatureCollection",
      features: places.map((place) => ({
        type: "Feature",
        properties: {
          id: place._id,
          title: place.title,
          description: place.description,
          elevation: place.elevation,
          difficulty: place.difficulty,
          image: place.image,
        },
        geometry: place.location,
      })),
    };

    res.json(geoJsonData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Ендпоинт за добавяне на нова местност
router.post("/", async (req, res) => {
  const place = new Place({
    title: req.body.title,
    description: req.body.description,
    elevation: req.body.elevation,
    difficulty: req.body.difficulty,
    image: req.body.image,
    location: {
      type: "Point",
      coordinates: [req.body.longitude, req.body.latitude], // [Lng, Lat]
    },
  });

  try {
    const newPlace = await place.save();
    res.status(201).json(newPlace);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
