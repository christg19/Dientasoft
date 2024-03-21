import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from 'src/app/shared/interfaces/patient.interface';
import { PatientsService } from 'src/app/shared/services/patient.service';

@Component({
  selector: 'app-patient',
  templateUrl: './patient.component.html',
  styleUrls: ['./patient.component.scss']
})
export class PatientComponent {
  private patientId:string = '';
  patientForm!: FormGroup;

  constructor(private fb: FormBuilder, private patientsService: PatientsService, private router: Router, private route:ActivatedRoute) {
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      age: [0, Validators.required],
      address: ['', [Validators.required]],
      tel: ['', Validators.required],
    });
  }

  getId() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.patientId = id;
        this.getPatientDetails(this.patientId);
      }
    });
  }

  private getPatientDetails(id:string){
    this.patientsService.getPatientById(id).subscribe({
      next: (patient: any) => {
        this.fillFormDetails(patient);
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  private fillFormDetails(patient:Patient){
    this.patientForm.patchValue({
      name: patient.name || '',
      age: patient.age || 0,
      address: patient.address || '',
      tel: patient.tel || ''
    })
  }

  submitForm() {
    if (this.patientForm.valid) {
      const formValue = this.patientForm.value;

      this.patientsService.createPatient(formValue).subscribe({
        next: (response: any) => {
          console.log('Paciente creado exitosamente:', response);
          this.router.navigate(['/patients']);
        },
        error: (error: any) => {
          console.error('Error al crear paciente:', error);
        }
      });
    }


  }
}
