const Building = require('../models/Building');
const axios = require('axios');

exports.getAllBuildings = async (req, res) => {
  try {
    const buildings = await Building.find({});
    res.json({ success: true, buildings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get buildings' });
  }
};

exports.getBuilding = async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) {
      return res.status(404).json({ success: false, message: 'Building not found' });
    }
    res.json({ success: true, building });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getRoute = async (req, res) => {
  try {
    const { start, end } = req.body; // { lng, lat }

    // Call Mapbox Directions API
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${start.lng},${start.lat};${end.lng},${end.lat}`;
    const response = await axios.get(url, {
      params: {
        geometries: 'geojson',
        steps: true,
        access_token: process.env.MAPBOX_ACCESS_TOKEN
      }
    });

    const route = response.data.routes[0];

    res.json({
      success: true,
      route: {
        geometry: route.geometry,
        distance: route.distance, // meters
        duration: route.duration, // seconds
        steps: route.legs[0].steps.map(step => ({
          instruction: step.maneuver.instruction,
          distance: step.distance
        }))
      }
    });
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ success: false, message: 'Failed to get route' });
  }
};