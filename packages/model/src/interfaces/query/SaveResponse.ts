export interface SaveResponse<T> {
    error: number;
    detail: string;
    data: T;
};