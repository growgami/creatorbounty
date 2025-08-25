import dotenv from 'dotenv';
import { initializeBountyTableFromEnv } from '@/models/Bounty';
import { initializeSubmissionTableFromEnv } from '@/models/Submissions';
import { initializeUserTableFromEnv } from '@/models/Users';

// Load environment variables from .env file
dotenv.config();

// PostgreSQL Error Interface
// This interface represents the structure of errors returned by the pg module
interface PostgreSQLError extends Error {
  code?: string;
  detail?: string;
  hint?: string;
  position?: string;
  internalPosition?: string;
  internalQuery?: string;
  where?: string;
  schema?: string;
  table?: string;
  column?: string;
  dataType?: string;
  constraint?: string;
  file?: string;
  line?: string;
  routine?: string;
}

// Function to check and add missing columns to existing tables
export const ensureTableColumns = async () => {
  // Dynamically import pg to avoid issues with server-side only code
  const { Client } = await import('pg');
  
  const client = new Client({
    connectionString: `postgresql://${process.env.PSQL_USERNAME}:${process.env.PSQL_PASSWORD}@${process.env.PSQL_HOST}:${process.env.PSQL_PORT || '5432'}/${process.env.PSQL_DATABASE}`
  });
  
  try {
    await client.connect();
    
    // Check if users table exists
    const tableExistsResult = await client.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );`
    );
    
    if (tableExistsResult.rows[0].exists) {
      console.log('Users table exists, checking columns...');
      
      // Check if role column exists
      const roleColumnExists = await client.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'role'
        );`
      );
      
      if (!roleColumnExists.rows[0].exists) {
        console.log('Adding missing role column to users table...');
        await client.query(`
          ALTER TABLE users 
          ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'creator';
        `);
        
        // Add index for role column
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
        `);
        
        console.log('Role column added successfully');
      } else {
        console.log('Role column already exists');
      }
    }
    
    await client.end();
    return true;
  } catch (error: unknown) {
    console.error('Error ensuring table columns:', error instanceof Error ? error.message : String(error));
    await client.end();
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
  } catch (error: unknown) {
    // Check if it's a duplicate database error (42P04) which means the database already exists
    if (error instanceof Error && (error as PostgreSQLError).code === '42P04') {
      console.log(`Database ${process.env.PSQL_DATABASE} already exists`);
      await defaultClient.end();
      return true;
    }
    console.error('Database initialization error:', error instanceof Error ? error.message : String(error));
    await defaultClient.end();
    return false;
  }
};

/**
 * Initialize the application
 * This function should be called once when the application starts
 */
export async function initializeApp() {
  console.log('Initializing application...');
  
  try {
    // Create database if it doesn't exist
    console.log('Checking database...');
    const dbCreated = await createDatabaseIfNotExists();
    if (!dbCreated) {
      console.error('Failed to create database');
      return false;
    }
    
    // Ensure all tables have required columns (for existing databases)
    console.log('Ensuring table columns...');
    const columnsEnsured = await ensureTableColumns();
    if (!columnsEnsured) {
      console.error('Failed to ensure table columns');
      return false;
    }
    
    // Initialize User table first (referenced by other tables)
    const userTableInitialized = await initializeUserTableFromEnv();
    if (!userTableInitialized) {
      console.error('Failed to initialize user table');
      return false;
    }

    // Initialize Bounty table (references User table)
    const bountyTableInitialized = await initializeBountyTableFromEnv();
    if (!bountyTableInitialized) {
      console.error('Failed to initialize bounty table');
      return false;
    }

    // Initialize Submission table (references Bounty table)
    const submissionTableInitialized = await initializeSubmissionTableFromEnv();
    if (!submissionTableInitialized) {
      console.error('Failed to initialize submission table');
      return false;
    }
    
    console.log('Application initialized successfully');
    return true;
  } catch (error: unknown) {
    console.error('Database initialization error:', error instanceof Error ? error.message : String(error));
    return false;
  }
}

// Export the initialization function as default
export default initializeApp;

// If this file is run directly, execute the initialization
if (require.main === module) {
  initializeApp().then((success) => {
    if (success) {
      console.log('Database initialization completed successfully!');
      process.exit(0);
    } else {
      console.error('Database initialization failed!');
      process.exit(1);
    }
  }).catch((error) => {
    console.error('Error during database initialization:', error);
    process.exit(1);
  });
}
