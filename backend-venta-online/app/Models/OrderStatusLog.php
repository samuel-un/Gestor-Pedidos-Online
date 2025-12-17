<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderStatusLog extends Model
{
    protected $fillable = ['order_id', 'status', 'message'];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
