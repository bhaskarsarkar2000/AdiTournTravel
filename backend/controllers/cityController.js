const City = require('../models/City');

exports.getCities = async (req, res) => {
  try {
    const cities = await City.find({ isActive: true }).sort({ name: 1 });
    res.json({ cities });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching cities' });
  }
};

exports.addCity = async (req, res) => {
  try {
    const { name, coordinates, description } = req.body;
    
    if (!name || !coordinates?.lat || !coordinates?.lng) {
      return res.status(400).json({ message: 'Name and coordinates are required' });
    }

    const existingCity = await City.findOne({ name });
    if (existingCity) {
      return res.status(400).json({ message: 'City already exists' });
    }

    const city = new City({ name, coordinates, description });
    await city.save();
    res.status(201).json({ city, message: 'City added successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error adding city' });
  }
};

exports.deleteCity = async (req, res) => {
  try {
    const { id } = req.params;
    await City.findByIdAndUpdate(id, { isActive: false });
    res.json({ message: 'City deactivated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deactivating city' });
  }
};

exports.updateCity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, coordinates, description } = req.body;

    const city = await City.findByIdAndUpdate(
      id,
      { name, coordinates, description },
      { new: true }
    );

    res.json({ city, message: 'City updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating city' });
  }
};
