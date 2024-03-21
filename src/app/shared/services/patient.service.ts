import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../interfaces/appointment.interface';
import { Patient } from '../interfaces/patient.interface';


@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  constructor(private httpClient: HttpClient) { }
  private url = 'http://localhost:3000/api/v1';

  getPatients() {
    return this.httpClient.get(`${this.url}/clients/getPatients/1/10`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  getPatientById(id: string) {
    return this.httpClient.get(`${this.url}/clients/getPatientById/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  createPatient(formData: any) {
    return this.httpClient.post(`${this.url}/clients/createPatient`, formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  updatePatient(patient: Patient, id: string) {
    return this.httpClient.put(`${this.url}/clients/updatePatient/${id}`, patient, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  deletePatient(id: string) {
    return this.httpClient.delete(`${this.url}/clients/deletePatient/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }
}
