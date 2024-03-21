import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PatientsService } from '../shared/services/patient.service';
import { Patient } from '../shared/interfaces/patient.interface';
import { AppointmentService } from '../shared/services/appointment.service';


@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  public patient!: Patient;
  public patientAppointmentPendient = [];
  public patientAppointment = [];
  private patientId: string = "";
  dialogRef!: MatDialogRef<any>;
  displayedColumns: string[] = ['hour', 'procedure', 'cost'];
  displayedHistoricColums: string[] = ['hour', 'procedure', 'cost'];
  dataSource = new MatTableDataSource<any>(this.patientAppointmentPendient);
  dataSourceHistoric = new MatTableDataSource<any>(this.patientAppointment)
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(public dialog: MatDialog, private route: ActivatedRoute,
    private patientsService: PatientsService,
    private appointmentsService: AppointmentService) { }

  ngOnInit() {
    this.getId();
    this.getPatientById(this.patientId);
    if (this.patient) {
      this.getPatientPendingAppointments();
      this.getAllPatientApppointments();
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getId() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.patientId = id;
      }
    });
  }

  getPatientById(id: string) {
    this.patientsService.getPatientById(id).subscribe({
      next: (patient: any) => {
        this.patient = patient;
        this.getPatientPendingAppointments();
        this.getAllPatientApppointments();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  getPatientPendingAppointments() {
    const now = new Date();
    this.appointmentsService.getAppointments().subscribe({
      next: (appointmentList: any) => {
        this.patientAppointmentPendient = appointmentList.filter((appointment: any) => {
          return appointment.patientId === this.patient.id && new Date(appointment.appointmentDate) > now;
        });
        this.dataSource.data = this.patientAppointmentPendient;
  

      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  getAllPatientApppointments(){
    this.appointmentsService.getAppointments().subscribe({
      next:(appointmentList:any) => {
        this.patientAppointment = appointmentList.filter((appointment: any) => {
          return appointment.patiendId = this.patientId;
        });
        this.dataSourceHistoric.data = this.patientAppointment;
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  formatDate(date: string) {
    const newDate = new Date(date);
    const day = newDate.getDate();

    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const month = months[newDate.getMonth()];

    return `${day} de ${month}`;
  }


  openModal(templateRef: any) {
    this.dialogRef = this.dialog.open(templateRef, {
      width: '80%',
      height: 'auto',
    });
  }

  closeModal() {
    this.dialogRef.close();
  }


}
