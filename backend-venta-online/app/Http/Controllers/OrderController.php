<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
	/**
	 * List all orders with their items
	 */
	public function index()
	{
		$orders = Order::with('items', 'statusLogs')->get()->map(function ($order) {
			$order->allowed_transitions = $order->getAllowedTransitions();
			// Asegurar que los campos opcionales no sean null
			$order->customer_email = $order->customer_email ?? '';
			$order->customer_phone = $order->customer_phone ?? '';
			return $order;
		});

		return response()->json($orders, 200);
	}

	/**
	 * Create a new order with items
	 */
	public function store(Request $request)
	{
		$data = $request->validate([
			'customer_name' => 'required|string|max:255',
			'customer_email' => 'required|email|max:255',
			'customer_phone' => 'nullable|string|max:50',
			'total_amount' => 'required|numeric|min:0',
			'items' => 'required|array|min:1',
			'items.*.product_name' => 'required|string|max:255',
			'items.*.quantity' => 'required|integer|min:1',
			'items.*.unit_price' => 'required|numeric|min:0',
		]);

		do {
			$orderNumber = 'ES' . mt_rand(100000, 999999);
		} while (Order::where('order_number', $orderNumber)->exists());

		$order = Order::create([
			'order_number' => $orderNumber,
			'customer_name' => $data['customer_name'],
			'customer_email' => $data['customer_email'],
			'customer_phone' => $data['customer_phone'] ?? null,
			'total_amount' => $data['total_amount'],
		]);

		$order->items()->createMany($data['items']);

		$order->customer_email = $order->customer_email ?? '';
		$order->customer_phone = $order->customer_phone ?? '';

		return response()->json($order->load('items', 'statusLogs'), 201);
	}


	/**
	 * Show a single order with items
	 */
	public function show(Order $order)
	{
		$order->load('items', 'statusLogs');
		$order->customer_email = $order->customer_email ?? '';
		$order->customer_phone = $order->customer_phone ?? '';
		$order->allowed_transitions = $order->getAllowedTransitions();

		return response()->json($order, 200);
	}

	/**
	 * Update order details including items if not finalized
	 */
	public function update(Request $request, Order $order)
	{
		if ($order->isFinal()) {
			return response()->json([
				'message' => 'Cannot update a finalized order.',
				'current_status' => $order->status
			], 400);
		}

		$data = $request->validate([
			'customer_name' => 'sometimes|string|max:255',
			'customer_email' => 'sometimes|nullable|email|max:255',
			'customer_phone' => 'sometimes|nullable|string|max:50',
			'total_amount' => 'sometimes|numeric|min:0',
			'items' => 'sometimes|array|min:1',
			'items.*.id' => 'sometimes|integer|exists:order_items,id',
			'items.*.product_name' => 'required_with:items|string|max:255',
			'items.*.quantity' => 'required_with:items|integer|min:1',
			'items.*.unit_price' => 'required_with:items|numeric|min:0',
		]);

		$order->update($data);

		if (!empty($data['items'])) {
			foreach ($data['items'] as $itemData) {
				if (isset($itemData['id'])) {
					$item = OrderItem::find($itemData['id']);
					if ($item && $item->order_id == $order->id) {
						$item->update([
							'product_name' => $itemData['product_name'],
							'quantity' => $itemData['quantity'],
							'unit_price' => $itemData['unit_price'],
						]);
					}
				} else {
					$order->items()->create($itemData);
				}
			}
		}

		$order->load('items', 'statusLogs');
		$order->customer_email = $order->customer_email ?? '';
		$order->customer_phone = $order->customer_phone ?? '';
		$order->allowed_transitions = $order->getAllowedTransitions();

		return response()->json($order, 200);
	}

	/**
	 * Update the order status with validation
	 */
	public function updateStatus(Request $request, Order $order)
	{
		$data = $request->validate([
			'status' => ['required', Rule::in(Order::STATUSES)],
			'message' => 'nullable|string|max:500', // optional message
		]);

		$newStatus = $data['status'];
		$message = $data['message'] ?? null;

		if ($order->status === $newStatus) {
			$order->load('items', 'statusLogs');
			$order->customer_email = $order->customer_email ?? '';
			$order->customer_phone = $order->customer_phone ?? '';
			$order->allowed_transitions = $order->getAllowedTransitions();

			return response()->json([
				'message' => 'Status is already set to ' . $newStatus,
				'order' => $order
			], 200);
		}

		if (!$order->canChangeStatus($newStatus)) {
			return response()->json([
				'message' => 'Invalid status transition.',
				'current_status' => $order->status,
				'attempted_status' => $newStatus,
				'allowed_transitions' => $order->getAllowedTransitions(),
				'is_final_state' => $order->isFinal()
			], 400);
		}

		$order->status = $newStatus;
		$order->save();

		if (in_array($newStatus, ['CANCELLED', 'RETURNED'])) {
			$defaultMessage = $newStatus === 'CANCELLED'
				? 'Order cancelled by user/system.'
				: 'Order returned from shipment.';

			$order->statusLogs()->create([
				'status' => $newStatus,
				'message' => $message ?? $defaultMessage,
			]);
		}

		$order->load('items', 'statusLogs');
		$order->customer_email = $order->customer_email ?? '';
		$order->customer_phone = $order->customer_phone ?? '';
		$order->allowed_transitions = $order->getAllowedTransitions();

		return response()->json([
			'message' => 'Status updated successfully',
			'order' => $order
		], 200);
	}
}
