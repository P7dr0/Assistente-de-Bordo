const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', 'database.sqlite');

let db = null;
let dbReady = null;

/**
 * Inicializa o banco de dados SQL.js (SQLite puro em JavaScript).
 * Retorna uma Promise que resolve com a instância do banco.
 */
function initDatabase() {
  if (dbReady) return dbReady;

  dbReady = initSqlJs().then((SQL) => {
    // Carregar banco existente ou criar novo
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }

    // Ativar foreign keys
    db.run('PRAGMA foreign_keys = ON');

    runMigrations();
    saveDatabase();

    return db;
  });

  return dbReady;
}

function runMigrations() {
  const versionResult = db.exec('PRAGMA user_version');
  const currentVersion =
    versionResult.length > 0 ? versionResult[0].values[0][0] : 0;

  if (currentVersion < 1) {
    db.run(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        brand TEXT DEFAULT '',
        model TEXT DEFAULT '',
        year INTEGER DEFAULT 0,
        current_odometer REAL NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS service_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        service_type TEXT NOT NULL,
        odometer_at_service REAL NOT NULL,
        notes TEXT DEFAULT '',
        performed_at TEXT NOT NULL DEFAULT (datetime('now')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS odometer_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER NOT NULL,
        odometer_value REAL NOT NULL,
        recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
      )
    `);

    db.run(
      'CREATE INDEX IF NOT EXISTS idx_service_records_vehicle ON service_records(vehicle_id, service_type)'
    );
    db.run(
      'CREATE INDEX IF NOT EXISTS idx_odometer_history_vehicle ON odometer_history(vehicle_id)'
    );

    db.run('PRAGMA user_version = 1');
  }
}

/**
 * Salva o banco de dados em disco.
 */
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }
}

/**
 * Retorna a instância do banco de dados (síncrono, após init).
 */
function getDb() {
  if (!db) {
    throw new Error('Banco de dados não inicializado. Chame initDatabase() primeiro.');
  }
  return db;
}

/**
 * Executa uma query SELECT e retorna os resultados como array de objetos.
 */
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

/**
 * Executa uma query SELECT e retorna o primeiro resultado como objeto.
 */
function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Executa uma query INSERT/UPDATE/DELETE.
 * Retorna { changes, lastId }.
 */
function execute(sql, params = []) {
  db.run(sql, params);
  const changes = db.getRowsModified();
  const lastIdResult = db.exec('SELECT last_insert_rowid() as id');
  const lastId =
    lastIdResult.length > 0 ? lastIdResult[0].values[0][0] : null;

  // Auto-save após modificações
  saveDatabase();

  return { changes, lastId };
}

function closeDatabase() {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
    dbReady = null;
  }
}

module.exports = {
  initDatabase,
  getDb,
  queryAll,
  queryOne,
  execute,
  saveDatabase,
  closeDatabase,
};
