import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../interfaces/appointment.interface';
import { Patient } from '../interfaces/patient.interface';
import { Dues } from '../interfaces/dues.interface';


@Injectable({
  providedIn: 'root'
})
export class DuesService {
  constructor(private httpClient: HttpClient) { }
  private url = 'http://localhost:3000/api/v1/dues';

  getDues() {
    return this.httpClient.get(`http://localhost:3000/api/v1/dues/getAll`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  getDueById(id: number) {
    return this.httpClient.get(`${this.url}/getDueById/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  createDue(formData: any) {
    return this.httpClient.post(`${this.url}/createDue`, formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  updateDue(due: Dues, id: number) {
    return this.httpClient.put(`${this.url}/updateDue/${id}`, due, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  deleteDue(id: string) {
    return this.httpClient.delete(`${this.url}/deleteDue/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  patchDue(id: number, partialUpdate: Partial<Dues>) {
    return this.httpClient.patch(`${this.url}/patchDue/${id}`, partialUpdate, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    });
  }
}
