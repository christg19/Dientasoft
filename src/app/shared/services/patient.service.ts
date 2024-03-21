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

  getPatients() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJjZ296dW5hQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTY5NzA3ODQ3NSwiZXhwIjoxNjk3MTY0ODc1fQ.kQC5x_3O0RwVkLqCrnu4iakN61iXGrJ8AyLUOQ43mKY'
      })
    };
  
    return this.httpClient.get('http://localhost:3000/api/v1/clients/getPatients/1/10', httpOptions);
  }

  getPatientById(id:string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJjZ296dW5hQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTY5NzA3ODQ3NSwiZXhwIjoxNjk3MTY0ODc1fQ.kQC5x_3O0RwVkLqCrnu4iakN61iXGrJ8AyLUOQ43mKY'
      })
    };
  
    return this.httpClient.get(`http://localhost:3000/api/v1/clients/getPatientById/${id}`, httpOptions);
  }

  createPatient(formData:any){
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJjZ296dW5hQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTY5NzA3ODQ3NSwiZXhwIjoxNjk3MTY0ODc1fQ.kQC5x_3O0RwVkLqCrnu4iakN61iXGrJ8AyLUOQ43mKY'
      })
    };
  
    return this.httpClient.post('http://localhost:3000/api/v1/clients/createPatient', formData);
  }

  updatePatient(patient:Patient, id:string){
    return this.httpClient.put(`http://localhost:3000/api/v1/clients/updatePatient/${id}`, patient, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
  }
}
