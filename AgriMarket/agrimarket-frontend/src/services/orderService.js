// src/services/orderService.js

import apiClient from "./apiClient";

const createOrder = async (orderData) => {
  const response = await apiClient.post("/api/orders", orderData);
  return response.data;
};

const getCustomerOrders = async () => {
  const response = await apiClient.get("/api/orders");
  return response.data;
};

const getOrderById = async (orderCode) => {
  const response = await apiClient.get(`/api/orders/${orderCode}`);
  return response.data;
};

const cancelOrder = async (orderCode, reason) => {
  const response = await apiClient.post(`/api/orders/${orderCode}/cancel`, { reason });
  return response.data;
};

const confirmPayment = async (orderCode, paymentMethod) => {
  const response = await apiClient.post(`/api/orders/${orderCode}/confirm-payment`, { paymentMethod });
  return response.data;
};

const getFarmerOrders = async () => {
  const response = await apiClient.get("/api/orders/farmer");
  return response.data;
};

const updateFarmerOrderStatus = async (orderCode, status, reason = "") => {
  const response = await apiClient.post(`/api/orders/farmer/${orderCode}/status`, { status, reason });
  return response.data;
};

const createVNPayPaymentUrl = async (orderCode) => {
  const response = await apiClient.get(`/api/payment/create-vnpay-payment?orderCode=${orderCode}`);
  return response.data;
};

const verifyVNPayCallback = async (queryParamsString) => {
  const response = await apiClient.get(`/api/payment/vnpay-callback?${queryParamsString}`);
  return response.data;
};

const orderService = {
  createOrder,
  getCustomerOrders,
  getOrderById,
  cancelOrder,
  confirmPayment,
  getFarmerOrders,
  updateFarmerOrderStatus,
  createVNPayPaymentUrl,
  verifyVNPayCallback,
};

export default orderService;
