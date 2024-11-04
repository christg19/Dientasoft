import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { Appointment } from 'src/app/shared/interfaces/appointment.interface';
import { Dues, SelectableObject, ServiceOrDue } from 'src/app/shared/interfaces/dues.interface';
import { Patient } from 'src/app/shared/interfaces/patient.interface';
import { Service } from 'src/app/shared/interfaces/services.interface';
import { AppointmentService } from 'src/app/shared/services/appointment.service';
import { DuesService } from 'src/app/shared/services/dues.service';
import { PatientsService } from 'src/app/shared/services/patient.service';
import { ServicesService } from 'src/app/shared/services/services.service';

@Component({
  selector: 'app-create-appointment',
  templateUrl: './create-appointment.component.html',
  styleUrls: ['./create-appointment.component.scss']
})
export class CreateAppointmentComponent {
  appointmentData = undefined;
  appointmentHour = undefined;
  patientId!:number;
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
    private servicesService: ServicesService,
    private router: Router,
    private duesService:DuesService
    
  ) {
    this.appointmentForm = this.fb.group({
      appointmentDate: [Date, Validators.required],
      appointmentHour: ['', Validators.required],
      serviceIds: [[], [Validators.required]],
      patientId: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.getAllServices();
    this.getAllPatients();
  }

  redirect(url: string) {
    this.router.navigate([url])
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

  compareFn(o1: any, o2: any): boolean {
    if (!o1 || !o2) {
      return false;
    }
    return o1.id === o2.id;
  }

  getAllServices() {
    this.servicesService.getServices().subscribe({
      next: (services: any) => {
        this.servicesList = services;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  applyFilter(event:number){

  }

  closeModal() {

  }

  addingDues(e:any){

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

  updateDue(due: Dues, id: number) {
    this.duesService.updateDue(due, id).subscribe({
      next: (response: any) => {
        console.log('Updateado, ', response)
      }
    })
  }

  combineLists(duesList: Dues[], serviceList: Service[]) {
    this.combinedList = [
      ...serviceList.map(item => ({ ...item, itemType: 'service' as 'service' })),
      ...duesList.filter(due => due.dueQuantity > 0)
        .map(due => ({ ...due, itemType: 'due' as 'due' }))
    ];
  }


  onSelectionChange(event: MatSelectChange) {
    const selectedItems = event.value;
    console.log(selectedItems);
    this.selectedDues = selectedItems.filter((item: SelectableObject) => item.itemType === 'due');
  
    this.selectedServices = selectedItems.filter((item: SelectableObject) => item.itemType === 'service');
  }

  submitForm() {
    if (this.appointmentForm.valid) {
      const formValue = this.appointmentForm.value;

      if (formValue.appointmentDate && formValue.appointmentHour) {
        const date = new Date(formValue.appointmentDate);
        const timeParts = formValue.appointmentHour.match(/(\d+):(\d+) (\w+)/);
        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const ampm = timeParts[3];

        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        if (!isNaN(date.getTime())) {
          date.setHours(hours, minutes);

          const submission = {
            ...formValue,
            appointmentDate: date.toISOString()
          };

          this.appointmentService.createAppointment(submission).subscribe({
            next: (response: any) => {
              console.log('Cita creada exitosamente:', response);
              this.router.navigate(['/appointment']);
            },
            error: (error: any) => {
              console.error('Error al crear la cita:', error);
            }
          });
        } else {
          console.error('La fecha del formulario no es válida.');
        }
      } else {
        console.error('La fecha y/o la hora no están definidas.');
      }
    } else {
      console.log('El formulario no es válido. Detalles de los errores:');
      Object.keys(this.appointmentForm.controls).forEach(key => {
        const controlErrors = this.appointmentForm.get(key)?.errors;
        if (controlErrors != null) {
          Object.keys(controlErrors).forEach(keyError => {
            console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
          });
        }
      });
    }
  }
}
