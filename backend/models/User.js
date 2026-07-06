const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  password: { type: String },
  role: { type: String, enum: ['admin', 'driver', 'traveller'], required: true },
  isActive: { type: Boolean, default: true },
  profileImage: { type: String, default: '' },
  // Driver-specific fields
  licenseNumber: { type: String },
  vehicleAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  // Traveller-specific fields
  address: { type: String },
  // OTP fields
  otp: { type: String, default: null },
  otpExpiry: { type: Date, default: null },
  isVerified: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
