const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createRoute, getAllRoutes, getRoute, updateRoute, deleteRoute,
} = require('../controllers/routeController');

router.get('/', getAllRoutes);
router.get('/:id', getRoute);

router.use(protect, authorize('admin'));
router.post('/', createRoute);
router.put('/:id', updateRoute);
router.delete('/:id', deleteRoute);

module.exports = router;
