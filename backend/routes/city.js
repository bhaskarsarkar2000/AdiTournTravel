const express = require('express');
const { getCities, addCity, deleteCity, updateCity } = require('../controllers/cityController');

const router = express.Router();

router.get('/', getCities);
router.post('/', addCity);
router.delete('/:id', deleteCity);
router.put('/:id', updateCity);

module.exports = router;
