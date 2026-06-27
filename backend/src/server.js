const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const vehicleRoutes = require('./routes/vehicles');
const odometerRoutes = require('./routes/odometer');
const serviceRoutes = require('./routes/services');

const { initDatabase, closeDatabase } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());

// ─── Rotas ────────────────────────────────────────────────
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/vehicles', odometerRoutes);
app.use('/api/vehicles', serviceRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'Assistente de Bordo API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      vehicles: '/api/vehicles',
      dashboard: '/api/vehicles/:id/dashboard',
      odometer: '/api/vehicles/:id/odometer',
      services: '/api/vehicles/:id/services',
      serviceTypes: '/api/vehicles/service-types',
    },
  });
});

// ─── Error handling global ────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

// ─── Inicializar banco e iniciar servidor ─────────────────
initDatabase()
  .then(() => {
    console.log('✅ Banco de dados SQLite inicializado');

    app.listen(PORT, () => {
      console.log(`🚗 Assistente de Bordo API rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Falha ao inicializar banco de dados:', err);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Encerrando servidor...');
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});
