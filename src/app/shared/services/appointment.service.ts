import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiRoutes } from '../const/backend-routes';
import { BaseGridService } from './baseGrid.service';
import { Appointment } from '../interfaces/appointment.interface';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  constructor(
    private baseGridService: BaseGridService
    ) 
    { }
  private url = apiRoutes.appointment.main;

  getAppointments(): Observable<Appointment[]> {
    return this.baseGridService.getData<Appointment[]>(this.url);
  }

  getAppointmentById(id: number): Observable<Appointment> {
    return this.baseGridService.getDataById<Appointment>(this.url,id);
  }

  createAppointment(formData: Appointment) {
    return this.baseGridService.createData(this.url, formData);
  }

  updateAppointment(Appointment: Appointment, id: number) {
    return this.baseGridService.updateData(this.url, Appointment, id);
  }

  deleteAppointment(id: number) {
    return this.baseGridService.deleteData(this.url, id)
  }

  patchAppointment(id: number, partialUpdate: Partial<Appointment>) {
    return this.baseGridService.pathData(this.url, id, partialUpdate);
  }
}
