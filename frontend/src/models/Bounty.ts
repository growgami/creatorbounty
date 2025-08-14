/**
 * Bounty Model Interface
 * Represents a bounty campaign created by admins
 */

// Database Schema Terms Explanation:
// - Schema: The structure that defines how data is organized and stored in a database
// - Table: A collection of related data organized in rows and columns
// - Migration: The process of changing/updating database schema over time
// - DDL (Data Definition Language): SQL commands used to define database structure
// - Primary Key: A unique identifier for each row in a table
// - Column: A field in a table that holds specific information
// - Data Type: The type of value that can be stored in a column (e.g., VARCHAR, INTEGER, TIMESTAMP)
// - Constraint: Rules applied to columns to enforce data integrity (e.g., NOT NULL, UNIQUE)
// - Index: A database structure that improves query performance

export type BountyStatus = 'draft' | 'active' | 'paused' | 'completed' | 'ended';

export interface Bounty {
  /** Unique identifier for the bounty */
  id: string;
  
  /** Title of the bounty campaign */
  title: string;
  
  /** Description of the bounty requirements */
  description: string;
  
  /** Total reward pool for the bounty */
  bountyPool: number;
  
  /** Token symbol for rewards */
  tokenSymbol: string;
  
  /** Current status of the bounty */
  status?: BountyStatus;
  
  /** Creation timestamp */
  createdAt: string; // ISO 8601 format
  
  /** Last update timestamp */
  updatedAt: string; // ISO 8601 format
  
  /** Bounty deadline */
  endDate?: string; // ISO 8601 format
  
  /** Admin user ID who created this bounty */
  createdBy: string;
  
  /** Requirements for the bounty */
  requirements?: string[];
  
  /** Submission count */
  submissionsCount: number;
  
  /** Total possible submissions */
  totalSubmissions: number;
  
  /** Completion percentage */
  completionPercentage: number;
}

export interface BountyCreationRequest {
  title: string;
  description: string;
  bountyPool: number;
  tokenSymbol: string;
  status?: BountyStatus;
  endDate?: string;
  requirements?: string[];
}

export interface BountyUpdateRequest {
  title?: string;
  description?: string;
  bountyPool?: number;
  tokenSymbol?: string;
  status?: BountyStatus;
  endDate?: string;
  requirements?: string[];
}

// PostgreSQL Table Schema Definition
// This represents the DDL (Data Definition Language) for creating the bounties table
export const BountyTableSchema = `
CREATE TABLE IF NOT EXISTS bounties (
  id VARCHAR(36) PRIMARY KEY,  -- UUID
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  bounty_pool FLOAT NOT NULL,
  token_symbol VARCHAR(10) NOT NULL,
  status VARCHAR(20) NOT NULL,  -- draft, active, paused, completed, ended
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  created_by VARCHAR(36) NOT NULL,  -- Admin user ID
  requirements TEXT,  -- JSON stringified array
  submissions_count INTEGER NOT NULL DEFAULT 0,
  total_submissions INTEGER NOT NULL,
  completion_percentage FLOAT NOT NULL DEFAULT 0.0
);

-- Create an index on frequently queried columns
CREATE INDEX IF NOT EXISTS idx_bounties_status ON bounties(status);
CREATE INDEX IF NOT EXISTS idx_bounties_created_by ON bounties(created_by);
CREATE INDEX IF NOT EXISTS idx_bounties_created_at ON bounties(created_at);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_bounties_updated_at BEFORE UPDATE
ON bounties FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
`;

// Function to construct PostgreSQL URI from environment variables
export function getPostgresURI(): string {
  const host = process.env.PSQL_HOST;
  const port = process.env.PSQL_PORT;
  const username = process.env.PSQL_USERNAME;
  const password = process.env.PSQL_PASSWORD;
  const database = process.env.PSQL_DATABASE;
  
  return `postgresql://${username}:${password}@${host}:${port}/${database}`;
}

// Database Initialization Function
// This function would typically be called during application startup
// or as part of a migration process

// Define interface for database query result
interface DatabaseQueryResult {
  rows: Array<{
    column_name: string;
    data_type: string;
  }>;
}

export const initializeBountyTable = async (dbClient: { query: (sql: string) => Promise<DatabaseQueryResult> }) => {
  try {
    // Execute the schema definition
    await dbClient.query(BountyTableSchema);
    console.log('Bounty table initialized successfully');
    
    // Check if table exists and has correct structure
    const result = await dbClient.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'bounties' 
       ORDER BY ordinal_position;`
    );
    
    console.log('Bounty table columns:', result.rows);
    return true;
  } catch (error) {
    console.error('Error initializing bounty table:', error);
    return false;
  }
};

// Function to create database if it doesn't exist
export const createDatabaseIfNotExists = async () => {
  // Dynamically import pg to avoid issues with server-side only code
  const { Client } = await import('pg');
  
  // Connect to default postgres database using connection string
  const defaultClient = new Client({
    connectionString: `postgresql://${process.env.PSQL_USERNAME}:${process.env.PSQL_PASSWORD}@${process.env.PSQL_HOST}:${process.env.PSQL_PORT || '5432'}/postgres`
  });
  
  try {
    await defaultClient.connect();
    
    // Check if database exists
    const dbCheckResult = await defaultClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`, 
      [process.env.PSQL_DATABASE]
    );
    
    if (dbCheckResult.rowCount === 0) {
      // Database doesn't exist, create it
      await defaultClient.query(`CREATE DATABASE "${process.env.PSQL_DATABASE}"`);
      console.log(`Database ${process.env.PSQL_DATABASE} created successfully`);
    } else {
      console.log(`Database ${process.env.PSQL_DATABASE} already exists`);
    }
    
    await defaultClient.end();
    return true;
  } catch (error) {
    console.error('Error creating database:', error);
    await defaultClient.end();
    return false;
  }
};

// Alternative initialization function that creates its own database client
// using environment variables
export const initializeBountyTableFromEnv = async () => {
  // Dynamically import pg to avoid issues with server-side only code
  const { Client } = await import('pg');
  
  // First, ensure database exists
  const dbCreated = await createDatabaseIfNotExists();
  if (!dbCreated) {
    console.error('Failed to create database');
    return false;
  }
  
  // Now connect to the actual database
  const client = new Client({
    connectionString: getPostgresURI()
  });
  
  try {
    await client.connect();
    
    // Execute the schema definition
    await client.query(BountyTableSchema);
    console.log('Bounty table initialized successfully');
    
    // Check if table exists and has correct structure
    const result = await client.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'bounties' 
       ORDER BY ordinal_position;`
    );
    
    console.log('Bounty table columns:', result.rows);
    await client.end();
    return true;
  } catch (error) {
    console.error('Error initializing bounty table:', error);
    await client.end();
    return false;
  }
};

// Migration Function
// This represents a database migration that would be used to update
// the schema over time as requirements change
export const bountyMigrationV1 = `
-- Migration: Initial bounty table creation
-- Date: ${new Date().toISOString()}
-- Version: 1.0.0

${BountyTableSchema}
`;

export default Bounty;