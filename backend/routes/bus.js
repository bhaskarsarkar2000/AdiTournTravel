const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createBus, getAllBuses, getBus, updateBus, deleteBus, updateSeatConfig, assignDriver,
} = require('../controllers/busController');

router.get('/', getAllBuses);
router.get('/:id', getBus);

router.use(protect, authorize('admin'));
router.post('/', createBus);
router.put('/:id', updateBus);
router.delete('/:id', deleteBus);
router.put('/:id/seats', updateSeatConfig);
router.put('/:id/assign-driver', assignDriver);

module.exports = router;
