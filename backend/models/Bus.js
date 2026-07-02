const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  seatNumber: { type: String, required: true },
  row: { type: Number, required: true },
  column: { type: Number, required: true },
  type: { type: String, enum: ['window', 'aisle', 'middle'], default: 'aisle' },
  isAvailable: { type: Boolean, default: true },
  price: { type: Number, required: true },
  deck: { type: String, enum: ['lower', 'upper'], default: 'lower' },
});

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  busName: { type: String, required: true },
  type: { type: String, enum: ['AC', 'Non-AC', 'Sleeper', 'Semi-Sleeper'], required: true },
  totalSeats: { type: Number, required: true },
  seatsPerRow: { type: Number, default: 4 },
  seats: [seatSchema],
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  amenities: [{ type: String }],
  isActive: { type: Boolean, default: true },
  registrationNumber: { type: String },
  manufacturer: { type: String },
  year: { type: Number },
}, { timestamps: true });

// Auto-generate seats when bus is created
busSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('totalSeats')) {
    const seats = [];
    const rows = Math.ceil(this.totalSeats / this.seatsPerRow);
    let seatCount = 1;
    for (let r = 1; r <= rows && seatCount <= this.totalSeats; r++) {
      for (let c = 1; c <= this.seatsPerRow && seatCount <= this.totalSeats; c++) {
        const types = ['window', 'aisle', 'aisle', 'window'];
        seats.push({
          seatNumber: `${r}${String.fromCharCode(64 + c)}`,
          row: r,
          column: c,
          type: types[c - 1] || 'aisle',
          isAvailable: true,
          price: this.type === 'AC' ? 600 : this.type === 'Sleeper' ? 800 : 300,
          deck: 'lower',
        });
        seatCount++;
      }
    }
    this.seats = seats;
  }
  next();
});

module.exports = mongoose.model('Bus', busSchema);
