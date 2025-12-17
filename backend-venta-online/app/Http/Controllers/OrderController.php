<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * List all orders with their items
     */
    public function index()
    {
        $orders = Order::with('items')->get();
        return response()->json($orders, 200);
    }

    /**
     * Create a new order with items
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'nullable|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'total_amount' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_name' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        $order = Order::create([
            'customer_name' => $data['customer_name'],
            'customer_email' => $data['customer_email'] ?? null,
            'customer_phone' => $data['customer_phone'] ?? null,
            'total_amount' => $data['total_amount'],
        ]);

        // Create associated order items
        $order->items()->createMany($data['items']);

        return response()->json($order->load('items'), 201);
    }

    /**
     * Show a single order with items
     */
    public function show(Order $order)
    {
        return response()->json($order->load('items'), 200);
    }

    /**
     * Update order details if not finalized
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
            'customer_email' => 'sometimes|email|max:255',
            'customer_phone' => 'sometimes|string|max:50',
            'total_amount' => 'sometimes|numeric|min:0',
        ]);

        $order->update($data);

        return response()->json($order->load('items'), 200);
    }

    /**
     * Update the order status with validation
     */
    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => ['required', Rule::in(Order::STATUSES)],
        ]);

        $newStatus = $data['status'];

        // Return success if the status is already set (idempotent)
        if ($order->status === $newStatus) {
            return response()->json([
                'message' => 'Status is already set to ' . $newStatus,
                'order' => $order->load('items')
            ], 200);
        }

        // Validate allowed transitions
        if (!$order->canChangeStatus($newStatus)) {
            return response()->json([
                'message' => 'Invalid status transition.',
                'current_status' => $order->status,
                'attempted_status' => $newStatus,
                'allowed_transitions' => $order->getAllowedTransitions(),
                'is_final_state' => $order->isFinal()
            ], 400);
        }

        // Update status
        $order->status = $newStatus;
        $order->save();

        return response()->json([
            'message' => 'Status updated successfully',
            'order' => $order->load('items')
        ], 200);
    }
}

