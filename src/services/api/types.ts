export interface Pagination  {
    page: number,
    total_pages: number
    total_items: number
    items_per_page: number
    has_next: boolean
    has_previous: boolean
    limit: number
    offset: number
    total: number
}

export interface APIResponse<T> {
    success: true,
    message: string,
    data: T,
    pagination?: Pagination
}