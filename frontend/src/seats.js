export function rowsFromLast(lastRow) {
  const value = String(lastRow ?? "E").trim();
  if (/^\d+$/.test(value)) {
    const count = Math.min(26, Math.max(1, Number(value)));
    return Array.from({ length: count }, (_, index) => String.fromCharCode(65 + index));
  }

  const end = value.toUpperCase().charCodeAt(0);
  const start = "A".charCodeAt(0);
  if (end < start || end > "Z".charCodeAt(0)) return ["A", "B", "C", "D", "E"];
  return Array.from({ length: end - start + 1 }, (_, index) =>
    String.fromCharCode(start + index),
  );
}

export function columnsFromLast(lastColumn) {
  const count = Number(lastColumn);
  if (!Number.isFinite(count) || count < 1) return 10;
  return Math.min(30, Math.floor(count));
}

export function seatId(row, column) {
  return `${row}${column}`;
}

export function sortSeatIds(ids) {
  return [...ids].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}
