import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiRoutes } from '../const/backend-routes';
import { BaseGridService } from './baseGrid.service';
import { Service } from '../interfaces/services.interface';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  constructor(
    private baseGridService: BaseGridService
    ) 
    { }
  private url = apiRoutes.services.main;

  getServices(): Observable<Service[]> {
    return this.baseGridService.getData<Service[]>(this.url);
  }

  getServiceById(id: number): Observable<Service> {
    return this.baseGridService.getDataById<Service>(this.url,id);
  }

  createService(formData: Service) {
    return this.baseGridService.createData(this.url, formData);
  }

  updateService(service: Service, id: number) {
    return this.baseGridService.updateData(this.url, service, id);
  }

  deleteService(id: number) {
    return this.baseGridService.deleteData(this.url, id)
  }

  patchService(id: number, partialUpdate: Partial<Service>) {
    return this.baseGridService.pathData(this.url, id, partialUpdate);
  }
}
