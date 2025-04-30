import Api from '../api';

// Types
export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserData {
  fullName?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * User Service
 * Handles all user-related API calls
 */
export class UserService {
  private static readonly BASE_ENDPOINT = 'users';
  
  /**
   * Get user profile by ID
   */
  static async GetUserById(userId: string): Promise<User> {
    return Api.get<User>(`${this.BASE_ENDPOINT}/${userId}`);
  }
  
  /**
   * Update user profile
   */
  static async UpdateUser(userId: string, data: UpdateUserData): Promise<User> {
    return Api.patch<User>(`${this.BASE_ENDPOINT}/${userId}`, data);
  }
  
  /**
   * Change user password
   */
  static async ChangePassword(data: ChangePasswordData): Promise<{ message: string }> {
    return Api.post<{ message: string }>(`${this.BASE_ENDPOINT}/change-password`, data);
  }
  
  /**
   * Delete user account
   */
  static async DeleteAccount(userId: string): Promise<void> {
    return Api.delete<void>(`${this.BASE_ENDPOINT}/${userId}`);
  }
  
  /**
   * Get all users (admin only)
   */
  static async GetAllUsers(page = 1, limit = 10): Promise<{ users: User[], total: number, page: number, limit: number }> {
    return Api.get<{ users: User[], total: number, page: number, limit: number }>(
      `${this.BASE_ENDPOINT}?page=${page}&limit=${limit}`
    );
  }
}

export default UserService; 