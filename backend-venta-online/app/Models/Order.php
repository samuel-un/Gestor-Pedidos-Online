<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
	// Mass-assignable fields
	protected $fillable = [
		'customer_name',
		'customer_email',
		'customer_phone',
		'total_amount',
		'status',
		'order_number',
	];

	// Define all possible statuses
	public const STATUSES = [
		'CREATED',
		'CONFIRMED',
		'SHIPPED',
		'DELIVERED',
		'CANCELLED',
		'RETURNED',
	];

	// States from which no further changes are allowed
	public const FINAL_STATES = [
		'DELIVERED',
		'CANCELLED',
		'RETURNED',
	];

	/**
	 * Relation: an order has many items
	 */
	public function items()
	{
		return $this->hasMany(OrderItem::class);
	}

	/**
	 * Check if the order is in a final state
	 */
	public function isFinal(): bool
	{
		return in_array($this->status, self::FINAL_STATES);
	}

	/**
	 * Determine if the status can be changed to a new value
	 */
	public function canChangeStatus(string $newStatus): bool
	{
		// Allow idempotent update (same status)
		if ($this->status === $newStatus) {
			return true;
		}

		// Do not allow changes if the order is finalized
		if ($this->isFinal()) {
			return false;
		}

		// Validate allowed transitions based on current status
		return match ($this->status) {
			'CREATED' => in_array($newStatus, ['CONFIRMED', 'CANCELLED']),
			'CONFIRMED' => in_array($newStatus, ['SHIPPED', 'CANCELLED']),
			'SHIPPED' => in_array($newStatus, ['DELIVERED', 'RETURNED']),
			default => false,
		};
	}

	/**
	 * Get allowed status transitions from current status
	 */
	public function getAllowedTransitions(): array
	{
		if ($this->isFinal()) {
			return [];
		}

		return match ($this->status) {
			'CREATED' => ['CONFIRMED', 'CANCELLED'],
			'CONFIRMED' => ['SHIPPED', 'CANCELLED'],
			'SHIPPED' => ['DELIVERED', 'RETURNED'],
			default => [],
		};
	}

	public function statusLogs()
	{
		return $this->hasMany(OrderStatusLog::class);
	}
}
