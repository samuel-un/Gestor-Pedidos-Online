import { useState } from "react";
import { createOrder } from "../services/orderService";

export default function CreateOrderForm({ refresh }) {
	const [customerName, setCustomerName] = useState("");
	const [customerEmail, setCustomerEmail] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [items, setItems] = useState([
		{ product_name: "", quantity: 1, unit_price: 0 },
	]);

	const handleItemChange = (index, field, value) => {
		const newItems = [...items];
		newItems[index][field] =
			field === "quantity" || field === "unit_price"
				? Number(value)
				: value;
		setItems(newItems);
	};

	const addItem = () =>
		setItems([...items, { product_name: "", quantity: 1, unit_price: 0 }]);
	const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const total_amount = items.reduce(
				(sum, item) => sum + item.quantity * item.unit_price,
				0
			);
			await createOrder({
				customer_name: customerName,
				customer_email: customerEmail,
				customer_phone: customerPhone,
				total_amount,
				items,
			});
			setCustomerName("");
			setCustomerEmail("");
			setCustomerPhone("");
			setItems([{ product_name: "", quantity: 1, unit_price: 0 }]);
			refresh();
		} catch (err) {
			alert(err.response?.data?.message || "Error creating order");
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			style={{
				border: "1px solid #ccc",
				padding: "10px",
				marginBottom: "20px",
			}}
		>
			<h3>Create Order</h3>
			<input
				placeholder="Name"
				value={customerName}
				onChange={(e) => setCustomerName(e.target.value)}
				required
			/>
			<input
				placeholder="Email"
				value={customerEmail}
				onChange={(e) => setCustomerEmail(e.target.value)}
			/>
			<input
				placeholder="Phone"
				value={customerPhone}
				onChange={(e) => setCustomerPhone(e.target.value)}
			/>
			<div>
				<h4>Items</h4>
				{items.map((item, index) => (
					<div key={index}>
						<input
							placeholder="Product"
							value={item.product_name}
							onChange={(e) =>
								handleItemChange(
									index,
									"product_name",
									e.target.value
								)
							}
							required
						/>
						<input
							type="number"
							placeholder="Qty"
							value={item.quantity}
							onChange={(e) =>
								handleItemChange(
									index,
									"quantity",
									e.target.value
								)
							}
							min="1"
						/>
						<input
							type="number"
							placeholder="Unit Price"
							value={item.unit_price}
							onChange={(e) =>
								handleItemChange(
									index,
									"unit_price",
									e.target.value
								)
							}
							min="0"
							step="0.01"
						/>
						{items.length > 1 && (
							<button
								type="button"
								onClick={() => removeItem(index)}
							>
								Remove
							</button>
						)}
					</div>
				))}
				<button type="button" onClick={addItem}>
					Add Item
				</button>
			</div>
			<button type="submit">Create Order</button>
		</form>
	);
}
