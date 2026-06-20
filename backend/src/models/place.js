import mongoose from "mongoose";

const PlaceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    elevation: { type: String },
    difficulty: { type: String },
    image: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
  },
  { timestamps: true },
);

PlaceSchema.index({ location: "2dsphere" });

export default mongoose.model("Place", PlaceSchema);
