<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    // Mass assignable fields
    protected $fillable = [
        'order_id',
        'product_name',
        'quantity',
        'unit_price',
    ];

    /**
     * Relation: an item belongs to an order
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Calculate total price for this item
     */
    public function total(): float
    {
        return $this->quantity * $this->unit_price;
    }
}
