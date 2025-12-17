import React, { useState, useEffect } from "react";
import OrdersList from "./components/OrderList";
import CreateOrderForm from "./components/CreateOrderForm";

const API_URL = "http://127.0.0.1:8000/api";

function App() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchOrders = async () => {
		try {
			setLoading(true);
			const response = await fetch(`${API_URL}/orders`);
			const data = await response.json();
			setOrders(data);
		} catch (error) {
			console.error("Error fetching orders:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, []);

	const refreshOrders = () => fetchOrders();

	return (
		<div className="App">
			<h1>Order Management</h1>
			<CreateOrderForm refresh={refreshOrders} />
			{loading ? (
				<p>Loading orders...</p>
			) : (
				<OrdersList orders={orders} refresh={refreshOrders} />
			)}
		</div>
	);
}

export default App;
