<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>{{ config('app.name', 'BudgetBuddy') }}</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <link rel="stylesheet" href="{{ asset('css/desktop.css') }}">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans text-gray-900 antialiased bg-gray-100">
        <div class="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0">
            <div class="mb-6">
                <a href="/" class="flex flex-col items-center">
                    <img src="{{ asset('logo.png') }}" alt="BudgetBuddy Logo">
                    <span class="text-2xl font-bold text-gray-800 mt-2">BudgetBuddy</span>
                </a>
            </div>

            <div class="w-full py-20 sm:max-w-md  px-6  bg-white shadow-md overflow-hidden sm:rounded-lg">
                {{ $slot }}
                
            </div>
        </div>
    </body>
</html>