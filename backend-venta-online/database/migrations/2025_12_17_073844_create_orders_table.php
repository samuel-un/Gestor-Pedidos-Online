<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	/**
	 * Run the migrations.
	 * Creates the 'orders' table.
	 */
	public function up(): void
	{
		Schema::create('orders', function (Blueprint $table) {
			$table->id();
			$table->string('customer_name');
			$table->string('customer_email')->nullable();
			$table->string('customer_phone')->nullable();
			$table->decimal('total_amount', 10, 2)->default(0);
			$table->enum('status', ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'])->default('CREATED');
			$table->string('order_number')->unique();
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 * Drops the 'orders' table.
	 */
	public function down(): void
	{
		Schema::dropIfExists('orders');
	}
};
