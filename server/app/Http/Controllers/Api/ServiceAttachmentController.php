<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceAttachment;
use App\Services\ServiceAttachmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ServiceAttachmentController extends Controller
{
    public function __construct(private readonly ServiceAttachmentService $attachments)
    {
    }

    public function index(Request $request, int $serviceId): JsonResponse
    {
        $query = ServiceAttachment::where('service_id', $serviceId)
            ->with('uploader:id,name')
            ->orderByDesc('id');

        $user = $request->user();
        $role = $user?->roles->first()?->slug ?? null;
        if ($role === 'benh_nhan') {
            $query->where('visibility', ServiceAttachment::VISIBILITY_PUBLIC);
        }

        return response()->json($query->get());
    }

    public function store(Request $request, int $serviceId): JsonResponse
    {
        $data = $request->validate([
            'file' => 'required|file|max:20480',
            'attachment_type' => ['nullable', Rule::in(['image', 'document'])],
            'visibility' => ['nullable', Rule::in(['public', 'internal'])],
            'description' => 'nullable|string|max:255',
        ]);

        $attachment = $this->attachments->upload(
            $serviceId,
            $request->file('file'),
            $data,
            $request->user()
        );

        return response()->json($attachment, 201);
    }

    public function destroy(Request $request, int $serviceId, int $attachmentId): JsonResponse
    {
        $this->attachments->delete($serviceId, $attachmentId, $request->user());

        return response()->json(['message' => 'Da xoa tep dinh kem.']);
    }

    public function download(Request $request, int $serviceId, int $attachmentId): StreamedResponse|JsonResponse
    {
        $attachment = ServiceAttachment::where('service_id', $serviceId)->findOrFail($attachmentId);

        if ($attachment->visibility === 'internal') {
            $user = $request->user();
            $roleSlug = $user?->roles->first()?->slug;
            if (! $user || $roleSlug === 'benh_nhan') {
                return response()->json(['message' => 'Khong co quyen truy cap tai lieu noi bo.'], 403);
            }
        }

        if (! Storage::disk('local')->exists($attachment->file_path)) {
            return response()->json(['message' => 'File khong ton tai.'], 404);
        }

        return Storage::disk('local')->download($attachment->file_path, $attachment->file_name);
    }
}
