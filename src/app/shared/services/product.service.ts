import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../interfaces/appointment.interface';
import { Instrument } from '../interfaces/instrument.interface';
import { apiRoutes } from '../const/backend-routes';
import { BaseGridService } from './baseGrid.service';
import { Product } from '../interfaces/product.interface';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  constructor(private httpClient: HttpClient, private endpointService:BaseGridService) { }
  private baseUrl = apiRoutes.product.main;

  getProducts(): Observable<Product[]> {
  return this.endpointService.getData<Product[]>(this.baseUrl);
  }

  getProductById(id:number): Observable<Product> {
  return this.endpointService.getDataById<Product>(this.baseUrl, id)
  }

  createProduct(formData: any): Observable<Product> {
   return this.endpointService.createData<Product>(this.baseUrl, formData)
  }

  updateProduct(product: Product, id: number): Observable<Product> {
   return this.endpointService.updateData<Product>(this.baseUrl, product, id);
  }

  deleteProduct(id: number): Observable<Product> {
   return this.endpointService.deleteData<Product>(this.baseUrl, id)
  }

  patchProduct(id: number, partialUpdate: Partial<Product>) {
    return this.httpClient.patch(`${this.baseUrl}/${id}`, partialUpdate);
  }
}
