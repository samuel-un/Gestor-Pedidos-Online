<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api', // Prefix for all API routes
        commands: __DIR__.'/../routes/console.php',
        health: '/up', // Health check endpoint
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Register global middleware here if needed
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Configure exception handling here if needed
    })
    ->create();
