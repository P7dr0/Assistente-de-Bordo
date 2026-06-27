const express = require('express');
const router = express.Router();
const {
  createServiceRecord,
  listServiceRecords,
  deleteServiceRecord,
  listServiceTypes,
} = require('../controllers/serviceController');

// Tipos de serviço disponíveis
router.get('/service-types', listServiceTypes);

// CRUD de registros de serviço (prefixados com vehicle id)
router.post('/:id/services', createServiceRecord);
router.get('/:id/services', listServiceRecords);
router.delete('/:id/services/:serviceId', deleteServiceRecord);

module.exports = router;
