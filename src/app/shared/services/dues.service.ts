import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Dues } from '../interfaces/dues.interface';
import { apiRoutes } from '../const/backend-routes';
import { BaseGridService } from './baseGrid.service';

@Injectable({
  providedIn: 'root'
})
export class DuesService {
  constructor(
    private baseGridService: BaseGridService
    ) 
    { }
  private url = apiRoutes.dues.main;

  getDues(): Observable<Dues[]> {
    return this.baseGridService.getData<Dues[]>(this.url);
  }

  getDueById(id: number): Observable<Dues> {
    return this.baseGridService.getDataById<Dues>(this.url,id);
  }

  createDue(formData: Dues) {
    return this.baseGridService.createData(this.url, formData);
  }

  updateDue(due: Dues, id: number) {
    return this.baseGridService.updateData(this.url, due, id);
  }

  deleteDue(id: number) {
    return this.baseGridService.deleteData(this.url, id)
  }

  patchDue(id: number, partialUpdate: Partial<Dues>) {
    return this.baseGridService.pathData(this.url, id, partialUpdate);
  }
}
