import { ChangeDetectorRef, Component, TemplateRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Appointment } from 'src/app/shared/interfaces/appointment.interface';
import { Dues, SelectableObject, ServiceOrDue } from 'src/app/shared/interfaces/dues.interface';
import { Patient } from 'src/app/shared/interfaces/patient.interface';
import { Service } from 'src/app/shared/interfaces/services.interface';
import { AppointmentService } from 'src/app/shared/services/appointment.service';
import { DuesService } from 'src/app/shared/services/dues.service';
import { PatientsService } from 'src/app/shared/services/patient.service';
import { ServicesService } from 'src/app/shared/services/services.service';
import { ToothService } from 'src/app/shared/services/tooth.service';
import { OdontogramService } from 'src/app/shared/services/odontogram.service'
import { Odontogram } from 'src/app/shared/interfaces/odontogram.interface';
import { Tooth } from 'src/app/shared/interfaces/tooth.interface';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.scss']
})
export class CreateAppointmentComponent {
  appointmentData = undefined;
  appointmentHour = undefined;
  patientId!: number;
  redirectToClient = '/patients'
  redirectToServices = '/services'
  servicesList: Service[] = []
  appointmentForm!: FormGroup;
  patientList: Patient[] = [];
  appointmentList: Appointment[] = []
  appointment?: Appointment;
  buttonAppointment: string[] = ['Registrar cita', 'Actualizar Cita']
  public updating: boolean = false;
  appointmentId: string = '';
  displayedColumns: string[] = ['date', 'patientName', 'procedure', 'amount', 'actions'];
  loading: Boolean = false;
  appointmentServicesName: string[] = [];
  dialogRef!: MatDialogRef<any>;
  patientOdontogram!: Odontogram;
  toothPositionArray: number[] = [];
  duesList!: Dues[];
  selectedDue!: Dues;
  combinedList: (Service | (Dues & { itemType: 'service' | 'due' }))[] = [];
  totalDues!: number;
  public componentDueCost: number = 0;
  public reduceCost: number = 0;
  selectedDues!: Dues[];
  isDataValid: boolean = false;
  selectedServices!: ServiceOrDue[]
  constructor(
    private patientService: PatientsService,
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private toothService: ToothService,
    private odontogramService: OdontogramService,
    private servicesService: ServicesService,
    private router: Router,
    private duesService: DuesService,
    private cdr: ChangeDetectorRef

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
    this.getAllServices();

    setTimeout(() => {
      this.loading = false;
    }, 200)
  }

  ngAfterViewInit() {

  }


  combineLists(duesList: Dues[], serviceList: Service[]) {
    this.combinedList = [
      ...serviceList.map(item => ({ ...item, itemType: 'service' as 'service' })),
      ...duesList.filter(due => due.dueQuantity > 0)
        .map(due => ({ ...due, itemType: 'due' as 'due' }))
    ];
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

  redirect(url: string) {

    this.router.navigate([url])
  }



  addingDues(id: number) {
    if (id === null || id === undefined) {
      console.error('No encontrado');
      return;
    }

    this.patientId = id;

    this.patientService.getPatientById(id).subscribe(async (patient: any) => {
      this.duesList = patient && patient.dues ? patient.dues : [];
      this.combineLists(this.duesList, this.servicesList);
    }, error => {
      console.error('Error fetching patient with id:', id, error);
    });
  }

  onSelectionChange(event: MatSelectChange) {
    const selectedItems = event.value;
    console.log(selectedItems);
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

  gettingId(id: string): void {
    this.appointmentId = id;
  }




  loadAppointmentDetails(id: string) {
    this.updating = true;
    this.appointmentService.getAppointmentById(id).subscribe(
      (appointment: any) => {
        const appointmentData: Appointment = appointment;
        const appointmentDateTime = new Date(appointmentData.appointmentDate);

        const appointmentDate = appointmentDateTime.toISOString().substring(0, 10);
        const hours = appointmentDateTime.getHours().toString().padStart(2, '0');
        const minutes = appointmentDateTime.getMinutes().toString().padStart(2, '0');
        const appointmentHour = `${hours}:${minutes}`;


        this.appointmentForm.patchValue({
          appointmentDate: appointmentDate,
          appointmentHour: appointmentHour,
          serviceIds: appointmentData.serviceIds,
          patientId: appointmentData.patientId,
          patientName: appointmentData.patientName,
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
      this.odontogramService.getOdontogram(id).subscribe({
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
    console.log(`Posiciones: ${this.toothPositionArray}`);
  }

  assignServicesToTooths(serviceIds: number[], odontogramId: number) {
    this.toothPositionArray.forEach((toothPosition: number) => {
      const existingTooth = this.patientOdontogram.tooth.find(
        (tooth: Tooth) => tooth.toothPosition === toothPosition
      );
  
      if (existingTooth) {
        // Agrega los servicios si el diente ya existe
        existingTooth.serviceIds = [...(existingTooth.serviceIds || []), ...serviceIds];
      } else {
        // Aquí puedes ver qué datos se enviarán al crear un nuevo diente
        console.log('Datos para crear un nuevo diente:', {
          toothPosition,
          odontogramId,
          serviceIds,
          status: null
        });
  
        // Crea el diente si no existe
        this.toothService.createTooth({
          toothPosition: toothPosition,
          odontogramId: odontogramId,
          serviceIds: serviceIds,
          status: null
        }).subscribe({
          next: (newTooth) => {
            console.log('Diente creado exitosamente:', newTooth);
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
  
    // También podemos ver qué datos se están enviando al actualizar el odontograma
    console.log('Datos para actualizar el odontograma:', odontogramToUpdate);
  
    if (this.patientOdontogram.id) {
      this.odontogramService.updateOdontogram(odontogramToUpdate, this.patientOdontogram.id)
        .subscribe({
          next: () => console.log('Odontograma actualizado correctamente'),
          error: (error) => console.error('Error al actualizar el odontograma:', error)
        });
    }
  }
  

  deleteAppointment(id: string) {
    this.appointmentService.deleteAppointment(id).subscribe({
      next: (response: any) => {
        console.log('Cita eliminada con éxito:', response);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error al eliminar la cita:', error);
      }
    });
  }


  getAllServices() {
    this.servicesService.getServices().subscribe({
      next: (services: any) => {
        this.servicesList = services;
        console.log(services)
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  getAllPatients() {
    this.patientService.getPatients().subscribe({
      next: (patients: any) => {
        this.patientList = patients;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  closeModal(): void {
    this.dialogRef.close();
    this.updating = false;
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
        return this.duesService.patchDue(due.id, {
          dueQuantity: due.dueQuantity - 1,
          totalCost: due.totalCost - decrement
        }).toPromise();
      } else {
        console.error('Intento de actualizar un Due sin ID válido o con dueQuantity no positiva.');
        return Promise.reject('ID inválido o dueQuantity no positiva');
      }
    });

    try {
      await Promise.all(updatePromises);
      console.log("Todos los Dues han sido actualizados correctamente.");
    } catch (error) {
      console.error('Hubo un error al actualizar los Dues:', error);
      throw error;
    }
  }

  async dueCost(selectedDues: Dues[]): Promise<number> {
    let totalDueCost = 0;
    for (const due of selectedDues) {
      if (due.itemType === 'due') {
        totalDueCost += due.totalCost / due.dueQuantity;
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
        await this.updateDueQuantities(this.selectedDues);
        dueCost = await this.dueCost(this.selectedDues);
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
        console.log('Actualizando cita');
        await lastValueFrom(this.appointmentService.updateAppointment(submission, this.appointmentId));
      } else {
        console.log('Creando nueva cita');
        console.log(submission);
        await lastValueFrom(this.appointmentService.createAppointment(submission));
        await this.getOdontogramByPatientId(this.patientId);
        if (this.patientOdontogram?.id) {
          this.assignServicesToTooths(submission.serviceIds, this.patientOdontogram.id);
        }
      }

      this.closeModal();
      this.updating = false;

    } catch (error) {
      console.error('Error al procesar la cita o actualizar los Dues:', error);
    }
  }

  applyFilters(event: number) {

  }

  compareFn(o1: any, o2: any): boolean {
    if (!o1 || !o2) {
      return false;
    }
    return o1.id === o2.id;
  }


}
