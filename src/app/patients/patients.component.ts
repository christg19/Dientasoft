import { AfterViewInit, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { DataSource } from '@angular/cdk/collections';
import { PatientsService } from '../shared/services/patient.service';
import { Patient } from '../shared/interfaces/patient.interface';


@Component({
  selector: 'app-patients',
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss']
})
export class PatientsComponent implements AfterViewInit {
  displayedColumns: string[] = ['name', 'history', 'procedure', 'pending-appointment','pending_appointment', 'actions'];
  patientList: Patient[] = [];
  loading: Boolean = false;
  dataSource = new MatTableDataSource<any>(this.patientList);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  redirectToClient = '/patients'
  redirectToServices = '/services'

  constructor(private router: Router, private paginators: MatPaginatorIntl, private patientService: PatientsService,
    private route: ActivatedRoute, private cdr: ChangeDetectorRef) {

    this.paginators.itemsPerPageLabel = "Registros por página";
    this.paginators.nextPageLabel = "Siguiente página";
    this.paginators.previousPageLabel = "Página anterior";
    this.paginators.lastPageLabel = "Ultima página";
    this.paginators.firstPageLabel = "Primera página";

    this.paginators.getRangeLabel = (page, pageSize, length) => {
      return this.spanishRangeLabel(page, pageSize, length);
    };
  }

  ngOnInit(): void {
    this.loading = true;
    this.getAllPatients();
    this.loading = false;
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    const filterResult = this.patientList.filter(propertie =>
      propertie.name.toLowerCase().includes(filterValue)
    );
    this.dataSource.data = filterResult;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deletePatient(id:string){
    this.patientService.deletePatient(id).subscribe({
      next: (response:any) => {
        console.log('Paciente eliminado con exito:', response);
        this.getAllPatients();
        this.cdr.detectChanges();
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
        this.dataSource.data = this.patientList;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error)
      }
    })
  }

  redirect(url: string) {
    this.router.navigate([url])
  }

  profile(id: string) {
    this.router.navigate(['patients/history/', id]);
  }

  redirectToEdit(id: string): void {
    this.router.navigate(['/patients/updatePatient', id]);
  }


}
