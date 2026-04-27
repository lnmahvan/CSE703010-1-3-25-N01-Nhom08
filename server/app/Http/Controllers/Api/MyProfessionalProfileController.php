<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProfessionalProfile;
use App\Services\ProfessionalProfileService;
use Illuminate\Http\Request;

class MyProfessionalProfileController extends Controller
{
    public function __construct(private readonly ProfessionalProfileService $professionalProfileService)
    {
    }

    public function show(Request $request)
    {
        $profile = $this->professionalProfileService->getMyProfile($request->user());

        return response()->json([
            'profile' => $profile,
            'options' => $this->professionalProfileService->getOptions(),
        ]);
    }

    public function update(Request $request, ProfessionalProfile $professionalProfile)
    {
        $this->professionalProfileService->assertSelfServiceAccess($request->user(), $professionalProfile);
        $this->professionalProfileService->validateSelfServicePayloadKeys(array_keys($request->except(['certificate_files'])));

        $validated = $request->validate([
            'notes' => 'nullable|string',
            'specialties_payload' => 'nullable|string',
            'certificates_payload' => 'nullable|string',
            'certificate_files.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $profile = $this->professionalProfileService->updateProfile(
            $professionalProfile,
            array_merge($validated, [
                'specialties' => $this->decodeJsonField($request->input('specialties_payload', '[]')),
                'certificates' => $this->decodeJsonField($request->input('certificates_payload', '[]')),
            ]),
            $request->file('certificate_files', []),
            $request->user(),
            true
        );

        return response()->json([
            'message' => 'Cap nhat ho so ca nhan thanh cong.',
            'profile' => $profile,
        ]);
    }

    public function submit(Request $request, ProfessionalProfile $professionalProfile)
    {
        $this->professionalProfileService->assertSelfServiceAccess($request->user(), $professionalProfile);
        $profile = $this->professionalProfileService->submitForApproval($professionalProfile, $request->user());

        return response()->json([
            'message' => 'Da gui ho so cho admin duyet.',
            'profile' => $profile,
        ]);
    }

    private function decodeJsonField(?string $json): array
    {
        if ($json === null || trim($json) === '') {
            return [];
        }

        $decoded = json_decode($json, true);
        if (! is_array($decoded)) {
            abort(422, 'Du lieu JSON khong hop le.');
        }

        return $decoded;
    }
}
