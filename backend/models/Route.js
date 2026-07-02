const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  arrivalTime: { type: String },
  departureTime: { type: String },
  distanceFromSource: { type: Number, default: 0 },
});

const routeSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  source: {
    name: { type: String, required: true },
    coordinates: { lat: { type: Number }, lng: { type: Number } },
  },
  destination: {
    name: { type: String, required: true },
    coordinates: { lat: { type: Number }, lng: { type: Number } },
  },
  stops: [stopSchema],
  distance: { type: Number },
  estimatedDuration: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);
