import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, map, throwError } from "rxjs";
import { apiRoutes } from "../const/backend-routes";

@Injectable({
    providedIn: 'root'
})
export class BaseGridService {
    private baseUrl = apiRoutes.mainRoute;

    constructor(private http: HttpClient) {

    }

    getData<T>(endpoint: string, params: any = {}): Observable<T> {
        let queryParams = new HttpParams();
    
        if (params) {
            Object.keys(params).forEach((key: string) => {
                queryParams = queryParams.set(key, params[key]);
            });
        }
    
        return this.http.get<T>(`${this.baseUrl}${endpoint}/all`, { params: queryParams }).pipe(
            map((response) => {
                console.log('API Response:', response); 
                return response;
              }),
            
            catchError((error) => {
                console.error('Error al obtener datos:', error);
                return throwError(error);
            })
        );
    }
    

    getDataById<T>(endpoint:string, id:number):Observable<T>{

        return this.http.get<T>(`${this.baseUrl}${endpoint}/${id}`).pipe(
            map((response:T) => response),
            catchError((error) => {
                console.warn('Error al obtener dato: ', error);
                return throwError(error);
            })
        )
    }

    createData<T>(endpoint:string, data: T): Observable<T>{
        
        return this.http.post<T>(`${this.baseUrl}${endpoint}`, data).pipe(
           catchError((error) => {
            console.error('Error al crear el dato: ', error);
            return throwError(error);
           })
        );
    }

    updateData<T>(endpoint:string ,data:T, id:number): Observable<T>{

        return this.http.put<T>(`${this.baseUrl}${endpoint}/${id}`, data).pipe(
            catchError((error) => {
                console.error('Error al actualizar la data: ', error);
                return throwError(error);
            })
        );
    }

    deleteData<T>(endpoint:string, id:number): Observable<T>{
        
        return this.http.delete<T>(`${this.baseUrl}${endpoint}/${id}`).pipe(
            catchError((error) => {
                console.error('Error al borrar la data: ', error);
                return throwError(error);
            })
        )
    }
}

