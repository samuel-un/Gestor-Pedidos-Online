import { useState } from "react";
import { createOrder, updateOrder } from "../services/orderService";

export default function OrderForm({ onSuccess, order }) {
	const isEditable = !order || order.status === "CREATED";
	const [form, setForm] = useState(
		order || {
			customer_name: "",
			customer_email: "",
			customer_phone: "",
			items: [{ product_name: "", quantity: 1, unit_price: 0 }],
		}
	);

	const handleItemChange = (index, field, value) => {
		const newItems = [...form.items];
		newItems[index][field] =
			field === "quantity" || field === "unit_price"
				? Number(value)
				: value;
		setForm({ ...form, items: newItems });
	};

	const addItem = () => {
		if (!isEditable) return;
		setForm({
			...form,
			items: [
				...form.items,
				{ product_name: "", quantity: 1, unit_price: 0 },
			],
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isEditable) return;

		const total_amount = form.items.reduce(
			(sum, item) => sum + item.quantity * item.unit_price,
			0
		);

		const payload = { ...form, total_amount };

		try {
			if (order) {
				await updateOrder(order.id, payload);
			} else {
				await createOrder(payload);
			}
			onSuccess();
			setForm({
				customer_name: "",
				customer_email: "",
				customer_phone: "",
				items: [{ product_name: "", quantity: 1, unit_price: 0 }],
			});
		} catch (err) {
			alert(err.response?.data?.message || "Error submitting order");
		}
	};

	return (
		<form onSubmit={handleSubmit}>
			<input
				placeholder="Name"
				value={form.customer_name}
				onChange={(e) =>
					setForm({ ...form, customer_name: e.target.value })
				}
				required
				disabled={!isEditable}
			/>
			<input
				placeholder="Email"
				value={form.customer_email}
				onChange={(e) =>
					setForm({ ...form, customer_email: e.target.value })
				}
				disabled={!isEditable}
			/>
			<input
				placeholder="Phone"
				value={form.customer_phone}
				onChange={(e) =>
					setForm({ ...form, customer_phone: e.target.value })
				}
				disabled={!isEditable}
			/>
			<input
				placeholder="Total Amount"
				type="number"
				value={form.items.reduce(
					(sum, item) => sum + item.quantity * item.unit_price,
					0
				)}
				readOnly
				disabled
			/>
			<h4>Items</h4>
			{form.items.map((item, i) => (
				<div key={i}>
					<input
						placeholder="Product"
						value={item.product_name}
						onChange={(e) =>
							handleItemChange(i, "product_name", e.target.value)
						}
						required
						disabled={!isEditable}
					/>
					<input
						placeholder="Qty"
						type="number"
						value={item.quantity}
						onChange={(e) =>
							handleItemChange(i, "quantity", e.target.value)
						}
						required
						disabled={!isEditable}
					/>
					<input
						placeholder="Unit Price"
						type="number"
						value={item.unit_price}
						onChange={(e) =>
							handleItemChange(i, "unit_price", e.target.value)
						}
						required
						disabled={!isEditable}
					/>
				</div>
			))}
			<button type="button" onClick={addItem} disabled={!isEditable}>
				Add Item
			</button>
			<button type="submit" disabled={!isEditable}>
				{order ? "Update Order" : "Create Order"}
			</button>
		</form>
	);
}
