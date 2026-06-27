const { queryAll, queryOne, execute } = require('../config/database');
const { MAINTENANCE_INTERVALS } = require('../data/maintenanceIntervals');

/**
 * Registrar um serviço realizado
 * POST /api/vehicles/:id/services
 */
function createServiceRecord(req, res) {
  try {
    const { service_type, odometer_at_service, notes, performed_at } = req.body;
    const vehicleId = req.params.id;

    if (!service_type) {
      return res.status(400).json({ error: 'Tipo de serviço é obrigatório.' });
    }

    // Validar tipo de serviço
    const validServiceTypes = MAINTENANCE_INTERVALS.map((item) => item.id);
    if (!validServiceTypes.includes(service_type)) {
      return res.status(400).json({
        error: `Tipo de serviço inválido. Tipos válidos: ${validServiceTypes.join(', ')}`,
      });
    }

    const vehicle = queryOne('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);

    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    const odometerValue = odometer_at_service || vehicle.current_odometer;

    const { lastId } = execute(
      `INSERT INTO service_records (vehicle_id, service_type, odometer_at_service, notes, performed_at) VALUES (?, ?, ?, ?, ?)`,
      [
        vehicleId,
        service_type,
        odometerValue,
        notes || '',
        performed_at || new Date().toISOString(),
      ]
    );

    // Se o hodômetro do serviço for maior que o atual, atualizar
    if (odometerValue > vehicle.current_odometer) {
      execute(
        `UPDATE vehicles SET current_odometer = ?, updated_at = datetime('now') WHERE id = ?`,
        [odometerValue, vehicleId]
      );
    }

    const record = queryOne('SELECT * FROM service_records WHERE id = ?', [lastId]);

    // Enriquecer com o nome do serviço
    const serviceInfo = MAINTENANCE_INTERVALS.find((item) => item.id === record.service_type);
    record.service_name = serviceInfo ? serviceInfo.name : record.service_type;
    record.service_icon = serviceInfo ? serviceInfo.icon : '🔧';

    res.status(201).json({
      message: 'Serviço registrado com sucesso.',
      record,
    });
  } catch (error) {
    console.error('Erro ao registrar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

/**
 * Listar serviços do veículo
 * GET /api/vehicles/:id/services
 */
function listServiceRecords(req, res) {
  try {
    const vehicle = queryOne('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);

    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    const { service_type, limit } = req.query;
    let query = 'SELECT * FROM service_records WHERE vehicle_id = ?';
    const params = [req.params.id];

    if (service_type) {
      query += ' AND service_type = ?';
      params.push(service_type);
    }

    query += ' ORDER BY performed_at DESC';

    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit, 10));
    }

    const records = queryAll(query, params);

    // Enriquecer cada registro com nome e ícone
    const enrichedRecords = records.map((record) => {
      const serviceInfo = MAINTENANCE_INTERVALS.find((item) => item.id === record.service_type);
      return {
        ...record,
        service_name: serviceInfo ? serviceInfo.name : record.service_type,
        service_icon: serviceInfo ? serviceInfo.icon : '🔧',
      };
    });

    res.json({ records: enrichedRecords });
  } catch (error) {
    console.error('Erro ao listar serviços:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

/**
 * Deletar um registro de serviço
 * DELETE /api/vehicles/:id/services/:serviceId
 */
function deleteServiceRecord(req, res) {
  try {
    const record = queryOne(
      'SELECT * FROM service_records WHERE id = ? AND vehicle_id = ?',
      [req.params.serviceId, req.params.id]
    );

    if (!record) {
      return res.status(404).json({ error: 'Registro de serviço não encontrado.' });
    }

    execute('DELETE FROM service_records WHERE id = ?', [req.params.serviceId]);
    res.json({ message: 'Registro removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

/**
 * Listar tipos de serviço disponíveis
 * GET /api/service-types
 */
function listServiceTypes(req, res) {
  res.json({ serviceTypes: MAINTENANCE_INTERVALS });
}

module.exports = {
  createServiceRecord,
  listServiceRecords,
  deleteServiceRecord,
  listServiceTypes,
};
