export default function OrderItem({ item }) {
	const unitPrice = Number(item.unit_price);

	return (
		<div style={{ padding: "5px 0" }}>
			<strong>{item.product_name}</strong> - Qty: {item.quantity} - Unit:
			${unitPrice.toFixed(2)}
		</div>
	);
}
