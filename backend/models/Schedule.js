const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  journeyDate: { type: Date, required: true },
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  availableSeats: { type: Number },
  bookedSeats: [{ type: String }],
  status: {
    type: String,
    enum: ['scheduled', 'departed', 'arrived', 'cancelled'],
    default: 'scheduled',
  },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date },
    locationName: { type: String },
  },
  fare: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
