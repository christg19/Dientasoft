import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiRoutes } from '../const/backend-routes';
import { BaseGridService } from './baseGrid.service';
import { Patient } from '../interfaces/patient.interface';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  constructor(
    private baseGridService: BaseGridService
    ) 
    { }
  private url = apiRoutes.patient.main;

  getPatients(): Observable<Patient[]> {
    return this.baseGridService.getData<Patient[]>(this.url);
  }

  getPatientById(id: number): Observable<Patient> {
    return this.baseGridService.getDataById<Patient>(this.url,id);
  }

  createPatient(formData: Patient) {
    return this.baseGridService.createData(this.url, formData);
  }

  updatePatient(Patient: Patient, id: number) {
    return this.baseGridService.updateData(this.url, Patient, id);
  }

  deletePatient(id: number) {
    return this.baseGridService.deleteData(this.url, id)
  }

  patchPatient(id: number, partialUpdate: Partial<Patient>) {
    return this.baseGridService.pathData(this.url, id, partialUpdate);
  }
}
