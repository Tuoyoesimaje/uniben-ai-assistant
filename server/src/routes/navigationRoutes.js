const express = require('express');
const router = express.Router();
const navigationController = require('../controllers/navigationController');
const { authMiddleware } = require('../middleware/auth');

router.get('/buildings', navigationController.getAllBuildings);
router.get('/buildings/:id', navigationController.getBuilding);
router.post('/route', authMiddleware, navigationController.getRoute);

module.exports = router;