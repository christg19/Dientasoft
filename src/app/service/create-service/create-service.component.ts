
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Patient } from 'src/app/shared/interfaces/patient.interface';
import { Service } from 'src/app/shared/interfaces/services.interface';
import { ServicesService } from 'src/app/shared/services/services.service';

@Component({
  selector: 'app-create-service',
  templateUrl: './create-service.component.html',
  styleUrls: ['./create-service.component.scss']
})
export class CreateServiceComponent {
  private serviceId!: number;
  serviceForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private servicesService: ServicesService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      cost: [, Validators.required],
    });
  }

  ngOnInit() {
    this.getId();
    this.getServiceDetails(this.serviceId)
  }

  getId() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.serviceId = +id;
        this.getServiceDetails(this.serviceId);
      }
    });
  }

  private getServiceDetails(id: number) {
    this.servicesService.getServiceById(id).subscribe({
      next: (service: any) => {
        this.fillFormDetails(service);
      },
      error: (error) => {
        console.error(error);
      }
    })
  }

  private fillFormDetails(service: Service) {
    this.serviceForm.patchValue({
      name: service.name || '',
      cost: service.cost || 0,
    })
  }

  updateService(service: Service, id: number) {
    this.servicesService.updateService(service, id).subscribe({
      next: (response: any) => {
        console.log('Updateado con exito:', response);

      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  createService(service: Service) {
    this.servicesService.createService(service)
  }

  submitForm() {
    if (this.serviceForm.valid) {
      const formValue = this.serviceForm.value;

      if (this.serviceId) {
        this.updateService(formValue, this.serviceId)
        this.router.navigate(['/services']);
      } else {
        this.createService(formValue);
      }

    }
  }
}
