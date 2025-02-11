import { AfterViewInit, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../shared/services/patient.service';
import { Patient } from '../shared/interfaces/patient.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppointmentService } from '../shared/services/appointment.service';
import { Appointment } from '../shared/interfaces/appointment.interface';
import { Observable, firstValueFrom, map, catchError, of } from 'rxjs';
import { ColumnDefinition } from '../base-grid-component/base-grid-component.component';
import { apiRoutes } from '../shared/const/backend-routes';
import { RefreshService } from '../shared/services/refresh.service';


@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss']
})
export class PatientsComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;

  public dialogRef!: MatDialogRef<any>;
  public patientList: Patient[] = [];
  public patientForm!: FormGroup;
  public allAppointmentPatient = [];
  public loading: Boolean = false;
  public patientRoute = apiRoutes.patient.main;


  public columnDefs: ColumnDefinition[] = [
    { key: 'name', label: 'Nombre', dataType: 'string' },
    { key: 'dentalRecord', label: 'Antecedentes', icon: 'medical_services'},
    { key: 'id', label: 'Historico Dental', icon: 'library_books' },
    
  ];

  //Nombre, Historico dental, Consultas pendientes, Antecedentes, Cita Programada

  public redirectToClient = '/patients'
  public redirectToServices = '/services'

  constructor(
    public dialog: MatDialog,
    private patientsService: PatientService,
    private fb: FormBuilder,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private refreshService: RefreshService
  ) {
    this.patientForm = this.fb.group({
      name: ['', Validators.required],
      age: [, Validators.required],
      address: ['', [Validators.required]],
      tel: [''],
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.getAllPatients();
    setTimeout(() => {
      this.loading = false;
    }, 200);

  }

  ngAfterViewInit() {

  }

  getAppointmentsForFuture(appointments: Appointment[]): Appointment[] {
    const today = new Date();
    const offset = -4 * 60;
    const todayUTC4 = new Date(today.getTime() + offset * 60 * 1000);

    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);

      if (appointmentDate.getDate() === todayUTC4.getDate()) {
        return appointmentDate.getHours() > todayUTC4.getHours();
      } else {
        return appointmentDate.getDate() > todayUTC4.getDate();
      }
    });
  }

  getPatient(id: number): Observable<Patient> {
    return this.patientsService.getPatientById(id);
  }

  getAppointmentsFromPatient(id: number): Observable<number> {
    return this.getPatient(id).pipe(
      map(patient => {
        if (patient && patient.appointments) {
          const futureAppointments = this.getAppointmentsForFuture(patient.appointments);
          return futureAppointments.length;
        }
        return 0;
      }),
      catchError(error => {
        console.error('Error al obtener el paciente:', error);
        return of(0);
      })
    );
  }

  getAllPatients() {
    this.patientsService.getPatients().subscribe({
      next: (patients) => {
        Promise.all(
          patients.map(async patient => {
            const pendingCount = patient.id !== undefined
              ? await this.getAppointmentsFromPatient(patient.id).toPromise()
              : 0;
            return { ...patient, pendingAppointments: pendingCount };
          })
        ).then(updatedPatients => {
          this.patientList = updatedPatients;
        });
      },
      error: (error) => {
        console.error('Error al obtener los pacientes:', error);
      }
    });
  }
  

  redirect(url: string) {
    this.router.navigate([url])
  }

  createPatient(patient: Patient) {
    this.patientsService.createPatient(patient).subscribe({
      next: (response: any) => {
        console.log('Paciente creado exitosamente:', response);
        this.closeModal();
        this.getAllPatients();
        this.refreshService.triggerRefresh();
      },
      error: (error: any) => {
        console.error('Error al crear paciente:', error);
      }
    });
  }

  openModal(templateRef: TemplateRef<any>) {
    this.dialogRef = this.dialog.open(templateRef, { width: '800px', height: '600px' });
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  closeModal() {
    this.dialogRef.close();
  }

  submitForm() {
    if (this.patientForm.valid) {
      const formValue = this.patientForm.value;
      this.createPatient(formValue);
    }
  }

  applyFilter(event: Event) {

  }

}
