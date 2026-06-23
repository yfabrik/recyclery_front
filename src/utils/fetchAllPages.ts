import type { PaginationMeta } from "../services/api/pagination";

export type FetchAllPagesOptions<TItem, TResponse> = {
  fetchPage: (page: number) => Promise<TResponse>;
  getItems: (response: TResponse) => TItem[];
  getPagination: (response: TResponse) => PaginationMeta;
  maxPages?: number;
};

export const fetchAllPages = async <TItem, TResponse>({
  fetchPage,
  getItems,
  getPagination,
  maxPages = 200,
}: FetchAllPagesOptions<TItem, TResponse>): Promise<TItem[]> => {
  const allItems: TItem[] = [];

  for (let page = 1; page <= maxPages; page += 1) {
    const response = await fetchPage(page);
    allItems.push(...getItems(response));

    const pagination = getPagination(response);
    if (!pagination.hasNext || page >= pagination.totalPages) {
      break;
    }
  }

  return allItems;
};
