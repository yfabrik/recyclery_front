export type CsvColumn<T> = {
  header: string;
  key: keyof T | string;
  format?: (value: unknown, row: T) => unknown;
};

export const escapeCsvCell = (value: unknown): string => {
  if (value === null || value === undefined) return "";

  const text =
    value instanceof Date ? value.toISOString() : String(value);
  const escaped = text.replace(/"/g, "\"\"");
  const shouldQuote =
    /[",\n\r]/.test(text) || text.trim() !== text;

  return shouldQuote ? `"${escaped}"` : escaped;
};

export const rowsToCsv = <T>(
  rows: T[],
  columns: CsvColumn<T>[],
): string => {
  const headerRow = columns.map((column) => escapeCsvCell(column.header)).join(",");
  const dataRows = rows.map((row) =>
    columns
      .map((column) => {
        const rawValue = (row as Record<string, unknown>)[String(column.key)];
        const value = column.format ? column.format(rawValue, row) : rawValue;
        return escapeCsvCell(value);
      })
      .join(","),
  );

  return [headerRow, ...dataRows].join("\r\n");
};

export const downloadCsv = (filename: string, csvContent: string): void => {
  const blob = new Blob(["\uFEFF", csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
