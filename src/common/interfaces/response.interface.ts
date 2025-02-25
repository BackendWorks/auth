export interface IApiBaseResponse {
    statusCode: number;
    timestamp: string;
    message: string;
}

export interface IApiResponse<T> extends IApiBaseResponse {
    data: T;
}

export interface IPaginatedData<T> {
    page: number;
    limit: number;
    total: number;
    data: T[];
}

export interface IApiPaginatedResponse<T> extends IApiBaseResponse {
    data: IPaginatedData<T>;
}
