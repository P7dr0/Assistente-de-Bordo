const express = require('express');
const router = express.Router();
const {
  createVehicle,
  listVehicles,
  getVehicle,
  getDashboard,
  deleteVehicle,
} = require('../controllers/vehicleController');

// CRUD de veículos
router.post('/', createVehicle);
router.get('/', listVehicles);
router.get('/:id', getVehicle);
router.delete('/:id', deleteVehicle);

// Dashboard com semáforo
router.get('/:id/dashboard', getDashboard);

module.exports = router;
