import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Patient } from '../shared/interfaces/patient.interface';
import { Odontogram } from '../shared/interfaces/odontogram.interface';
import { Tooth } from '../shared/interfaces/tooth.interface';
import { Service } from '../shared/interfaces/services.interface';
import Swal from 'sweetalert2';
import { ToothNames, ToothStatus } from '../shared/const/enums/tooth.enum';
import { ToothSVGComponent } from '../shared/components/tooth-svg/tooth-svg.component';
import { RefreshService } from '../shared/services/refresh.service';
import { apiRoutes } from '../shared/const/backend-routes';
import { ColumnDefinition } from '../base-grid-component/base-grid-component.component';
import { BaseGridService } from '../shared/services/baseGrid.service';


@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(ToothSVGComponent) toothSVGComponent!: ToothSVGComponent;
  @ViewChild('modalContent1') modalContent1!: TemplateRef<any>;
  @ViewChild('modalContent2') modalContent2!: TemplateRef<any>;
  @ViewChild('modalContent3') modalContent3!: TemplateRef<any>;

  @Input() toothId!: number;

  public columnDefs: ColumnDefinition[] = [
    {key: 'toothPosition', label: 'Posición', dataType: 'number'},
    {key: 'toothName', label: 'Diente', dataType: 'number', enum: 'toothName'}
  ];

  public statusOptions: any[] = [
    { label: 'Tratamiento preventivo', value: 0 },
    { label: 'Enfermedad Corto Plazo', value: 1 },
    { label: 'Enfermedad Largo Plazo', value: 2 },
    { label: 'Extracción y Protesis', value: 3 },
    { label: 'Reservado', value: 4 }
  ]

  public headerItems: { title: string, subTitle: string, modalContent: any }[] = [];
  filterOptions = [
    { value: 0, viewValue: 'Filtrar por Odontograma' },
    { value: 1, viewValue: 'Cambiar Estados' },
  ];

  public toothRoute = apiRoutes.tooth.main;
  public patientRoute = apiRoutes.patient.main;
  public appointmentRoute = apiRoutes.appointment.main;
  public odontogramRoute = apiRoutes.odontogram.main;
  public servicesRoute = apiRoutes.services.main;


  public hoveredTooth: string | null = null;
  public toothOff = false
  public toothName!:string;
  public toothList: Tooth[] = [];

  public statusMode = false;
  public patientAppointment = [];
  public changingStatus = false;

  public patientId!: number;
  public patient!: Patient;
  private patientOdontogram!: Odontogram

  public selectedFilter: string = '';
  public selectedStatus!:number;

  private servicesList: Service[] = [];
  public dialogRef!: MatDialogRef<any>;
  public displayedColumns: string[] = ['toothName','toothPosition', 'serviceIds', 'status'];
  public dataSource = new MatTableDataSource<any>();

  constructor(
    public dialog: MatDialog, 
    private route: ActivatedRoute,
    private refreshService: RefreshService,
    private baseGridService: BaseGridService,
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
    this.getId();
    this.getAllServices();
    
    this.headerItems = [
      { title: 'Historico de', subTitle: 'visitas', modalContent: this.modalContent1 },
      { title: 'Historial de', subTitle: 'pago', modalContent: this.modalContent2 },
      { title: 'Plan de', subTitle: 'tratamiento', modalContent: this.modalContent3 }
    ];
    this.dataSource.filterPredicate = (data: Tooth, filter: string) => {
      const filterLower = filter.trim().toLowerCase();
      
      const procedureNames = this.getAppointmentService(data.serviceIds).toLowerCase();
      
      const toothPos = data.toothPosition.toString();
      
      return toothPos.includes(filterLower) || procedureNames.includes(filterLower);
    };
  }

  seeStatus(){
    console.log(this.selectedStatus)
  }

  clearOdontogram() {
  
    if (this.toothSVGComponent) {
      this.toothSVGComponent.clearAllSelectedTeeth();
      this.statusMode = false;
    }
  
    this.dataSource.filter = '';
  
    this.selectedFilter = ''; 
  }
  
  applyColors(){
    if(this.toothSVGComponent){
      this.toothSVGComponent.applyTestToothColors();
    }
  }
  
  getTooth(id:number){
    this.baseGridService.getDataById(this.toothRoute,id).subscribe({
      next: (data:any) => {
        return data;
      },
      error: (error) => {
        throw error;
      }
    })
  }

  updateTooth(id: number, position: number, status: number) {
    Swal.fire({
      title: `Actualizar Estado`,
      text: `¿Estás seguro de actualizar el estado del ${ToothNames[position]} a ${ToothStatus[status]}?`,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: "Actualizar",
      denyButtonText: `Cancelar`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.baseGridService.getDataById(this.toothRoute,id).subscribe({
          next: (tooth: any) => {
      
            const updatedTooth: Tooth = { toothPosition:position, status, odontogramId: tooth.odontogramId, serviceIds:tooth.serviceIds, toothName: position };
            this.baseGridService.updateData(this.toothRoute,updatedTooth, id).subscribe({
              next: () => {
            
                const index = this.dataSource.data.findIndex(t => t.id === id);
                if (index !== -1) {
                  this.dataSource.data[index] = updatedTooth;
          
                  this.dataSource.data = [...this.dataSource.data];
                }
                this.refreshService.triggerRefresh();
                Swal.fire("El estado ha sido actualizado!", "", "success");
              },
              error: (error) => {
                console.error("Error al actualizar el diente:", error);
                Swal.fire("Error al actualizar el diente", "", "error");
              },
            });
          },
          error: (error) => {
            console.error("Error al obtener el diente:", error);
            Swal.fire("Error al obtener el diente", "", "error");
          },
        });
      } else if (result.isDenied) {
        Swal.fire("El cambio ha sido cancelado", "", "info");
      }
    });
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
        console.log("Patient ID obtained:", this.patientId);
        this.getOdontogramByPatientId(this.patientId);
        this.getPatientById(this.patientId);
      }
    });
  }

  getAllServices() {
    this.baseGridService.getData(this.servicesRoute).subscribe({
      next: (services: any) => {
        this.servicesList = services;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  async getOdontogramByPatientId(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.baseGridService.getDataById(this.odontogramRoute, id).subscribe({
        next: (data: any) => {
          this.patientOdontogram = data;
          const toothData = this.patientOdontogram.tooth.map((tooth: any) => ({
            ...tooth,
            toothPosition: tooth.toothPosition,
            odontogramId: this.patientOdontogram.id 
          }));
  
          this.dataSource.data = toothData;
          resolve();
        },
        error: error => {
          console.error(error);
          reject(error);
        }
      });
    });
  }
  
  getAppointmentService(ids: number[]) {
    let servicesNames: string[] = [];

    const matchedServices = this.servicesList.filter(service => ids.includes(service.id));

    matchedServices.forEach((service: Service) => {
      servicesNames.push(service.name)
    })
    return servicesNames.join(', ');
  }

  getAllTooth() {
    if (this.patientOdontogram && this.patientOdontogram.tooth) {

      console.log('Datos de dientes asignados a dataSource:', this.dataSource.data);
    } else {
      console.warn('No hay datos de dientes para asignar al dataSource');
    }
  }


  getPatientById(id: number) {
    this.baseGridService.getDataById(this.patientRoute,id).subscribe({
      next: (patient: any) => {

        this.patient = patient;
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
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.dataSource.filter = filterValue;
}

   getToothName(position:number){
    return `${ToothNames[position]}`
  }

  onFilterChange(event: any) {
    console.log('Filtro seleccionado:', this.selectedFilter);
  }

  activeFilter(option:string) {
    console.log(option);
    this.statusMode = true;
    
    if(option === '1'){

    }
    
  }

  getAllPatientApppointments() {
    this.baseGridService.getData(this.appointmentRoute).subscribe({
      next: (appointmentList: any) => {
        this.patientAppointment = appointmentList.filter((appointment: any) => {
          return appointment.patiendId = this.patientId;
        });

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
