import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Appointment } from 'src/app/shared/interfaces/appointment.interface';
import { Dues, SelectableObject, ServiceOrDue } from 'src/app/shared/interfaces/dues.interface';
import { Patient } from 'src/app/shared/interfaces/patient.interface';
import { Service } from 'src/app/shared/interfaces/services.interface';
import { DuesService } from 'src/app/shared/services/dues.service';
import { Odontogram } from 'src/app/shared/interfaces/odontogram.interface';
import { Tooth } from 'src/app/shared/interfaces/tooth.interface';
import { apiRoutes } from 'src/app/shared/const/backend-routes';
import { BaseGridService } from 'src/app/shared/services/baseGrid.service';
import { ToothNames } from 'src/app/shared/const/enums/tooth.enum';
import { ServicesService } from 'src/app/shared/services/services.service';
import { AppointmentService } from 'src/app/shared/services/appointment.service';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.scss']
})
export class CreateAppointmentComponent {
  private dialogRef!: MatDialogRef<any>;
  private endpointRoutes = apiRoutes;

  public appointmentForm!: FormGroup;
  public patientList: Patient[] = [];

  public appointmentList: Appointment[] = []
  public appointment?: Appointment;

  public buttonAppointment: string[] = ['Registrar cita', 'Actualizar Cita']
  public displayedColumns: string[] = ['date', 'patientName', 'procedure', 'amount', 'actions'];
  public appointmentServicesName: string[] = [];
  public redirectToClient: string = '/patients'
  public redirectToServices: string = '/services'


  public patientOdontogram!: Odontogram;

  public loading: Boolean = false;
  public updating: boolean = false;
  public isDataValid: boolean = false;

  public selectedDues: Dues[] = [];
  public duesList: Dues[] = [];
  public selectedDue!: Dues;
  public combinedList: (Service | (Dues & { itemType: 'service' | 'due' }))[] = [];
  public servicesList: Service[] = []
  public selectedServices: ServiceOrDue[] = [];

  public patientId!: number;
  public componentDueCost: number = 0;
  public appointmentId!: number;
  public toothPositionArray: number[] = [];
  public totalDues!: number;
  public reduceCost: number = 0;
  public patientSelectedId!: number;

  public appointmentData = undefined;
  public appointmentHour = undefined;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private duesService: DuesService,
    private baseGridService: BaseGridService,
    private servicesService: ServicesService,
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute

  ) {
    this.appointmentForm = this.fb.group({
      appointmentDate: [Date, Validators.required],
      appointmentHour: ['', Validators.required],
      serviceIds: [[], [Validators.required]],
      patientId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.getAllPatients();
    this.getAllServices()
      .then(() => {
        if (this.duesList || this.servicesList) {
          this.combineLists(this.duesList, this.servicesList);
        } else {
          console.log('Dues List está vacío');
        }
  
        this.appointmentId = Number(this.route.snapshot.paramMap.get('id') || '')
        if (this.appointmentId) {
          this.loadAppointmentDetails(this.appointmentId);
        }
      })
      .catch(error => console.error('Error cargando datos:', error))
      .finally(() => {
        this.loading = false;
      });
  }
  

  ngAfterViewInit() {

  }

  redirect(url: string) {
    this.router.navigate([url])
  }

  applyFilters(event: number) {

  }

  compareFn(o1: any, o2: any): boolean {
    if (!o1 || !o2) {
      return false;
    }
    return o1.id === o2.id;
  }

  getPatientId(id: number) {
    this.patientSelectedId = id;
  }

  combineLists(duesList: Dues[], serviceList: Service[]) {
    if (duesList && duesList.length > 0) {
      this.combinedList = [
        ...serviceList.map(item => ({ ...item, itemType: 'service' as 'service' })),
        ...duesList.filter(due => due.dueQuantity > 0)
          .map(due => ({ ...due, itemType: 'due' as 'due', name: `Cuota de ${due.name}` }))
      ];
    } else {
      this.combinedList = serviceList.map(item => ({ ...item, itemType: 'service' as 'service' }));
    }
    console.log('Combined List:', this.combinedList);
  }
  

  addingDues(id: number) {
    if (id === null || id === undefined) {
      console.error('No encontrado');
      return;
    }

    this.patientId = id;

    this.baseGridService.getDataById(this.endpointRoutes.patient.main, id).subscribe(async (patient: any) => {
      this.duesList = patient && patient.dues ? patient.dues : [];
      this.combineLists(this.duesList, this.servicesList);
    }, error => {
      console.error('Error fetching patient with id:', id, error);
    });
  }

  onSelectionChange(event: MatSelectChange) {
    const selectedItems = event.value;
    this.selectedDues = selectedItems.filter((item: SelectableObject) => item.itemType === 'due');
    this.selectedServices = selectedItems.filter((item: SelectableObject) => item.itemType === 'service');
  }

  formatDate(date: string) {
    const fecha = new Date(date);
    const year = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    let hora = fecha.getHours();
    let minutes = fecha.getMinutes();

    const periodo = hora >= 12 ? 'PM' : 'AM';

    if (hora > 12) {
      hora -= 12;
    } else if (hora === 0) {
      hora = 12;
    }

    const horaFormateada = `${hora}:${minutes} ${periodo}`;
    const fechaFormateada = `${year}-${mes}-${dia} / ${horaFormateada}`;

    return fechaFormateada;
  }

  gettingId(id: number): void {
    this.appointmentId = id;
  }

  loadAppointmentDetails(id: number) {
    this.updating = true;
    this.baseGridService.getDataById(this.endpointRoutes.appointment.main, id).subscribe(
      (appointment: any) => {
        const appointmentData: Appointment = appointment;
        const appointmentDateTime = new Date(appointmentData.appointmentDate);

        const appointmentDate = appointmentDateTime.toISOString().substring(0, 10);
        const hours = appointmentDateTime.getHours().toString().padStart(2, '0');
        const minutes = appointmentDateTime.getMinutes().toString().padStart(2, '0');
        const appointmentHour = `${hours}:${minutes}`;

        const serviceObjects = this.combinedList.filter(item =>
          item.id !== undefined && appointmentData.serviceIds.includes(item.id)
        );

        this.appointmentForm.patchValue({
          appointmentDate: appointmentDate,
          appointmentHour: appointmentHour,
          serviceIds: serviceObjects,
          patientId: appointmentData.patientId,
        });


        this.cdr.detectChanges();
      },
      error => console.error(error)
    );
  }

  getAppointmentService(ids: number[]) {
    let servicesNames: string[] = [];

    const matchedServices = this.servicesList.filter(service => ids.includes(service.id));

    matchedServices.forEach((service: Service) => {
      servicesNames.push(service.name)
    })

    return servicesNames.join(', ');
  }

  async getOdontogramByPatientId(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.baseGridService.getDataById(this.endpointRoutes.odontogram.main, id).subscribe({
        next: (data: any) => {
          this.patientOdontogram = data;
          resolve();
        },
        error: (error) => {
          console.error(error);
          reject(error);
        }
      });
    });
  }

  saveToothList(array: number[]) {
    this.toothPositionArray = array;
  }

  assignServicesToTooths(serviceIds: number[], odontogramId: number) {
    this.toothPositionArray.forEach((toothPosition: number) => {
      const existingTooth = this.patientOdontogram.tooth.find(
        (tooth: Tooth) => tooth.toothPosition === toothPosition
      );

      if (existingTooth) {

        existingTooth.serviceIds = [...(existingTooth.serviceIds || []), ...serviceIds];
      } else {

        this.baseGridService.createData<Tooth>(this.endpointRoutes.tooth.main, {
          toothPosition: toothPosition,
          odontogramId: odontogramId,
          serviceIds: serviceIds,
          status: 5,
          toothName: `${ToothNames[toothPosition]}`
        }).subscribe({
          next: (newTooth) => {
            this.patientOdontogram.tooth.push(newTooth);
          },
          error: (error) => {
            console.error('Error al crear el diente:', error);
          }
        });
      }
    });

    const odontogramToUpdate = {
      patientId: this.patientOdontogram.id,
      tooth: this.patientOdontogram.tooth.map(({ toothPosition, serviceIds }) => ({
        toothPosition,
        serviceIds
      }))
    };

    if (this.patientOdontogram.id) {
      this.baseGridService.updateData(this.endpointRoutes.odontogram.main, odontogramToUpdate, this.patientOdontogram.id)
        .subscribe({
          next: () => console.log('Odontograma actualizado correctamente'),
          error: (error) => console.error('Error al actualizar el odontograma:', error)
        });
    }
  }

  deleteAppointment(id: number) {
    this.baseGridService.deleteData<Appointment>(this.endpointRoutes.appointment.main, id).subscribe({
      next: (response: any) => {
        console.log('Cita eliminada con éxito:', response);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al eliminar la cita:', error);
      }
    });
  }

  async getAllServices(): Promise<void> {
    try {
      this.servicesList = await lastValueFrom(this.servicesService.getServices());
    } catch (error) {
      console.error('Error al obtener los servicios:', error);
    }
  }

  getAllPatients() {
    this.baseGridService.getData<Patient[]>(this.endpointRoutes.patient.main).subscribe({
      next: (patients: any) => {
        this.patientList = patients;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  updateDue(due: Dues, id: number) {
    this.duesService.updateDue(due, id).subscribe({
      next: (response: any) => {
        console.log('Updateado, ', response)
      }
    })
  }

  filterServices(list: ServiceOrDue[]): (number | string)[] {
    return list.map(item => {
      if (item.itemType === 'service') {
        return item.id;
      } else if (item.itemType === 'due') {
        return item.serviceId;
      }
      return undefined;
    }).filter(id => id !== undefined) as (number | string)[];
  }

  async filterServiceCost(): Promise<number> {
    if (!this.selectedServices || this.selectedServices.length === 0) {
      return 0;
    }

    return this.selectedServices
      .filter(item => item.itemType === 'service')
      .reduce((acc, service) => {
        if ('cost' in service) {
          return acc + service.cost;
        }
        return acc;
      }, 0);
  }

  async updateDueQuantities(dues: Dues[]): Promise<void> {
    const updatePromises = dues.map(due => {
      if (due.dueQuantity > 0 && due.id !== undefined) {
        const decrement = due.totalCost / due.dueQuantity;
        return lastValueFrom(this.duesService.patchDue(due.id, {
          dueQuantity: due.dueQuantity - 1,
          totalCost: due.totalCost - decrement
        }));
      } else {
        console.error('Intento de actualizar un Due sin ID válido o con dueQuantity no positiva:', due);
        return Promise.reject('ID inválido o dueQuantity no positiva');
      }
    });

    try {
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Hubo un error al actualizar los Dues:', error);

      throw error;
    }
  }

  async dueCost(selectedDues: Dues[]): Promise<number> {
    let totalDueCost = 0;
    for (const due of selectedDues) {
      if (due.itemType === 'due') {
        if (due.dueQuantity > 0) {
          const costPerDue = due.totalCost / due.dueQuantity;
          totalDueCost += costPerDue;
        } else {
          console.warn(`Due ID: ${due.id} tiene dueQuantity <= 0. No se añadirá al costo.`);
        }
      }
    }
    this.componentDueCost = totalDueCost;
    return totalDueCost;
  }

  async submitForm() {
    if (!this.appointmentForm.valid) {
      console.error('El formulario no es válido. Detalles de los errores:');

      return;
    }

    const formValue = this.appointmentForm.getRawValue();

    try {
      let dueCost = 0;

      if (this.selectedDues && this.selectedDues.length > 0) {
        dueCost = await this.dueCost(this.selectedDues);
        await this.updateDueQuantities(this.selectedDues);
      }

      const serviceTotalCost = await this.filterServiceCost();

      const date = new Date(formValue.appointmentDate);
      const [hours, minutes] = formValue.appointmentHour.split(':').map(Number);
      date.setHours(hours, minutes);

      const totalCost = dueCost + serviceTotalCost;

      const submission = {
        ...formValue,
        serviceIds: this.filterServices(formValue.serviceIds),
        duesCost: dueCost,
        totalCost: totalCost,
        appointmentDate: date.toISOString()
      };

      delete submission.appointmentHour;

      if (this.updating) {
        await lastValueFrom(this.appointmentService.updateAppointment(submission, this.appointmentId));
      } else {
        await lastValueFrom(this.appointmentService.createAppointment(submission));
        await this.getOdontogramByPatientId(this.patientId);
        if (this.patientOdontogram?.id) {
          this.assignServicesToTooths(submission.serviceIds, this.patientOdontogram.id);
        }
        this.redirect(`/patients/history/${this.patientId}`);
      }

      this.updating = false;

    } catch (error) {
      console.error('Error al procesar la cita o actualizar los Dues:', error);

    }
  }





}
