import { User } from '@/models/Users';
import { Client } from 'pg';
import { getPostgresURI } from '@/models/Users';

/**
 * Service to handle user authentication and database operations
 */

/**
 * Save or update user in the database
 * @param userData - User data from NextAuth
 * @returns The saved user object
 */
export const saveUserToDatabase = async (userData: User): Promise<User> => {
  const client = new Client({
    connectionString: getPostgresURI()
  });
  
  try {
    await client.connect();
    
    // Handle null email by converting to undefined
    const userDataForDb = {
      ...userData,

    };
    
    // Check if user already exists
    const existingUserResult = await client.query(
      'SELECT id FROM users WHERE id = $1',
      [userDataForDb.id]
    );
    
    let result;
    
    if (existingUserResult.rows.length > 0) {
      // Update existing user
      result = await client.query(
        `UPDATE users SET 
          username = $1, 
          userPfp = $2, 
          wallet_address = $3, 
          name = $4, 
          email = $5, 
          bio = $6, 
          followers_count = $7, 
          following_count = $8, 
          tweet_count = $9, 
          role = $10,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *`,
        [
          userDataForDb.username,
          userDataForDb.userPfp,
          userDataForDb.wallet_address,
          userDataForDb.name,
          userDataForDb.role,
          userDataForDb.id
        ]
      );
    } else {
      // Insert new user
      result = await client.query(
        `INSERT INTO users (
          id, username, userPfp, wallet_address, name, email, bio, 
          followers_count, following_count, tweet_count, role
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          userDataForDb.id,
          userDataForDb.username,
          userDataForDb.userPfp,
          userDataForDb.wallet_address,
          userDataForDb.name,
          userDataForDb.role
        ]
      );
    }
    
    await client.end();
    
    // Return the saved user with proper timestamps
    return {
      ...result.rows[0],
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  } catch (error) {
    console.error('Error saving user to database:', error);
    await client.end();
    throw error;
  }
};

/**
 * Get user by ID from the database
 * @param userId - Twitter ID of the user
 * @returns User object or null if not found
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  const client = new Client({
    connectionString: getPostgresURI()
  });
  
  try {
    await client.connect();
    
    const result = await client.query(
      'SELECT * FROM users WHERE id = $1',
      [userId]
    );
    
    await client.end();
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Return the user with proper timestamps
    return {
      ...result.rows[0],
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };
  } catch (error) {
    console.error('Error fetching user from database:', error);
    await client.end();
    throw error;
  }
};
