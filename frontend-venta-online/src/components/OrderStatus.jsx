import React, { useState } from "react";
import axios from "../services/orderService";

export default function OrderStatus({ order, onUpdate }) {
	const [status, setStatus] = useState(order.status);
	const [loading, setLoading] = useState(false);

	const handleChange = async (e) => {
		const newStatus = e.target.value;
		setLoading(true);
		try {
			const res = await axios.patch(`/orders/${order.id}/status`, {
				status: newStatus,
			});
			setStatus(res.data.order.status);
			onUpdate(res.data.order);
		} catch (err) {
			alert(err.response?.data?.message || "Error updating status");
		} finally {
			setLoading(false);
		}
	};

	const allowed = order.allowed_transitions || [];

	return (
		<select
			value={status}
			onChange={handleChange}
			disabled={loading || allowed.length === 0}
		>
			<option value={status}>{status}</option>
			{allowed.map(
				(s) =>
					s !== status && (
						<option key={s} value={s}>
							{s}
						</option>
					)
			)}
		</select>
	);
}
