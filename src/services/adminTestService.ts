import type { MockTestMetadata } from "../domain/examTypes";
import { apiRequest, hasApiBaseUrl } from "./api/apiClient";

export interface AdminTestService {
  listAllTests(): Promise<MockTestMetadata[]>;
}

export class BackendAdminTestService implements AdminTestService {
  async listAllTests(): Promise<MockTestMetadata[]> {
    if (!hasApiBaseUrl()) {
      return [];
    }

    const adminToken = import.meta.env.VITE_ADMIN_TOKEN;

    return apiRequest<MockTestMetadata[]>("/api/admin/tests", {
      headers: adminToken ? { "X-Admin-Token": adminToken } : {},
    });
  }
}

export const adminTestService = new BackendAdminTestService();
