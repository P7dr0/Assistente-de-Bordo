const express = require('express');
const router = express.Router();
const {
  updateOdometer,
  getOdometerHistory,
} = require('../controllers/odometerController');

// Atualizar hodômetro
router.put('/:id/odometer', updateOdometer);

// Histórico do hodômetro
router.get('/:id/odometer/history', getOdometerHistory);

module.exports = router;
