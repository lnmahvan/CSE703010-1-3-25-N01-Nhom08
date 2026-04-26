<?php
$staffController = app(App\Http\Controllers\Api\StaffController::class);
$request = new Illuminate\Http\Request();
$request->merge([
    'employee_code' => 'NV009',
    'full_name' => 'Nguyen Van Test',
    'email' => 'nvtest@example.com',
    'phone' => '0999999999',
    'role_slug' => 'le_tan',
    'join_date' => '2026-04-26',
    'status' => 'working'
]);
$user = App\Models\User::first();
$request->setUserResolver(function() use ($user) { return $user; });
$response = $staffController->store($request);
echo $response->getContent();
