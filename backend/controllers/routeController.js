const Route = require('../models/Route');

exports.createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json({ success: true, route });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.getAllRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ isActive: true });
    res.json({ success: true, count: routes.length, routes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get popular routes (limit 6) from database
exports.getPopularRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ isActive: true })
      .limit(6)
      .sort({ createdAt: -1 });
    
    // If less than 6 routes, return what we have
    const popularRoutes = routes.map(route => ({
      _id: route._id,
      from: route.source.name,
      to: route.destination.name,
      distance: route.distance || 'N/A',
      duration: route.estimatedDuration || 'N/A',
      routeName: route.routeName
    }));
    
    res.json({ success: true, count: popularRoutes.length, routes: popularRoutes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, route });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, route });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, message: 'Route deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
