import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../interfaces/appointment.interface';
import { Patient } from '../interfaces/patient.interface';
import { BaseGridService } from './baseGrid.service';
import { apiRoutes } from '../const/backend-routes';


@Injectable({
  providedIn: 'root'
})
export class PatientsService {
  constructor(private httpClient: HttpClient, private baseGridService: BaseGridService) { }
  private baseUrl = apiRoutes.patient.main;

  getPatients() {
    return this.baseGridService.getData(this.baseUrl)
  }

  getPatientById(id: number) {
    return this.baseGridService.getDataById(this.baseUrl, id)
  }

  createPatient(formData: any) {
    return this.baseGridService.createData(this.baseUrl, formData)
  }

  updatePatient(patient: Patient, id: number) {
    return this.baseGridService.updateData(this.baseUrl, patient, id)
  }

  deletePatient(id: number) {
    return this.baseGridService.deleteData(this.baseUrl, id)

  }
}
