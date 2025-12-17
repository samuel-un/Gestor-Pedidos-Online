export default function StatusSelector({ currentStatus, allowed, onChange }) {
	return (
		<select
			value={currentStatus}
			onChange={(e) => onChange(e.target.value)}
		>
			<option value={currentStatus}>{currentStatus}</option>
			{allowed.map((status) => (
				<option key={status} value={status}>
					{status}
				</option>
			))}
		</select>
	);
}
