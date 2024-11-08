import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Service } from '../interfaces/services.interface';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  constructor(private httpClient: HttpClient) { }
  private url = 'http://localhost:3000/api/v1/service';

  getServices() {
    return this.httpClient.get(`${this.url}/getAllServices`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  getServiceById(id: number) {
    return this.httpClient.get(`${this.url}/getOneService/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  createService(formData: any) {
    return this.httpClient.post(`${this.url}/createService`, formData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  updateService(service: Service, id: number) {
    return this.httpClient.put(`${this.url}/updateService/${id}`, service, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  deleteService(id: string) {
    return this.httpClient.delete(`${this.url}/deleteService/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }
}
