import axios from "axios";

const api = axios.create({
	baseURL: "http://127.0.0.1:8000/api",
	headers: { "Content-Type": "application/json" },
});

export const getOrders = () => api.get("/orders");
export const getOrder = (id) => api.get(`/orders/${id}`);
export const createOrder = (orderData) => api.post("/orders", orderData);
export const updateOrder = (id, orderData) => api.put(`/orders/${id}`, orderData);

/**
 * Update order status, optionally including a message for CANCELLED or RETURNED
 */
export const updateOrderStatus = (id, status, message = null) =>
	api.patch(`/orders/${id}/status`, { status, message });
