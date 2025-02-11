import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, catchError, map, throwError } from "rxjs";
import { apiRoutes } from "../const/backend-routes";
import { DialogService } from "./dialog.service";

@Injectable({
    providedIn: 'root'
})
export class BaseGridService {
    private baseUrl = apiRoutes.mainRoute;

    constructor(
        private http: HttpClient,
        private dialogService:DialogService,
        ) {

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
                return response;
              }),
            
            catchError((error) => {
                console.error('Error al obtener datos:', error);
                this.dialogService.showErrorMessage('Error al mostrar la data');
                return throwError(error);
            })
        );
    }

    getDataById<T>(endpoint:string, id:number):Observable<T>{

        return this.http.get<T>(`${this.baseUrl}${endpoint}/${id}`).pipe(
            map((response:T) => response),
            catchError((error) => {
                console.warn('Error al obtener dato: ', error);
                this.dialogService.showErrorMessage('Ha ocurrido un error al intentar obtener los datos...')
                return throwError(error);
            })
        )
    }

    updateDataComplete(url: string, payload: any): Observable<any> {
        return this.http.put(url, payload);
      }
      
      updateToothServiceIds(route:string, id: number, payload: any): Observable<any> {
        const url = `${route}/${id}/serviceIds`;
        return this.http.put(url, payload);
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

    pathData<T>(endpoint:string, id:number, body: Partial<T>): Observable<T> {

        return this.http.patch<T>(`${this.baseUrl}${endpoint}/${id}`, body).pipe(
            map((response:any) => response),
            catchError((error) => {
                console.error('Error al parchear la data: ', error);
                return throwError(error);
            })
        )
    }

    getDataByIds<T>(endpoint: string, ids: number[]): Observable<T[]> {
        return this.http.post<T[]>(`${this.baseUrl}${endpoint}/byIds`, { ids }).pipe(
            map((response) => response),
            catchError((error) => {
                console.error('Error al obtener datos por IDs:', error);
                this.dialogService.showErrorMessage('Error al obtener los datos por IDs.');
                return throwError(error);
            })
        );
    }
}

