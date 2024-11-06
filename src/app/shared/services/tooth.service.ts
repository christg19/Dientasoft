import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ToothService {
  constructor(private httpClient: HttpClient) { }
  private url = 'http://localhost:3000/api/v1/tooth';

  getTeeth() {
    return this.httpClient.get(`${this.url}/all`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  getTooth(id: number) {
    return this.httpClient.get(`${this.url}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  createTooth(formData: any) {
    return this.httpClient.post(`${this.url}`, formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  updateTooth(tooth: any, id: number) {
    return this.httpClient.put(`${this.url}/${id}`, tooth, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  deleteTooth(id: string) {
    return this.httpClient.delete(`${this.url}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

}