/**
 * User Model Interface
 * Represents a user in the system, typically authenticated via Twitter
 * 
 * Relationships:
 * - Created bounties (Bounty.createdBy references User.id)
 * - Creator of submissions (Submission.creator references User.username)
 */

import { PostgreSQLError } from '@/types/PostgresError';

export interface User {
  /** Unique identifier for the user (Twitter ID) */
  id: string;
  
  /** Twitter username/handle */
  username: string;
  
  /** URL to user's profile picture */
  userPfp: string;
  
  /** User's wallet address for payments */
  wallet_address?: string;
  
  /** User's display name */
  name?: string;
  
  /** User's email (if available) */
  email?: string;
  
  /** Twitter user's bio/description */
  bio?: string;
  
  /** Twitter user's follower count */
  followers_count?: number;
  
  /** Twitter user's following count */
  following_count?: number;
  
  /** Twitter user's tweet count */
  tweet_count?: number;
  
  /** User's role in the system */
  role: 'admin' | 'creator';
  
  /** Creation timestamp */
  createdAt: string; // ISO 8601 format
  
  /** Last update timestamp */
  updatedAt: string; // ISO 8601 format
}

// PostgreSQL Table Schema Definition
// This represents the DDL (Data Definition Language) for creating the users table
export const UserTableSchema = `
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,  -- Twitter ID
  username VARCHAR(100) NOT NULL UNIQUE,
  userPfp TEXT,
  wallet_address VARCHAR(100),
  name VARCHAR(100),
  email VARCHAR(255),
  bio TEXT,
  followers_count INTEGER,
  following_count INTEGER,
  tweet_count INTEGER,
  role VARCHAR(20) NOT NULL DEFAULT 'creator',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE
ON users FOR EACH ROW
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

export const initializeUserTable = async (dbClient: { query: (sql: string) => Promise<DatabaseQueryResult> }) => {
  try {
    // Execute the schema definition
    await dbClient.query(UserTableSchema);
    console.log('User table initialized successfully');
    
    // Check if table exists and has correct structure
    const result = await dbClient.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'users' 
       ORDER BY ordinal_position;`
    );
    
    console.log('User table columns:', result.rows);
    return true;
  } catch (error: unknown) {
    // Check if it's a duplicate trigger error (42710) which means the database is already initialized
    if (error instanceof Error && (error as PostgreSQLError).code === '42710') {
      console.log('User table already exists and is properly configured');
      return true;
    }
    console.error('Error initializing user table:', error instanceof Error ? error.message : String(error));
    return false;
  }
};

// Alternative initialization function that creates its own database client
// using environment variables
export const initializeUserTableFromEnv = async () => {
  // Dynamically import pg to avoid issues with server-side only code
  const { Client } = await import('pg');
  
  // Connect to the database
  const client = new Client({
    connectionString: getPostgresURI()
  });
  
  try {
    await client.connect();
    
    // Execute the schema definition
    await client.query(UserTableSchema);
    console.log('User table initialized successfully');
    
    // Check if table exists and has correct structure
    const result = await client.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'users' 
       ORDER BY ordinal_position;`
    );
    
    console.log('User table columns:', result.rows);
    await client.end();
    return true;
  } catch (error: unknown) {
    // Check if it's a duplicate trigger error (42710) which means the database is already initialized
    if (error instanceof Error && (error as PostgreSQLError).code === '42710') {
      console.log('User table already exists and is properly configured');
      await client.end();
      return true;
    }
    console.error('Error initializing user table:', error instanceof Error ? error.message : String(error));
    await client.end();
    return false;
  }
};

// Migration Function
// This represents a database migration that would be used to update
// the schema over time as requirements change
export const userMigrationV1 = `
-- Migration: Initial user table creation
-- Date: ${new Date().toISOString()}
-- Version: 1.0.0

${UserTableSchema}
`;

export default User; 