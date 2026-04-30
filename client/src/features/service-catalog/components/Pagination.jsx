import React from 'react';

const Pagination = ({ page, lastPage, total, perPage, onChangePage, onChangePerPage }) => {
  const start = (page - 1) * perPage + 1;
  const end = Math.min(page * perPage, total);
  const pages = [];
  const maxBtns = 5;
  const begin = Math.max(1, page - Math.floor(maxBtns / 2));
  const finish = Math.min(lastPage, begin + maxBtns - 1);
  for (let i = begin; i <= finish; i += 1) pages.push(i);

  return (
    <div className="p-2 border-t flex justify-between items-center text-gray-500 bg-white rounded-b-lg text-xs">
      <span>
        {total > 0 ? `Hiển thị ${start} - ${end} trong tổng số ${total}` : 'Không có dữ liệu'}
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page <= 1}
          onClick={() => onChangePage(page - 1)}
          className="w-7 h-7 border rounded hover:bg-gray-50 flex items-center justify-center disabled:opacity-50"
        >
          &lt;
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChangePage(p)}
            className={`w-7 h-7 border rounded ${
              p === page ? 'border-blue-500 bg-blue-50 text-blue-600' : 'hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          disabled={page >= lastPage}
          onClick={() => onChangePage(page + 1)}
          className="w-7 h-7 border rounded hover:bg-gray-50 flex items-center justify-center disabled:opacity-50"
        >
          &gt;
        </button>
        <select
          value={perPage}
          onChange={(e) => onChangePerPage(Number(e.target.value))}
          className="ml-2 border rounded py-1 px-1 focus:outline-none"
        >
          <option value={10}>10 / trang</option>
          <option value={20}>20 / trang</option>
          <option value={50}>50 / trang</option>
        </select>
      </div>
    </div>
  );
};

export default Pagination;
