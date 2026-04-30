<?php

namespace App\Services;

use App\Models\Service;
use App\Models\ServiceAttachment;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ServiceAttachmentService
{
    private const MAX_IMAGE_BYTES = 5 * 1024 * 1024;   // 5 MB
    private const MAX_DOCUMENT_BYTES = 15 * 1024 * 1024; // 15 MB

    private const ALLOWED_IMAGE_MIMES = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    ];

    private const ALLOWED_DOC_MIMES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
    ];

    public function __construct(private readonly AuditLogService $auditLog)
    {
    }

    public function upload(int $serviceId, UploadedFile $file, array $data, ?User $actor): ServiceAttachment
    {
        $service = Service::findOrFail($serviceId);

        $type = $data['attachment_type'] ?? (str_starts_with((string) $file->getMimeType(), 'image/') ? 'image' : 'document');
        $visibility = $data['visibility'] ?? ServiceAttachment::VISIBILITY_INTERNAL;

        $this->validateFile($file, $type);

        $path = $file->store("service-attachments/{$service->id}", 'local');

        $attachment = ServiceAttachment::create([
            'service_id' => $service->id,
            'attachment_type' => $type,
            'visibility' => $visibility,
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_mime' => $file->getMimeType(),
            'file_size' => $file->getSize(),
            'description' => $data['description'] ?? null,
            'uploaded_by' => $actor?->id,
        ]);

        if ($type === 'image' && empty($service->image_path) && $visibility === 'public') {
            $service->image_path = $path;
            $service->save();
        }

        $this->auditLog->log($actor, 'service_attachment.uploaded', [
            'service_id' => $service->id,
            'attachment_id' => $attachment->id,
            'type' => $type,
            'visibility' => $visibility,
            'file_name' => $attachment->file_name,
        ]);

        return $attachment;
    }

    public function delete(int $serviceId, int $attachmentId, ?User $actor): void
    {
        $attachment = ServiceAttachment::where('service_id', $serviceId)->findOrFail($attachmentId);

        if (Storage::disk('local')->exists($attachment->file_path)) {
            Storage::disk('local')->delete($attachment->file_path);
        }

        $this->auditLog->log($actor, 'service_attachment.deleted', [
            'service_id' => $serviceId,
            'attachment_id' => $attachmentId,
            'file_name' => $attachment->file_name,
        ]);

        $attachment->delete();
    }

    private function validateFile(UploadedFile $file, string $type): void
    {
        $mime = (string) $file->getMimeType();
        $size = $file->getSize();

        if ($type === 'image') {
            if (! in_array($mime, self::ALLOWED_IMAGE_MIMES, true)) {
                throw ValidationException::withMessages([
                    'file' => 'Hinh anh khong dung dinh dang JPG/PNG/WEBP/GIF (E7).',
                ]);
            }
            if ($size > self::MAX_IMAGE_BYTES) {
                throw ValidationException::withMessages([
                    'file' => 'Hinh anh vuot dung luong toi da 5MB (E7).',
                ]);
            }
        } else {
            if (! in_array($mime, self::ALLOWED_DOC_MIMES, true)) {
                throw ValidationException::withMessages([
                    'file' => 'Tai lieu khong dung dinh dang cho phep (PDF/DOC/DOCX/XLS/XLSX/TXT) (E7).',
                ]);
            }
            if ($size > self::MAX_DOCUMENT_BYTES) {
                throw ValidationException::withMessages([
                    'file' => 'Tai lieu vuot dung luong toi da 15MB (E7).',
                ]);
            }
        }
    }
}
