import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientsService } from '../shared/services/patient.service';
import { Patient } from '../shared/interfaces/patient.interface';
import { AppointmentService } from '../shared/services/appointment.service';


@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  public hoveredTooth: string | null = null;

  public patient!: Patient;
  public patientAppointmentPendient = [];
  public patientAppointment = [];
  public patientId!: number;
  public toothList: any[] = [];

  @Input() toothId!: number;

  dialogRef!: MatDialogRef<any>;
  displayedColumns: string[] = ['tooth', 'position', 'procedure', 'status'];
  teethColums: string[] = ['name', 'procedure', 'pendingProcedure']
  displayedHistoricColums: string[] = ['hour', 'procedure', 'cost'];
  dataSource = new MatTableDataSource<any>(this.patientAppointmentPendient);
  dataSourceHistoric = new MatTableDataSource<any>(this.patientAppointment)
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('modalContent1') modalContent1!: TemplateRef<any>;
  @ViewChild('modalContent2') modalContent2!: TemplateRef<any>;
  @ViewChild('modalContent3') modalContent3!: TemplateRef<any>;
  public headerItems: { title: string, subTitle: string, modalContent: any }[] = [];

  testData = [
    { tooth: 'Incisivo Central', position: 1, procedure: 'Aplicación de Flúor', status: 'Finalizado' },
    { tooth: 'Canino', position: 3, procedure: 'Limpieza', status: 'Finalizado' },
    { tooth: 'Canino', position: 2, procedure: 'Limpieza', status: 'Finalizado' },
    { tooth: 'Canino', position: 6, procedure: 'Limpieza', status: 'Finalizado' },

  ]


  constructor(public dialog: MatDialog, private route: ActivatedRoute,
    private patientsService: PatientsService,
    private appointmentsService: AppointmentService,
    private router: Router,
    private paginators: MatPaginatorIntl) {
    this.paginators.itemsPerPageLabel = "Registros por página";
    this.paginators.nextPageLabel = "Siguiente página";
    this.paginators.previousPageLabel = "Página anterior";
    this.paginators.lastPageLabel = "Ultima página";
    this.paginators.firstPageLabel = "Primera página";

    this.paginators.getRangeLabel = (page, pageSize, length) => {
      return this.spanishRangeLabel(page, pageSize, length);
    };
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.testData);
    console.log(this.dataSource.data)
    this.headerItems = [
      { title: 'Historico de', subTitle: 'visitas', modalContent: this.modalContent1 },
      { title: 'Historial de', subTitle: 'pago', modalContent: this.modalContent2 },
      { title: 'Plan de', subTitle: 'tratamiento', modalContent: this.modalContent3 }
    ];


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

  spanishRangeLabel(page: number, pageSize: number, length: number): string {
    if (length == 0 || pageSize == 0) {
      return `0 de ${length}`;
    }
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} - ${endIndex} de ${length}`;
  }

  getId() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.patientId = +id;
      }
    });
  }

  getPatientById(id: number) {
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

  getToothInfo() {

  }

  applyFilter(event: any) {
    let filterResult!: any;
    if (typeof event === 'number') {
      filterResult = this.toothList.filter((propertie) =>
        propertie.position.includes(event)
      );
    } else {
      const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
      filterResult = this.toothList.filter((propertie) => 
      propertie.procedure.some((proc: string) => proc.toLowerCase().includes(filterValue))
    );    
    }

    this.dataSource.data = filterResult;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
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

  getAllPatientApppointments() {
    this.appointmentsService.getAppointments().subscribe({
      next: (appointmentList: any) => {
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


  openModal(templateRef: TemplateRef<any>) {
    this.dialog.open(templateRef);
  }

  closeModal() {
    this.dialogRef.close();
  }


}
