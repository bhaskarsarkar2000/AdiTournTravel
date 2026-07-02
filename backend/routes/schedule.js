const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createSchedule, searchSchedules, getAllSchedules, getSchedule,
  updateSchedule, updateDriverLocation, getDriverSchedules,
} = require('../controllers/scheduleController');

router.get('/search', searchSchedules);
router.get('/', getAllSchedules);
router.get('/:id', getSchedule);

router.put('/:id/location', protect, authorize('driver'), updateDriverLocation);
router.get('/driver/my-schedules', protect, authorize('driver'), getDriverSchedules);

router.post('/', protect, authorize('admin'), createSchedule);
router.put('/:id', protect, authorize('admin'), updateSchedule);

module.exports = router;
