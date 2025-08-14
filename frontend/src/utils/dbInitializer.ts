import dotenv from 'dotenv';
import { createDatabaseIfNotExists, initializeBountyTableFromEnv } from '@/models/Bounty';

// Load environment variables from .env file
dotenv.config();

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
    
    // Initialize bounty table
    console.log('Initializing bounty table...');
    const tableInitialized = await initializeBountyTableFromEnv();
    if (!tableInitialized) {
      console.error('Failed to initialize bounty table');
      return false;
    }
    
    console.log('Application initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing application:', error);
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
