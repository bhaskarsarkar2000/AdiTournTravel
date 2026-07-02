const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createBooking, verifyPayment, getMyBookings, cancelBooking, getAllBookings,
} = require('../controllers/bookingController');

router.use(protect);

router.post('/', authorize('traveller'), createBooking);
router.post('/verify-payment', authorize('traveller'), verifyPayment);
router.get('/my-bookings', authorize('traveller'), getMyBookings);
router.patch('/:id/cancel', authorize('traveller'), cancelBooking);
router.get('/', authorize('admin'), getAllBookings);

module.exports = router;
