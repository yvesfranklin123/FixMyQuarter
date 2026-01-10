import { api } from '@/lib/api';
import { AdminDashboardStats, NodeStats, User } from '@/types/api-responses';

export const adminService = {
  getStats: async () => {
    return api.get<AdminDashboardStats>('/admin/dashboard');
  },

  getUsers: async (page = 1, limit = 20) => {
    return api.get<{ items: User[], total: number }>(`/admin/users?page=${page}&limit=${limit}`);
  },

  getNodes: async () => {
    return api.get<NodeStats[]>('/admin/nodes');
  },
  
  // Fonction dangereuse : bannir un utilisateur
  banUser: async (userId: number) => {
    return api.post(`/admin/users/${userId}/ban`);
  }
};