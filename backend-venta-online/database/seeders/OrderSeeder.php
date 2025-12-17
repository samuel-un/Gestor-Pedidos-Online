<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        $ordersJson = '[
            {"name": "Alejandro García", "email": "alejandro.garcia@gmail.com", "phone": "+34 612 345 678"},
            {"name": "Lucía Fernández", "email": "lucia.fer92@outlook.es", "phone": "+34 699 887 766"},
            {"name": "Javier López", "email": "javi.lopez.moda@hotmail.com", "phone": "+34 600 112 233"},
            {"name": "Marta Sánchez", "email": "marta.sanchez@yahoo.es", "phone": "+34 655 443 322"},
            {"name": "Sergio Moreno", "email": "sergio.m@protonmail.com", "phone": "+34 712 990 011"},
            {"name": "Elena Ruiz", "email": "elena.ruiz.shop@gmail.com", "phone": "+34 688 776 655"},
            {"name": "Pablo Castro", "email": "pablo.castro88@gmail.com", "phone": "+34 622 334 455"},
            {"name": "Carmen Ortiz", "email": "carmen_ortiz@icloud.com", "phone": "+34 677 554 433"},
            {"name": "Raúl Jiménez", "email": "raul.jimenez.dev@gmail.com", "phone": "+34 644 332 211"},
            {"name": "Sara Villanueva", "email": "sara.villa@gmail.com", "phone": "+34 633 221 100"},
            {"name": "Daniel Méndez", "email": "dani.mendez@outlook.com", "phone": "+34 611 009 988"}
        ]';

        $inventory = [
            ["item" => "Camiseta Básica Algodón", "price" => 19.99],
            ["item" => "Pantalón Vaquero Slim Fit", "price" => 45.50],
            ["item" => "Sudadera con Capucha", "price" => 35.00],
            ["item" => "Chaqueta Americana Navy", "price" => 89.95],
            ["item" => "Zapatillas Urbanas White", "price" => 55.00],
            ["item" => "Cinturón de Cuero Marrón", "price" => 25.00],
            ["item" => "Gorra Deportiva Negra", "price" => 15.00],
            ["item" => "Jersey de Punto Lana", "price" => 42.00]
        ];

        $states = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
        $customers = json_decode($ordersJson, true);

        foreach ($customers as $index => $customer) {
            DB::transaction(function () use ($customer, $inventory, $index, $states) {
                $status = $index < count($states) ? $states[$index] : 'CREATED';

                $orderNumber = 'ES' . str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
                $numItems = rand(1, 5);
                $selectedKeys = array_rand($inventory, $numItems);
                $selectedKeys = is_array($selectedKeys) ? $selectedKeys : [$selectedKeys];

                $totalAmount = 0;
                $itemsToInsert = [];

                foreach ($selectedKeys as $key) {
                    $product = $inventory[$key];
                    $qty = rand(1, 2);
                    $totalAmount += ($product['price'] * $qty);

                    $itemsToInsert[] = [
                        'product_name' => $product['item'],
                        'quantity' => $qty,
                        'unit_price' => $product['price'],
                        'created_at' => now(),
                        'updated_at' => now()
                    ];
                }

                $order = Order::create([
                    'customer_name' => $customer['name'],
                    'customer_email' => $customer['email'],
                    'customer_phone' => $customer['phone'],
                    'order_number' => $orderNumber,
                    'total_amount' => $totalAmount,
                    'status' => $status,
                    'created_at' => now()->subHours(rand(1, 72)),
                ]);

                $order->items()->createMany($itemsToInsert);

                $order->statusLogs()->create([
                    'status' => $status,
                    'message' => 'Pedido inicializado mediante proceso de carga masiva.',
                    'created_at' => $order->created_at
                ]);
            });
        }
    }
}