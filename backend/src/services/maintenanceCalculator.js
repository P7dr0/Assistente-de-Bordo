const { MAINTENANCE_INTERVALS } = require('../data/maintenanceIntervals');

/**
 * Calcula o status de manutenção para cada item.
 * 
 * @param {number} currentOdometer - Quilometragem atual do veículo
 * @param {Array} serviceRecords - Histórico de serviços realizados
 * @returns {Array} Lista de itens com status (green/yellow/red)
 */
function calculateMaintenanceStatus(currentOdometer, serviceRecords) {
  return MAINTENANCE_INTERVALS.map((item) => {
    // Encontrar o último serviço deste tipo
    const lastService = serviceRecords
      .filter((record) => record.service_type === item.id)
      .sort((a, b) => b.odometer_at_service - a.odometer_at_service)[0];

    const lastServiceOdometer = lastService ? lastService.odometer_at_service : 0;
    const lastServiceDate = lastService ? lastService.performed_at : null;

    // Km percorridos desde o último serviço
    const kmSinceService = currentOdometer - lastServiceOdometer;

    // Porcentagem do intervalo consumida
    const percentage = Math.max(0, kmSinceService / item.intervalKm);

    // Km restantes até o próximo serviço
    const kmRemaining = Math.max(0, item.intervalKm - kmSinceService);

    // Km onde foi excedido (se vermelho)
    const kmOverdue = Math.max(0, kmSinceService - item.intervalKm);

    // Determinar status do semáforo
    let status;
    if (percentage >= item.dangerThreshold) {
      status = 'red';
    } else if (percentage >= item.warningThreshold) {
      status = 'yellow';
    } else {
      status = 'green';
    }

    return {
      id: item.id,
      name: item.name,
      icon: item.icon,
      category: item.category,
      description: item.description,
      intervalKm: item.intervalKm,
      status,
      percentage: Math.round(percentage * 100),
      kmSinceService: Math.round(kmSinceService),
      kmRemaining: Math.round(kmRemaining),
      kmOverdue: Math.round(kmOverdue),
      lastServiceOdometer: Math.round(lastServiceOdometer),
      lastServiceDate,
      needsAttention: status !== 'green',
    };
  });
}

/**
 * Calcula o score geral de saúde do veículo (0 a 100).
 * 
 * @param {Array} maintenanceStatuses - Array retornado por calculateMaintenanceStatus
 * @returns {number} Score de saúde (100 = perfeito, 0 = todos vencidos)
 */
function calculateHealthScore(maintenanceStatuses) {
  if (maintenanceStatuses.length === 0) return 100;

  const totalScore = maintenanceStatuses.reduce((sum, item) => {
    // Cada item contribui com um score de 0 a 100
    // 0% do intervalo = 100 pontos, 100%+ = 0 pontos
    const itemScore = Math.max(0, Math.min(100, 100 - item.percentage));
    return sum + itemScore;
  }, 0);

  return Math.round(totalScore / maintenanceStatuses.length);
}

/**
 * Retorna itens que precisam de atenção (amarelo ou vermelho),
 * ordenados por prioridade (vermelho primeiro, depois amarelo).
 */
function getAttentionItems(maintenanceStatuses) {
  return maintenanceStatuses
    .filter((item) => item.needsAttention)
    .sort((a, b) => {
      // Vermelho antes de amarelo
      if (a.status === 'red' && b.status !== 'red') return -1;
      if (a.status !== 'red' && b.status === 'red') return 1;
      // Dentro do mesmo status, maior porcentagem primeiro
      return b.percentage - a.percentage;
    });
}

module.exports = {
  calculateMaintenanceStatus,
  calculateHealthScore,
  getAttentionItems,
};
