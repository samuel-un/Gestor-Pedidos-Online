import { useState } from "react";
import StatusSelector from "./StatusSelector";
import { updateOrderStatus, updateOrder } from "../services/orderService";

export default function OrdersList({ orders, refresh }) {
	const [editedOrders, setEditedOrders] = useState({});

	const handleChange = (orderId, field, value) => {
		setEditedOrders((prev) => ({
			...prev,
			[orderId]: {
				...prev[orderId],
				[field]: value,
			},
		}));
	};

	const handleItemChange = (orderId, index, field, value) => {
		const orderEdits = editedOrders[orderId] || {};
		const originalItems = orders.find((o) => o.id === orderId).items;
		const items = orderEdits.items
			? [...orderEdits.items]
			: [...originalItems];

		items[index][field] =
			field === "quantity" || field === "unit_price"
				? Number(value)
				: value;

		setEditedOrders((prev) => ({
			...prev,
			[orderId]: {
				...orderEdits,
				items,
			},
		}));
	};

	const addItem = (orderId) => {
		const orderEdits = editedOrders[orderId] || {};
		const originalItems = orders.find((o) => o.id === orderId).items;
		const items = orderEdits.items
			? [...orderEdits.items]
			: [...originalItems];

		items.push({ product_name: "", quantity: 1, unit_price: 0 });

		setEditedOrders((prev) => ({
			...prev,
			[orderId]: {
				...orderEdits,
				items,
			},
		}));
	};

	const handleUpdate = async (orderId) => {
		try {
			const order = orders.find((o) => o.id === orderId);
			const edits = editedOrders[orderId] || {};

			const mergedData = {
				customer_name: edits.customer_name ?? order.customer_name,
				customer_email: edits.customer_email ?? order.customer_email,
				customer_phone: edits.customer_phone ?? order.customer_phone,
				items: (edits.items ?? order.items).map((item) => ({
					id: item.id, // si tiene id, lo enviamos
					product_name: item.product_name,
					quantity: Number(item.quantity),
					unit_price: Number(item.unit_price),
				})),
			};

			mergedData.total_amount = mergedData.items.reduce(
				(sum, i) => sum + i.quantity * i.unit_price,
				0
			);

			console.log("Payload enviado al backend:", mergedData);

			await updateOrder(orderId, mergedData);

			setEditedOrders((prev) => {
				const copy = { ...prev };
				delete copy[orderId];
				return copy;
			});

			refresh();
		} catch (err) {
			alert(err.response?.data?.message || "Error updating order");
		}
	};

	// Cambiar estado
	const handleStatusChange = async (order, newStatus) => {
		try {
			await updateOrderStatus(order.id, newStatus);
			refresh();
		} catch (err) {
			alert(err.response?.data?.message || "Error updating status");
		}
	};

	return (
		<div>
			{orders.map((order) => {
				const edits = editedOrders[order.id] || {};
				const customer_name =
					edits.customer_name ?? order.customer_name;
				const customer_email =
					edits.customer_email ?? order.customer_email;
				const customer_phone =
					edits.customer_phone ?? order.customer_phone;
				const items = edits.items ?? order.items;

				const isEditable = order.status === "CREATED";

				return (
					<div
						key={order.id}
						style={{
							border: "1px solid #ccc",
							margin: "10px 0",
							padding: "10px",
						}}
					>
						<h3>
							<input
								value={customer_name}
								onChange={(e) =>
									handleChange(
										order.id,
										"customer_name",
										e.target.value
									)
								}
								style={{ fontSize: "1em", fontWeight: "bold" }}
								disabled={!isEditable}
							/>{" "}
							($
							{Number(
								items.reduce(
									(sum, item) =>
										sum + item.quantity * item.unit_price,
									0
								)
							).toFixed(2)}
							)
						</h3>

						<div>
							<input
								placeholder="Email"
								value={customer_email}
								onChange={(e) =>
									handleChange(
										order.id,
										"customer_email",
										e.target.value
									)
								}
								disabled={!isEditable}
							/>
							<input
								placeholder="Phone"
								value={customer_phone}
								onChange={(e) =>
									handleChange(
										order.id,
										"customer_phone",
										e.target.value
									)
								}
								disabled={!isEditable}
							/>
						</div>

						<h4>Items</h4>
						{items.map((item, index) => (
							<div key={index}>
								<input
									placeholder="Product"
									value={item.product_name}
									onChange={(e) =>
										handleItemChange(
											order.id,
											index,
											"product_name",
											e.target.value
										)
									}
									required
									disabled={!isEditable}
								/>
								<input
									placeholder="Qty"
									type="number"
									value={item.quantity}
									onChange={(e) =>
										handleItemChange(
											order.id,
											index,
											"quantity",
											e.target.value
										)
									}
									required
									disabled={!isEditable}
								/>
								<input
									placeholder="Unit Price"
									type="number"
									value={item.unit_price}
									onChange={(e) =>
										handleItemChange(
											order.id,
											index,
											"unit_price",
											e.target.value
										)
									}
									required
									disabled={!isEditable}
								/>
							</div>
						))}
						{isEditable && (
							<button
								type="button"
								onClick={() => addItem(order.id)}
							>
								Add Item
							</button>
						)}

						<div style={{ marginTop: "10px" }}>
							<strong>Status: </strong>
							<StatusSelector
								currentStatus={order.status}
								allowed={order.allowed_transitions}
								onChange={(newStatus) =>
									handleStatusChange(order, newStatus)
								}
							/>
						</div>

						{isEditable && (
							<button
								type="button"
								onClick={() => handleUpdate(order.id)}
								style={{ marginTop: "10px" }}
							>
								Update
							</button>
						)}
					</div>
				);
			})}
		</div>
	);
}
