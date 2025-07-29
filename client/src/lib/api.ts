import { apiRequest } from "./queryClient";
import type { InsertVault, InsertTrustedContact } from "@shared/schema";

export const api = {
  // Vault operations
  getVault: async () => {
    const response = await apiRequest("GET", "/api/vault");
    return response.json();
  },

  createOrUpdateVault: async (data: InsertVault) => {
    const response = await apiRequest("POST", "/api/vault", data);
    return response.json();
  },

  // Trusted contacts
  getTrustedContacts: async () => {
    const response = await apiRequest("GET", "/api/trusted-contacts");
    return response.json();
  },

  addTrustedContact: async (data: InsertTrustedContact) => {
    const response = await apiRequest("POST", "/api/trusted-contacts", data);
    return response.json();
  },

  // Admin operations
  getAdminStats: async () => {
    const response = await apiRequest("GET", "/api/admin/stats");
    return response.json();
  },

  getAdminUsers: async () => {
    const response = await apiRequest("GET", "/api/admin/users");
    return response.json();
  },

  getAdminVaults: async () => {
    const response = await apiRequest("GET", "/api/admin/vaults");
    return response.json();
  },

  getReleaseRequests: async () => {
    const response = await apiRequest("GET", "/api/admin/release-requests");
    return response.json();
  },

  updateReleaseRequest: async (id: string, status: string) => {
    const response = await apiRequest("PUT", `/api/admin/release-requests/${id}`, { status });
    return response.json();
  },
};
