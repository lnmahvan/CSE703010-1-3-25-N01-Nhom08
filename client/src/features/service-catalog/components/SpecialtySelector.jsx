import React from 'react';

const SpecialtySelector = ({ specialties, value = [], primaryId, onChange, onPrimaryChange }) => {
  const selectedSet = new Set(value);

  const toggle = (id) => {
    let next;
    if (selectedSet.has(id)) {
      next = value.filter((v) => v !== id);
      if (primaryId === id) onPrimaryChange('');
    } else {
      next = [...value, id];
    }
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="border rounded flex flex-col h-48">
          <div className="bg-gray-50 border-b px-2 py-1 text-[10px] font-medium text-gray-600">
            Danh sách chuyên môn
          </div>
          <div className="overflow-y-auto p-1 text-[12px] space-y-1">
            {specialties.length === 0 && (
              <div className="text-[11px] text-gray-400 p-2">Chưa có chuyên môn.</div>
            )}
            {specialties.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-1.5 p-1 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="rounded text-blue-600"
                  checked={selectedSet.has(s.id)}
                  onChange={() => toggle(s.id)}
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>
        <div className="border rounded flex flex-col h-48 bg-gray-50/50">
          <div className="bg-gray-50 border-b px-2 py-1 text-[10px] font-medium text-gray-600 flex justify-between">
            <span>Đã chọn ({value.length})</span>
            {value.length > 0 && (
              <span className="text-[10px] text-gray-500">★ = Chuyên môn chính</span>
            )}
          </div>
          <div className="overflow-y-auto p-1 text-[12px] space-y-1">
            {value.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[11px] text-gray-400 p-2">
                Chưa có chuyên môn nào
              </div>
            ) : (
              specialties
                .filter((s) => selectedSet.has(s.id))
                .map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-1 hover:bg-white rounded"
                  >
                    <span>{s.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onPrimaryChange(s.id)}
                        className={`text-[11px] px-1.5 py-0.5 rounded ${
                          primaryId === s.id
                            ? 'bg-amber-100 text-amber-700 border border-amber-200'
                            : 'border text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {primaryId === s.id ? '★ Chính' : 'Chọn chính'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggle(s.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialtySelector;
