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

const stoppageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
  departureTime: { type: String },
  arrivalTime: { type: String },
});

const routeSchema = new mongoose.Schema({
  routeName: { type: String, required: true },
  // Source city reference
  source: {
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    name: { type: String, required: true },
    coordinates: { lat: { type: Number }, lng: { type: Number } },
  },
  // Destination city reference
  destination: {
    cityId: { type: mongoose.Schema.Types.ObjectId, ref: 'City' },
    name: { type: String, required: true },
    coordinates: { lat: { type: Number }, lng: { type: Number } },
  },
  // Multiple starting stoppages (initial boarding points)
  startingStoppages: [stoppageSchema],
  // Intermediate stops
  stops: [stopSchema],
  // Multiple ending stoppages (final drop-off points)
  endingStoppages: [stoppageSchema],
  distance: { type: Number },
  estimatedDuration: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Route', routeSchema);

