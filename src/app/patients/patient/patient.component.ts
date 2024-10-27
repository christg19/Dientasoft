import { ChangeDetectorRef, Component } from '@angular/core';
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
  private patientId!: number;
  patientForm!: FormGroup;

  constructor(private fb: FormBuilder, private patientsService: PatientsService, private router: Router, private route: ActivatedRoute, private cdr:ChangeDetectorRef) {
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      age: [0, Validators.required],
      address: ['', [Validators.required]],
      tel: [''],
    });
  }

  ngOnInit() {
    this.getId();
    this.getPatientDetails(this.patientId)
  }

  getId() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.patientId = +id;
        this.getPatientDetails(this.patientId);
      }
    });
  }

  private getPatientDetails(id: number) {
    this.patientsService.getPatientById(id).subscribe({
      next: (patient: any) => {
        this.fillFormDetails(patient);
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  private fillFormDetails(patient: Patient) {
    this.patientForm.patchValue({
      name: patient.name || '',
      age: patient.age || 0,
      address: patient.address || '',
      tel: patient.tel || ''
    })
  }

  updatePatient(patient: Patient, id: number) {
    this.patientsService.updatePatient(patient, id).subscribe({
      next: () => {
        console.log('Updateado con exito');

      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  createPatient(patient: Patient) {
    this.patientsService.createPatient(patient).subscribe({
      next: (response: any) => {
        console.log('Paciente creado exitosamente:', response);
        this.router.navigate(['/patients']);
      },
      error: (error: any) => {
        console.error('Error al crear paciente:', error);
      }
    });
  }

  submitForm() {
    if (this.patientForm.valid) {
      const formValue = this.patientForm.value;

      if (this.patientId) {
        this.updatePatient(formValue, this.patientId)
        this.router.navigate(['/patients']);
      } else {
        this.createPatient(formValue);
      }

    }
  }
}
