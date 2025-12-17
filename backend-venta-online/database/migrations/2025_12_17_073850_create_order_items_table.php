<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	/**
	 * Run the migrations.
	 * Creates the 'order_items' table.
	 */
	public function up(): void
	{
		Schema::create('order_items', function (Blueprint $table) {
			$table->id();
			$table->foreignId('order_id')
				->constrained('orders')
				->onDelete('cascade'); // Cascade delete if order is removed
			$table->string('product_name');
			$table->integer('quantity')->default(1);
			$table->decimal('unit_price', 10, 2)->default(0);
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 * Drops the 'order_items' table.
	 */
	public function down(): void
	{
		Schema::dropIfExists('order_items');
	}
};
