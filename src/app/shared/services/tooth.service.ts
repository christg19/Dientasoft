import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Tooth } from "../interfaces/tooth.interface";
import { apiRoutes } from "../const/backend-routes";

@Injectable({
    providedIn: 'root'
})

export class ToothService {
    private baseUrl = `${apiRoutes.mainRoute}/${apiRoutes.odontogram.main}`;
    constructor(
        private httpClient: HttpClient
    ){ }

    getTeethByOdontogramId(id:number){
        return this.httpClient.get<Tooth[]>(`${this.baseUrl}/${id}`)
    }
}