const { queryAll, queryOne, execute } = require('../config/database');

/**
 * Atualizar hodômetro do veículo
 * PUT /api/vehicles/:id/odometer
 */
function updateOdometer(req, res) {
  try {
    const { odometer_value } = req.body;
    const vehicleId = req.params.id;

    if (odometer_value === undefined || odometer_value === null) {
      return res.status(400).json({ error: 'Valor do hodômetro é obrigatório.' });
    }

    if (typeof odometer_value !== 'number' || odometer_value < 0) {
      return res.status(400).json({ error: 'Valor do hodômetro deve ser um número positivo.' });
    }

    const vehicle = queryOne('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);

    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    if (odometer_value < vehicle.current_odometer) {
      return res.status(400).json({
        error: `Hodômetro não pode ser menor que o valor atual (${vehicle.current_odometer} km).`,
      });
    }

    // Atualizar hodômetro do veículo
    execute(
      `UPDATE vehicles SET current_odometer = ?, updated_at = datetime('now') WHERE id = ?`,
      [odometer_value, vehicleId]
    );

    // Registrar no histórico
    execute(
      `INSERT INTO odometer_history (vehicle_id, odometer_value) VALUES (?, ?)`,
      [vehicleId, odometer_value]
    );

    const updatedVehicle = queryOne('SELECT * FROM vehicles WHERE id = ?', [vehicleId]);

    res.json({
      message: 'Hodômetro atualizado com sucesso.',
      vehicle: updatedVehicle,
    });
  } catch (error) {
    console.error('Erro ao atualizar hodômetro:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

/**
 * Obter histórico do hodômetro
 * GET /api/vehicles/:id/odometer/history
 */
function getOdometerHistory(req, res) {
  try {
    const vehicle = queryOne('SELECT * FROM vehicles WHERE id = ?', [req.params.id]);

    if (!vehicle) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    const history = queryAll(
      `SELECT * FROM odometer_history WHERE vehicle_id = ? ORDER BY recorded_at DESC LIMIT 50`,
      [req.params.id]
    );

    res.json({ history });
  } catch (error) {
    console.error('Erro ao buscar histórico do hodômetro:', error);
    res.status(500).json({ error: 'Erro interno do servidor.' });
  }
}

module.exports = {
  updateOdometer,
  getOdometerHistory,
};
