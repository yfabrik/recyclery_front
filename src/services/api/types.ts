interface pagination {
    page: number,
    total: number
}

interface APIResponse<T> {
    success: true,
    message: string,
    data: T,
    pagination?: pagination
}