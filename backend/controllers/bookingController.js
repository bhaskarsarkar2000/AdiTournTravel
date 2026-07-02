const Razorpay = require('razorpay');
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createBooking = async (req, res) => {
  try {
    const { scheduleId, passengers, selectedSeats, boardingPoint, droppingPoint } = req.body;

    const schedule = await Schedule.findById(scheduleId).populate('bus');
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });

    const alreadyBooked = selectedSeats.filter((s) => schedule.bookedSeats.includes(s));
    if (alreadyBooked.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats ${alreadyBooked.join(', ')} are already booked`,
      });
    }

    const totalAmount = selectedSeats.length * schedule.fare;

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const booking = await Booking.create({
      traveller: req.user._id,
      schedule: scheduleId,
      passengers,
      selectedSeats,
      totalAmount,
      boardingPoint,
      droppingPoint,
      payment: { razorpayOrderId: razorpayOrder.id, status: 'pending' },
    });

    res.status(201).json({
      success: true,
      booking,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: 'confirmed',
        'payment.razorpayPaymentId': razorpayPaymentId,
        'payment.razorpaySignature': razorpaySignature,
        'payment.status': 'paid',
        'payment.paidAt': new Date(),
      },
      { new: true }
    ).populate('schedule');

    await Schedule.findByIdAndUpdate(booking.schedule._id, {
      $push: { bookedSeats: { $each: booking.selectedSeats } },
      $inc: { availableSeats: -booking.selectedSeats.length },
    });

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ traveller: req.user._id })
      .populate({ path: 'schedule', populate: ['bus', 'route'] })
      .sort('-createdAt');
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, traveller: req.user._id });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    await Schedule.findByIdAndUpdate(booking.schedule, {
      $pull: { bookedSeats: { $in: booking.selectedSeats } },
      $inc: { availableSeats: booking.selectedSeats.length },
    });

    res.json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('traveller', 'name email phone')
      .populate({ path: 'schedule', populate: ['bus', 'route'] })
      .sort('-createdAt');
    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
