<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceGroup;
use App\Models\Specialty;
use App\Services\ServiceCatalogService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceCatalogController extends Controller
{
    public function __construct(private readonly ServiceCatalogService $services)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'service_group_id', 'status', 'visibility', 'specialty_id', 'per_page',
        ]);

        $user = $request->user();
        $role = $user?->roles->first()?->slug ?? null;
        if ($role === 'benh_nhan') {
            $filters['visibility'] = 'public';
            $filters['status'] = Service::STATUS_ACTIVE;
        }

        $paginator = $this->services->listServices($filters);

        return response()->json($paginator);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $role = $user?->roles->first()?->slug ?? null;
        $isPatient = $role === 'benh_nhan';

        $service = $this->services->findService($id, publicAttachmentsOnly: $isPatient);

        if ($isPatient
            && ($service->visibility !== Service::VISIBILITY_PUBLIC
                || $service->status !== Service::STATUS_ACTIVE)
        ) {
            return response()->json(['message' => 'Khong tim thay dich vu.'], 404);
        }

        return response()->json($service);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validateForm($request, isCreate: true);
        $service = $this->services->createService($data, $request->user());

        return response()->json($service, 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $data = $this->validateForm($request, isCreate: false);
        $service = $this->services->updateService($id, $data, $request->user());

        return response()->json($service);
    }

    public function changeStatus(Request $request, int $id): JsonResponse
    {
        $data = $request->validate([
            'status' => ['required', 'string', Rule::in(Service::STATUSES)],
            'reason' => 'nullable|string|max:500',
        ]);

        $service = $this->services->changeStatus($id, $data['status'], $data['reason'] ?? null, $request->user());

        return response()->json($service);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->services->deleteService($id, $request->user());

        return response()->json(['message' => 'Da xoa dich vu.']);
    }

    public function groups(): JsonResponse
    {
        return response()->json(
            ServiceGroup::query()->orderBy('display_order')->orderBy('name')->get()
        );
    }

    public function specialties(): JsonResponse
    {
        return response()->json(
            Specialty::query()->where('is_active', true)->orderBy('name')->get()
        );
    }

    public function publicIndex(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'service_group_id', 'specialty_id', 'per_page']);
        $filters['visibility'] = 'public';

        return response()->json($this->services->publicListServices($filters));
    }

    public function auditLogs(): JsonResponse
    {
        return response()->json($this->services->recentAuditLogs());
    }

    private function validateForm(Request $request, bool $isCreate): array
    {
        $codeRule = ['nullable', 'string', 'max:30'];
        if ($isCreate) {
            $codeRule[] = Rule::unique('services', 'service_code');
        }

        return $request->validate([
            'service_code' => $codeRule,
            'service_group_id' => ['nullable', 'integer', 'exists:service_groups,id'],
            'name' => $isCreate ? 'required|string|max:255' : 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'duration_minutes' => 'nullable|integer|min:0|max:1440',
            'commission_rate' => 'nullable|integer|min:0|max:100',
            'status' => ['nullable', 'string', Rule::in(Service::STATUSES)],
            'visibility' => ['nullable', 'string', Rule::in(Service::VISIBILITIES)],
            'notes' => 'nullable|string',
            'image_path' => 'nullable|string|max:500',
            'specialty_ids' => 'nullable|array',
            'specialty_ids.*' => 'integer|exists:specialties,id',
            'primary_specialty_id' => 'nullable|integer|exists:specialties,id',
            'price_reason' => 'nullable|string|max:255',
            'price_effective_date' => 'nullable|date',
            'status_reason' => 'nullable|string|max:500',
        ]);
    }
}
