import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class OdontogramService {
  constructor(private httpClient: HttpClient) { }
  private url = 'http://localhost:3000/api/v1/odontogram';

  getOdontograms() {
    return this.httpClient.get(`http://localhost:3000/api/v1/odontogram/all`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  getOdontogram(id: number) {
    return this.httpClient.get(`${this.url}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  createOdontogram(formData: any) {
    return this.httpClient.post(`${this.url}`, formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  updateOdontogram(due: any, id: number) {
    return this.httpClient.put(`${this.url}/${id}`, due, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  deleteOdontogram(id: string) {
    return this.httpClient.delete(`${this.url}/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

}