import Api from '../api';
import { User } from '@/contexts/AuthContext';

/**
 * Admin Service
 * Handles all admin-related API calls
 */
export class AdminService {
  private static readonly BASE_ENDPOINT = 'auth';
  
  /**
   * Get all users (admin only)
   */
  static async GetAllUsers(): Promise<{ success: boolean, users: any[] }> {
    return Api.get<{ success: boolean, users: any[] }>(`${this.BASE_ENDPOINT}/users`);
  }
  
  /**
   * Find a user by ID with flexible matching (case-insensitive)
   * @param users Array of user objects
   * @param userId User ID to find
   * @returns The matching user object or undefined if not found
   */
  static FindUserById(users: any[], userId: string): any {
    if (!users || !Array.isArray(users) || !userId) return undefined;
    
    // Try exact match first
    let user = users.find(u => u.Id === userId);
    
    // If not found, try case-insensitive match
    if (!user) {
      user = users.find(u => String(u.Id).toLowerCase() === String(userId).toLowerCase());
    }
    
    // If still not found, try trimming any whitespace
    if (!user) {
      const trimmedId = userId.trim();
      user = users.find(u => String(u.Id).trim() === trimmedId);
    }
    
    return user;
  }
  
  /**
   * Map backend user to frontend user format
   */
  static MapBackendUserToFrontend(backendUser: any): User {
    return {
      id: backendUser.Id,
      name: `${backendUser.FirstName || ''} ${backendUser.LastName || ''}`.trim(),
      email: backendUser.Email,
      firstName: backendUser.FirstName,
      lastName: backendUser.LastName,
      fullName: `${backendUser.FirstName || ''} ${backendUser.LastName || ''}`.trim(),
      plan: 'professional', // Default value since backend doesn't provide plan info directly
      subscriptionStatus: backendUser.Status || 'inactive',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      billingCycle: 'monthly',
      subscriptionStartDate: backendUser.CreatedAt,
      apiKey: 'sk_test_' + Math.random().toString(36).substring(2, 15),
      role: backendUser.Role || 'user',
      status: backendUser.Status || 'inactive'
    };
  }
}

export default AdminService; 