export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const DEFAULT_PER_PAGE = 50;

export const muiPageCount = (meta: PaginationMeta): number =>
  Math.max(1, meta.totalPages || Math.ceil(meta.total / Math.max(1, meta.perPage)));

export const pageToOffset = (
  page: number,
  perPage: number,
): { limit: number; offset: number } => ({
  limit: perPage,
  offset: Math.max(0, (Math.max(1, page) - 1) * perPage),
});

export const offsetToPage = (offset: number, limit: number): number => {
  if (!Number.isFinite(limit) || limit <= 0) return 1;
  return Math.floor(Math.max(0, offset) / limit) + 1;
};
