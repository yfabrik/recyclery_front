import type { PaginationMeta } from "./pagination";

export type Pagination = PaginationMeta;

export interface APIResponse<T> {
    success: true,
    message: string,
    data: T,
    pagination?: Pagination
}