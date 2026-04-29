// Build a list of 7 dates for the ISO week containing `anchor` (Mon-Sun).
export const startOfIsoWeek = (anchor) => {
  const d = new Date(anchor);
  const day = d.getDay(); // 0 = Sun
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const endOfIsoWeek = (anchor) => {
  const start = startOfIsoWeek(anchor);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const buildWeekDays = (anchor) => {
  const start = startOfIsoWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

export const toYmd = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const fmtVnDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('vi-VN');
};

export const fmtVnDateTime = (value) => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('vi-VN');
};

export const trimTime = (value) => {
  if (!value) return '';
  return String(value).slice(0, 5); // 07:00:00 -> 07:00
};

export const computeIsoWeekNumber = (date) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
};

export const diffHours = (start, end) => {
  if (!start || !end) return 0;
  const s = String(start).split(':').map(Number);
  const e = String(end).split(':').map(Number);
  const startMin = s[0] * 60 + (s[1] || 0);
  const endMin = e[0] * 60 + (e[1] || 0);
  return Math.max(0, (endMin - startMin) / 60);
};

export const groupSchedulesByStaffAndDate = (schedules, days) => {
  const dayKeys = days.map(toYmd);
  const map = new Map();
  schedules.forEach((s) => {
    const staffId = s.staff?.id ?? s.staff_id;
    if (!map.has(staffId)) {
      map.set(staffId, {
        staff: s.staff || { id: staffId, full_name: '?' },
        cells: Object.fromEntries(dayKeys.map((k) => [k, []])),
      });
    }
    const entry = map.get(staffId);
    const key = toYmd(s.work_date);
    if (!entry.cells[key]) entry.cells[key] = [];
    entry.cells[key].push(s);
  });
  return Array.from(map.values());
};
