const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  journeyDate: { type: Date, default: null }, // Optional - if null, it's a daily recurring schedule
  isDaily: { type: Boolean, default: false }, // True if schedule runs daily
  departureTime: { type: String, required: true },
  arrivalTime: { type: String, required: true },
  daysOfWeek: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }], // For daily schedules
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
