const Bus = require('../models/Bus');
const User = require('../models/User');

exports.createBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.status(201).json({ success: true, bus });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllBuses = async (req, res) => {
  try {
    const buses = await Bus.find({ isActive: true }).populate('driver', 'name phone');
    res.json({ success: true, count: buses.length, buses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBus = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate('driver', 'name phone');
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.json({ success: true, bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.json({ success: true, bus });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.json({ success: true, message: 'Bus deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSeatConfig = async (req, res) => {
  try {
    const { seats } = req.body;
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { seats },
      { new: true }
    );
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.json({ success: true, bus });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.assignDriver = async (req, res) => {
  try {
    const { driverId } = req.body;
    const driver = await User.findOne({ _id: driverId, role: 'driver' });
    if (!driver) return res.status(404).json({ success: false, message: 'Driver not found' });

    const bus = await Bus.findByIdAndUpdate(req.params.id, { driver: driverId }, { new: true })
      .populate('driver', 'name phone');
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

    await User.findByIdAndUpdate(driverId, { vehicleAssigned: bus._id });
    res.json({ success: true, bus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
