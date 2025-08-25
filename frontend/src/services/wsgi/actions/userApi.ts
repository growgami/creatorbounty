import { apiRequest } from '../wsgiApiClient';
import { User } from '../wsgiApiClient';

// User API methods
export const userApi = {
  async getUsers(): Promise<User[]> {
    return apiRequest<User[]>('/api/users');
  },

  async createUser(userData: { username: string; email: string }): Promise<User> {
    return apiRequest<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async getUser(id: number): Promise<User> {
    return apiRequest<User>(`/api/users/${id}`);
  },

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    return apiRequest<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  async deleteUser(id: number): Promise<void> {
    return apiRequest<void>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },
};

export type { User };
