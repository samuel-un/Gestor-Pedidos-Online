import React, { useState, useEffect } from "react";
import OrdersList from "./components/OrderList";
import OrderForm from "./components/OrderForm";
import DashboardStats from "./components/DashboardStats";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

function App() {
	const [orders, setOrders] = useState([]);
	const [stats, setStats] = useState(null);
	const [pagination, setPagination] = useState(null);
	const [loading, setLoading] = useState(true);

	const [searchTerm, setSearchTerm] = useState("");

	const fetchOrders = async (page = 1, search = searchTerm) => {
		try {
			setLoading(true);

			const response = await fetch(
				`${API_URL}/orders?page=${page}&search=${search}`
			);
			const data = await response.json();

			setOrders(data.data);
			setPagination(data);

			const resStats = await fetch(`${API_URL}/orders/stats`);
			if (resStats.ok) {
				const dataStats = await resStats.json();
				setStats(dataStats);
			}
		} catch (error) {
			console.error("Error al cargar pedidos:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, []);

	const refreshOrders = () => fetchOrders(1, searchTerm);

	const handlePageChange = (page) => fetchOrders(page, searchTerm);

	const handleSearch = (term) => {
		setSearchTerm(term);
		fetchOrders(1, term);
	};

	return (
		<div className="min-h-screen bg-gray-100 font-sans text-gray-900">
			<nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between h-16">
						<div className="flex items-center gap-3">
							<div className="bg-indigo-600 text-white p-1.5 rounded-lg">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
									/>
								</svg>
							</div>
							<span className="text-xl font-bold text-gray-800 tracking-tight">
								OrderManager{" "}
								<span className="text-indigo-600">Pro</span>
							</span>
						</div>
						<div className="flex items-center gap-4">
							<span className="text-sm font-medium text-gray-500 hidden sm:block">
								Administrador
							</span>
							<div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
								A
							</div>
						</div>
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						Dashboard de Pedidos
					</h1>
					<p className="mt-1 text-sm text-gray-500">
						Panel de gestión de pedidos, clientes y logística en
						tiempo real.
					</p>
				</div>

				<DashboardStats stats={stats} />

				<div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
					<div className="xl:col-span-1 xl:sticky xl:top-24">
						<OrderForm onSuccess={refreshOrders} />
					</div>

					<div className="xl:col-span-2">
						{loading && orders.length === 0 && !searchTerm ? (
							<div className="animate-pulse space-y-4">
								<div className="h-40 bg-gray-200 rounded-xl"></div>
								<div className="h-40 bg-gray-200 rounded-xl"></div>
							</div>
						) : (
							<OrdersList
								orders={orders}
								pagination={pagination}
								onPageChange={handlePageChange}
								onSearch={handleSearch}
								refresh={() =>
									fetchOrders(
										pagination?.current_page || 1,
										searchTerm
									)
								}
							/>
						)}
					</div>
				</div>
			</main>
		</div>
	);
}

export default App;
