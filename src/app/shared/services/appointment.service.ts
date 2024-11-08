import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../interfaces/appointment.interface';


@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  constructor(private httpClient: HttpClient) { }
  private url = 'http://localhost:3000/api/v1/patient-appointments';

  getAppointments() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJjZ296dW5hQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTY5NzA3ODQ3NSwiZXhwIjoxNjk3MTY0ODc1fQ.kQC5x_3O0RwVkLqCrnu4iakN61iXGrJ8AyLUOQ43mKY'
      })
    };

    return this.httpClient.get(`${this.url}/getAllAppointments/1/10`, httpOptions);
  }

  getAppointmentById(id: string) {
    return this.httpClient.get(`${this.url}/getAppointmentById/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  createAppointment(formData: Appointment) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJjZ296dW5hQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTY5NzA3ODQ3NSwiZXhwIjoxNjk3MTY0ODc1fQ.kQC5x_3O0RwVkLqCrnu4iakN61iXGrJ8AyLUOQ43mKY'
      })
    };

    return this.httpClient.post('http://localhost:3000/api/v1/patient-appointments/createAppointment', formData, httpOptions);
  }

  deleteAppointment(id: string) {
    return this.httpClient.delete(`${this.url}/deleteAppointment/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  updateAppointment(appointment: Appointment, id: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJjZ296dW5hQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTY5NzA3ODQ3NSwiZXhwIjoxNjk3MTY0ODc1fQ.kQC5x_3O0RwVkLqCrnu4iakN61iXGrJ8AyLUOQ43mKY'
      })
    };

    return this.httpClient.put(`${this.url}/updateAppointment/${id}`
      , appointment)

  }
}
