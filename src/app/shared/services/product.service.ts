import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../interfaces/appointment.interface';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private httpClient: HttpClient) { }
  private url = 'http://localhost:3000/api/v1/product';

  getProducts() {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJjZ296dW5hQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTY5NzA3ODQ3NSwiZXhwIjoxNjk3MTY0ODc1fQ.kQC5x_3O0RwVkLqCrnu4iakN61iXGrJ8AyLUOQ43mKY'
      })
    };
  
    return this.httpClient.get(`${this.url}/getProducts`, httpOptions);
  }

  getProductById(id: string) {
    return this.httpClient.get(`${this.url}/getProductById/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
  }

  createProduct(formData: any) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJjZ296dW5hQGdtYWlsLmNvbSIsInJvbGVzIjpbImFkbWluIl0sImlhdCI6MTY5NzA3ODQ3NSwiZXhwIjoxNjk3MTY0ODc1fQ.kQC5x_3O0RwVkLqCrnu4iakN61iXGrJ8AyLUOQ43mKY'
      })
    };

    // Envía los datos del formulario como el cuerpo de la solicitud
    return this.httpClient.post(`${this.url}/createProduct/`, formData, httpOptions);
  }
}
