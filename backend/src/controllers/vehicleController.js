const { queryAll, queryOne, execute } = require('../config/database');
const {
  calculateMaintenanceStatus,
  calculateHealthScore,
  getAttentionItems,
} = require('../services/maintenanceCalculator');

/**
 * Criar um novo veículo
 * POST /api/vehicles
 */
function createVehicle(req, res) {
  try {
    const { name, brand, model, year, current_odometer } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome do veículo é obrigatório.' });
    }

    const { lastId } = execute(
      `INSERT INTO vehicles (name, brand, model, year, current_odometer) VALUES (?, ?, ?, ?, ?)`,
      [name, brand || '', model || '', year || 0, current_odometer || 0]
    );

    // Registrar hodômetro inicial
    if (current_odometer && current_odometer > 0) {
      execute(
        `INSERT INTO odometer_history (vehicle_id, odometer_value) VALUES (?, ?)`,
        [lastId, current_odometer]
      );
    }

    const vehicle = queryOne('SELECT * FROM vehicles WHERE id = ?', [lastId]);
    res.status(201).json({ vehicle });
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

/**
 * Listar todos os veículos
 * GET /api/vehicles
 */
function listVehicles(req, res) {
  try {
    const vehicles = queryAll('SELECT * FROM vehicles ORDER BY created_at DESC');
    res.json({ vehicles });
  } catch (error) {
    console.error('Erro ao listar veículos:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

/**
 * Obter detalhes de um veículo
 * GET /api/vehicles/:id
 */
function getVehicle(req, res) {
  try {
    const vehicle = queryOne('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);

    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    res.json({ vehicle });
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

/**
 * Obter dashboard completo do veículo (semáforos + health score)
 * GET /api/vehicles/:id/dashboard
 */
function getDashboard(req, res) {
  try {
    const vehicle = queryOne('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);

    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    const serviceRecords = queryAll(
      `SELECT * FROM service_records WHERE vehicle_id = ? ORDER BY odometer_at_service DESC`,
      [req.params.id]
    );

    const maintenanceStatuses = calculateMaintenanceStatus(
      vehicle.current_odometer,
      serviceRecords
    );

    const healthScore = calculateHealthScore(maintenanceStatuses);
    const attentionItems = getAttentionItems(maintenanceStatuses);

    res.json({
      vehicle,
      healthScore,
      maintenanceItems: maintenanceStatuses,
      attentionItems,
      totalItems: maintenanceStatuses.length,
      itemsNeedingAttention: attentionItems.length,
    });
  } catch (error) {
    console.error('Erro ao gerar dashboard:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

/**
 * Deletar um veículo
 * DELETE /api/vehicles/:id
 */
function deleteVehicle(req, res) {
  try {
    const vehicle = queryOne('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);

    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    execute('DELETE FROM vehicles WHERE id = ?', [req.params.id]);
    res.json({ message: 'Veículo removido com sucesso.' });
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

module.exports = {
  createVehicle,
  listVehicles,
  getVehicle,
  getDashboard,
  deleteVehicle,
};
