// src/services/supportRequestService.js

import apiClient from "./apiClient";

const supportRequestService = {
  createRequest: async (data) => {
    const response = await apiClient.post("/api/support-requests", data);
    return response.data;
  },

  getMyRequests: async (status) => {
    const response = await apiClient.get("/api/support-requests", {
      params: { status }
    });
    return response.data;
  },

  getRequestDetails: async (id) => {
    const response = await apiClient.get(`/api/support-requests/${id}`);
    return response.data;
  },

  // Admin methods
  getAdminRequests: async (status) => {
    const response = await apiClient.get("/api/support-requests/admin", {
      params: { status }
    });
    return response.data;
  },

  updateRequestStatus: async (id, status, adminNotes) => {
    const response = await apiClient.put(`/api/support-requests/admin/${id}/status`, {
      status,
      adminNotes
    });
    return response.data;
  }
};

export default supportRequestService;
