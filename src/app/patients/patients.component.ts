import { AfterViewInit, ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { DataSource } from '@angular/cdk/collections';
import { PatientsService } from '../shared/services/patient.service';
import { Patient } from '../shared/interfaces/patient.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AppointmentService } from '../shared/services/appointment.service';
import { Appointment } from '../shared/interfaces/appointment.interface';
import { Observable, lastValueFrom } from 'rxjs';
import { ColumnDefinition } from '../base-grid-component/base-grid-component.component';
import { apiRoutes } from '../shared/const/backend-routes';


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
    { key: 'id', label: 'Historico Dental', icon: 'library_books' }
  ];

  //Nombre, Historico dental, Consultas pendientes, Antecedentes, Cita Programada

  redirectToClient = '/patients'
  redirectToServices = '/services'

  constructor(public dialog: MatDialog, private patientsService: PatientsService, private fb: FormBuilder, private router: Router, private paginators: MatPaginatorIntl, private patientService: PatientsService,
    private route: ActivatedRoute, private cdr: ChangeDetectorRef, private appointmentService: AppointmentService) {

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

  async getAppointmentsFromPatient(id: number): Promise<number> {
    try {
      const patient = await this.getPatient(id);

      if (patient && patient.appointments) {
        const futureAppointments = this.getAppointmentsForFuture(patient.appointments);
        return futureAppointments.length;
      } else {
        return 0;
      }
    } catch (error) {
      console.error('Error al obtener el paciente:', error);
      return 0;
    }
  }


  async getPatient(id: number): Promise<Patient> {
    try {
      return await lastValueFrom(this.patientService.getPatientById(id) as Observable<Patient>);
    } catch (error) {
      console.error('Error al intentar obtener el paciente:', error);
      throw new Error('Error al obtener el paciente. Intenta nuevamente.');
    }
  }

  async getAllPatients() {
    try {
      const patients = await lastValueFrom(this.patientService.getPatients()) as Patient[];

      const patientsWithAppointments = await Promise.all(
        patients.map(async patient => {

          const pendingCount = patient.id !== undefined
            ? await this.getAppointmentsFromPatient(patient.id)
            : 0;
          return { ...patient, pendingAppointments: pendingCount };
        })
      );

      this.patientList = patientsWithAppointments;

    } catch (error) {
      console.error('Error al obtener los pacientes:', error);
    }
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
      },
      error: (error: any) => {
        console.error('Error al crear paciente:', error);
      }
    });
  }

  openModal(templateRef: TemplateRef<any>) {
    this.dialogRef = this.dialog.open(templateRef, { width: '400px', height: '500px' });
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

  applyFilter(event:Event){

  }

}
