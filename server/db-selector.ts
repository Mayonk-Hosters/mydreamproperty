// This file selects the appropriate database connection
// based on the environment (PostgreSQL for production, MySQL for local, or TiDB Cloud)
import * as pgDb from './db';
import * as mysqlDb from './db-local';
import * as tidbDb from './tidb-cloud';

// Determine which database to use
const useMySQL = process.env.USE_MYSQL === 'true';
const useTiDB = process.env.USE_TIDB === 'true';

// Export the appropriate database interface
let selectedDb;
let selectedPool;

if (useTiDB) {
  selectedDb = tidbDb.db;
  selectedPool = tidbDb.pool;
} else if (useMySQL) {
  selectedDb = mysqlDb.db;
  selectedPool = mysqlDb.pool;
} else {
  selectedDb = pgDb.db;
  selectedPool = pgDb.pool;
}

export const db = selectedDb;
export const pool = selectedPool;