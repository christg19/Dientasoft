export interface IApiRows<T> {
    result: IApiRow<T>[];
}

export interface IApiRow<T> {
    data: T;
}

export interface IApiResponse<T> {
    result:T;
}