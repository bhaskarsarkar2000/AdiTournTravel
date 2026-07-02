const Schedule = require('../models/Schedule');
const Bus = require('../models/Bus');
const Route = require('../models/Route');

exports.createSchedule = async (req, res) => {
  try {
    const bus = await Bus.findById(req.body.bus);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

    const schedule = await Schedule.create({
      ...req.body,
      availableSeats: bus.totalSeats,
    });
    await schedule.populate(['bus', 'route', 'driver']);
    res.status(201).json({ success: true, schedule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.searchSchedules = async (req, res) => {
  try {
    const { source, destination, date } = req.query;
    if (!source || !destination || !date) {
      return res.status(400).json({ success: false, message: 'Source, destination and date are required' });
    }

    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const routes = await Route.find({
      'source.name': { $regex: source, $options: 'i' },
      'destination.name': { $regex: destination, $options: 'i' },
      isActive: true,
    });

    const routeIds = routes.map((r) => r._id);

    const schedules = await Schedule.find({
      route: { $in: routeIds },
      journeyDate: { $gte: searchDate, $lt: nextDay },
      status: 'scheduled',
    }).populate('bus route driver');

    res.json({ success: true, count: schedules.length, schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find().populate('bus route driver').sort('-journeyDate');
    res.json({ success: true, count: schedules.length, schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id).populate('bus route driver');
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('bus route driver');
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateDriverLocation = async (req, res) => {
  try {
    const { lat, lng, locationName } = req.body;
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      { currentLocation: { lat, lng, locationName, updatedAt: new Date() } },
      { new: true }
    );
    if (!schedule) return res.status(404).json({ success: false, message: 'Schedule not found' });
    res.json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDriverSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ driver: req.user._id }).populate('bus route');
    res.json({ success: true, schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
