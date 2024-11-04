import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class ToothService {
  constructor(private httpClient: HttpClient) { }
  private url = 'http://localhost:3000/api/v1/tooth';

  getTeeth() {
    return this.httpClient.get(`http://localhost:3000/api/v1/tooth/all`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  getTooth(id: number) {
    return this.httpClient.get(`${this.url}/tooth/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  createTooth(formData: any) {
    return this.httpClient.post(`${this.url}/tooth`, formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  updateTooth(due: any, id: number) {
    return this.httpClient.put(`${this.url}/tooth/${id}`, due, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  deleteTooth(id: string) {
    return this.httpClient.delete(`${this.url}/tooth/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

}