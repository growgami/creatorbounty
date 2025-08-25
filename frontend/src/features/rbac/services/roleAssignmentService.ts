import { promises as fs } from 'fs';
import { join } from 'path';

export interface AdminConfig {
  admins: string[];
  version: string;
  lastUpdated: string;
}

/**
 * Determines user role based on database and admin config fallback
 * @param username Twitter username
 * @returns Promise resolving to user role
 */
export const determineUserRole = async (username: string): Promise<'admin' | 'creator'> => {
  try {
    // First check database for existing role
    const dbRole = await getUserRoleFromDatabase(username);
    if (dbRole) {
      return dbRole;
    }

    // Fall back to admin config file for bootstrap
    const isAdmin = await checkAdminConfig(username);
    if (isAdmin) {
      return 'admin';
    }

    // Default to creator
    return 'creator';
  } catch (error) {
    console.error('Error determining user role:', error);
    return 'creator';
  }
};

/**
 * Updates user role in database
 * @param userId User ID
 * @param role New role to assign
 */
export const updateUserRole = async (userId: string, role: 'admin' | 'creator'): Promise<void> => {
  try {
    const response = await fetch('/api/user/role', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, role }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user role: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Checks admin configuration file for username
 * @param username Twitter username to check
 * @returns Promise resolving to true if user is admin
 */
async function checkAdminConfig(username: string): Promise<boolean> {
  try {
    // Try to read admin config file
    const configPath = join(process.cwd(), 'config', 'admin-users.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    const config: AdminConfig = JSON.parse(configData);
    
    return config.admins.includes(username);
  } catch (error) {
    // Config file doesn't exist or is invalid, check environment variables
    const envAdmins = process.env.ADMIN_TWITTER_USERNAMES;
    if (envAdmins) {
      const adminList = envAdmins.split(',').map(u => u.trim());
      return adminList.includes(username);
    }
    
    return false;
  }
}

/**
 * Gets user role from database
 * @param username Twitter username
 * @returns Promise resolving to role or null if not found
 */
async function getUserRoleFromDatabase(username: string): Promise<'admin' | 'creator' | null> {
  try {
    const response = await fetch(`/api/user/role?username=${encodeURIComponent(username)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // User not found in database
      }
      throw new Error(`Failed to fetch user role: ${response.statusText}`);
    }

    const data = await response.json();
    return data.role;
  } catch (error) {
    console.error('Error fetching user role from database:', error);
    return null;
  }
}