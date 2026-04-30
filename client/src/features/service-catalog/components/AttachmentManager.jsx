import React, { useRef, useState } from 'react';
import { ATTACHMENT_TYPE_LABELS } from '../constants';
import { formatBytes, formatDateTime } from '../utils';

const AttachmentManager = ({ attachments, onUpload, onDelete, uploading, canManage }) => {
  const fileRef = useRef(null);
  const [meta, setMeta] = useState({
    attachment_type: 'image',
    visibility: 'public',
    description: '',
  });
  const [error, setError] = useState('');

  const handleSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      await onUpload(file, meta);
      e.target.value = '';
    } catch (err) {
      setError(err?.response?.data?.message || 'Tải lên thất bại');
    }
  };

  return (
    <div className="space-y-3 text-xs">
      {canManage && (
        <div className="border rounded p-3 bg-gray-50/50 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">Loại</label>
            <select
              value={meta.attachment_type}
              onChange={(e) => setMeta((m) => ({ ...m, attachment_type: e.target.value }))}
              className="w-full border rounded px-2 py-1.5 bg-white"
            >
              <option value="image">Hình ảnh</option>
              <option value="document">Tài liệu</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">Phạm vi</label>
            <select
              value={meta.visibility}
              onChange={(e) => setMeta((m) => ({ ...m, visibility: e.target.value }))}
              className="w-full border rounded px-2 py-1.5 bg-white"
            >
              <option value="public">Công khai</option>
              <option value="internal">Nội bộ</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
            >
              {uploading ? 'Đang tải...' : '+ Chọn tệp'}
            </button>
            <input
              ref={fileRef}
              type="file"
              hidden
              onChange={handleSelect}
            />
          </div>
          <div className="sm:col-span-3">
            <label className="text-[11px] text-gray-500 block mb-1">Mô tả</label>
            <input
              type="text"
              value={meta.description}
              onChange={(e) => setMeta((m) => ({ ...m, description: e.target.value }))}
              className="w-full border rounded px-2 py-1.5 bg-white"
            />
          </div>
          {error && (
            <div className="sm:col-span-3 text-red-600 text-[11px]">{error}</div>
          )}
        </div>
      )}

      {attachments.length === 0 ? (
        <div className="text-gray-400 text-[12px] p-2 text-center">Chưa có tệp đính kèm.</div>
      ) : (
        <ul className="space-y-2">
          {attachments.map((a) => (
            <li
              key={a.id}
              className="border rounded p-2 flex items-start gap-3 bg-white"
            >
              <div className="text-xl">{a.attachment_type === 'image' ? '🖼' : '📄'}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 truncate">{a.file_name}</div>
                <div className="text-[11px] text-gray-500 flex flex-wrap gap-2">
                  <span>{ATTACHMENT_TYPE_LABELS[a.attachment_type]}</span>
                  <span>·</span>
                  <span>{a.visibility === 'public' ? 'Công khai' : 'Nội bộ'}</span>
                  <span>·</span>
                  <span>{formatBytes(a.file_size)}</span>
                  <span>·</span>
                  <span>{formatDateTime(a.created_at)}</span>
                </div>
                {a.description && (
                  <div className="text-[11px] text-gray-600 mt-0.5">{a.description}</div>
                )}
              </div>
              {canManage && (
                <button
                  type="button"
                  onClick={() => onDelete(a.id)}
                  className="text-red-500 text-[12px] hover:underline"
                >
                  Xoá
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttachmentManager;
