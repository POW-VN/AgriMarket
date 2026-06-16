// src/services/cartService.js

import apiClient from "./apiClient";

const getCart = async () => {
  const response = await apiClient.get("/api/cart");
  return response.data;
};

const addToCart = async (productId, quantity) => {
  const response = await apiClient.post("/api/cart/add", { productId, quantity });
  return response.data;
};

const updateCartItem = async (productId, quantity, checked) => {
  const response = await apiClient.put("/api/cart/update", { productId, quantity, checked });
  return response.data;
};

const removeFromCart = async (productId) => {
  const response = await apiClient.delete(`/api/cart/remove/${productId}`);
  return response.data;
};

const clearCart = async () => {
  const response = await apiClient.delete("/api/cart/clear");
  return response.data;
};

const syncCart = async (guestItems) => {
  // guestItems: array of { productId, quantity }
  const response = await apiClient.post("/api/cart/sync", guestItems);
  return response.data;
};

const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
};

export default cartService;
