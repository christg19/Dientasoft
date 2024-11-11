import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../interfaces/appointment.interface';
import { BaseGridService } from './baseGrid.service';
import { apiRoutes } from '../const/backend-routes';


@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  constructor(private httpClient: HttpClient, private endpointService: BaseGridService) { }
  private baseUrl = apiRoutes.appointment.main;

  getAppointments() {
    return this.endpointService.getData(this.baseUrl);
  }

  getAppointmentById(id: number) {
    return this.endpointService.getDataById(this.baseUrl, id);
  }

  createAppointment(formData: Appointment) {
    return this.endpointService.createData(this.baseUrl, formData)
  }

  deleteAppointment(id: number) {
    return this.endpointService.deleteData(this.baseUrl, id)
  }

  updateAppointment(appointment: Appointment, id: number) {
    return this.endpointService.updateData(this.baseUrl, appointment, id);
  }
}
