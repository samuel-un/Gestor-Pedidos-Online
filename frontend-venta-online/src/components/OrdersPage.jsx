import { useEffect, useState } from "react";
import { getOrders } from "../services/orderService";
import OrderList from "./OrderList";
import OrderForm from "../components/OrderForm";

export default function OrdersPage() {
	const [orders, setOrders] = useState([]);

	const fetchOrders = async () => {
		try {
			const { data } = await getOrders();
			const ordersWithTransitions = data.map((order) => ({
				...order,
				allowed_transitions: order.allowed_transitions || [],
			}));
			setOrders(ordersWithTransitions);
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, []);

	return (
		<div>
			<h1>Orders</h1>
			<OrderForm onSuccess={fetchOrders} />
			<OrderList orders={orders} refresh={fetchOrders} />
		</div>
	);
}
