const User = require('../models/User');
const Booking = require('../models/Booking');
const Schedule = require('../models/Schedule');
const Bus = require('../models/Bus');

exports.getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalDrivers, totalBuses, totalBookings, totalRevenue] = await Promise.all([
      User.countDocuments({ role: 'traveller' }),
      User.countDocuments({ role: 'driver' }),
      Bus.countDocuments({ isActive: true }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.aggregate([
        { $match: { 'payment.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
    ]);

    const recentBookings = await Booking.find()
      .populate('traveller', 'name email')
      .populate({ path: 'schedule', populate: 'route' })
      .sort('-createdAt')
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalDrivers,
        totalBuses,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentBookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).sort('-createdAt');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAdminUser = async (req, res) => {
  try {
    const user = await User.create({ ...req.body, role: req.body.role || 'driver' });
    res.status(201).json({ success: true, user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
