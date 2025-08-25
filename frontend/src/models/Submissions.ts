/**
 * Submission Model Interface
 * Represents a creator's submission for a bounty
 */

import { PostgreSQLError } from '@/types/PostgresError';

export type SubmissionStatus = 'pending' | 'claimed' | 'rejected';

export interface Submission {
  /** Unique identifier for the submission */
  id: string;
  
  /** Reference to the bounty this submission is for (references Bounty.id) */
  bountyId: string;
  
  /** Creator's handle/username */
  creator: string;
  
  /** URL to creator's avatar */
  creatorPfp: string;
  
  /** Submission URL */
  submitted_url: string;
  
  /** Current status of the submission */
  status: SubmissionStatus;
  
  /** Wallet address for claimed submissions */
  wallet_address?: string;
  
  /** Creation timestamp */
  createdAt: string; // ISO 8601 format
  
  /** Last update timestamp */
  updatedAt: string; // ISO 8601 format
}

// PostgreSQL Table Schema Definition
// This represents the DDL (Data Definition Language) for creating the submissions table
export const SubmissionTableSchema = `
CREATE TABLE IF NOT EXISTS submissions (
  id VARCHAR(36) PRIMARY KEY,  -- UUID
  bounty_id VARCHAR(36) NOT NULL REFERENCES bounties(id),
  creator VARCHAR(100) NOT NULL,
  creatorPfp TEXT NOT NULL,
  submitted_url TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,  -- pending, claimed, rejected
  wallet_address VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_submissions_bounty_id ON submissions(bounty_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_creator ON submissions(creator);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_bounty_status ON submissions(bounty_id, status);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE
ON submissions FOR EACH ROW
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

export const initializeSubmissionTable = async (dbClient: { query: (sql: string) => Promise<DatabaseQueryResult> }) => {
  try {
    // Execute the schema definition
    await dbClient.query(SubmissionTableSchema);
    console.log('Submission table initialized successfully');
    
    // Check if table exists and has correct structure
    const result = await dbClient.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'submissions' 
       ORDER BY ordinal_position;`
    );
    
    console.log('Submission table columns:', result.rows);
    return true;
  } catch (error: unknown) {
    // Check if it's a duplicate trigger error (42710) which means the database is already initialized
    if (error instanceof Error && (error as PostgreSQLError).code === '42710') {
      console.log('Submission table already exists and is properly configured');
      return true;
    }
    console.error('Error initializing submission table:', error instanceof Error ? error.message : String(error));
    return false;
  }
};

// Alternative initialization function that creates its own database client
// using environment variables
export const initializeSubmissionTableFromEnv = async () => {
  // Dynamically import pg to avoid issues with server-side only code
  const { Client } = await import('pg');
  
  // Connect to the database
  const client = new Client({
    connectionString: getPostgresURI()
  });
  
  try {
    await client.connect();
    
    // Execute the schema definition
    await client.query(SubmissionTableSchema);
    console.log('Submission table initialized successfully');
    
    // Check if table exists and has correct structure
    const result = await client.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'submissions' 
       ORDER BY ordinal_position;`
    );
    
    console.log('Submission table columns:', result.rows);
    await client.end();
    return true;
  } catch (error: unknown) {
    // Check if it's a duplicate trigger error (42710) which means the database is already initialized
    if (error instanceof Error && (error as PostgreSQLError).code === '42710') {
      console.log('Submission table already exists and is properly configured');
      await client.end();
      return true;
    }
    console.error('Error initializing submission table:', error instanceof Error ? error.message : String(error));
    await client.end();
    return false;
  }
};

// Migration Function
// This represents a database migration that would be used to update
// the schema over time as requirements change
export const submissionMigrationV1 = `
-- Migration: Initial submission table creation
-- Date: ${new Date().toISOString()}
-- Version: 1.0.0

${SubmissionTableSchema}
`;

export default Submission;