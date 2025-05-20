// This file selects the appropriate database connection
// based on the environment (PostgreSQL for production, MySQL for local)
import * as pgDb from './db';
import * as mysqlDb from './db-local';

// Determine which database to use
const useMySQL = process.env.USE_MYSQL === 'true';

// Export the appropriate database interface
export const db = useMySQL ? mysqlDb.db : pgDb.db;
export const pool = useMySQL ? mysqlDb.pool : pgDb.pool;