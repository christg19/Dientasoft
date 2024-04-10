import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../shared/services/product.service';
import { Categories, Product } from '../shared/interfaces/product.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Instrument } from '../shared/interfaces/instrument.interface';


export interface TableOption {
  buttonName: string;
  active: boolean;
  columns: string[];
  products: Product[];
  table: string[];
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
  public actions: boolean = true;
  public loading: boolean = false;
  public instrumentalQuantity: number = 0;
  public inventoryId: string = '';
  updating: boolean = false;
  public categoriesForProduct = Object.entries(Categories).map(([key, value]) => ({ key, value }));
  dialogRef!: MatDialogRef<any>;
  inventoryForm!: FormGroup;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;

  public buttonsNames: string[] = ['Instrumentos', 'Quimicos', 'Desechables'];
  public productList: Product[] = [];
  public tableOptions: TableOption[] = [
    {
      buttonName: "INSTRUMENTAL",
      active: true,
      columns: ['Item', 'Cantidad disponible', 'Fecha de compra', 'Notas', 'Esterilizado / Limpiado / Empaquetado'],
      products: [],
      table: ['items', 'status', 'date', 'notes', 'actions']
    },
    {
      buttonName: "CHEMICAL",
      active: false,
      columns: ['Item', 'Cantidad disponible', 'Fecha de caducidad', 'Notas',],
      products: [],
      table: ['items', 'expiryDate', 'notes', 'actions']
    },
    {
      buttonName: "DISPOSABLE",
      active: false,
      columns: ['Item', 'Cantidad disponible', 'Fecha de caducidad', 'Notas'],
      products: [],
      table: ['items', 'expiryDate', 'notes', 'actions']
    }
  ];

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef, private productService: ProductService, private paginators: MatPaginatorIntl, private fb: FormBuilder, public dialog: MatDialog,) {
    this.paginators.itemsPerPageLabel = "Registros por página";
    this.paginators.nextPageLabel = "Siguiente página";
    this.paginators.previousPageLabel = "Página anterior";
    this.paginators.lastPageLabel = "Ultima página";
    this.paginators.firstPageLabel = "Primera página";

    this.paginators.getRangeLabel = (page, pageSize, length) => {
      return this.spanishRangeLabel(page, pageSize, length);
    };

    this.inventoryForm = this.fb.group({
      name: ['', Validators.required],
      unitDate: [Date, Validators.required],
      expiryDate: [Date],
      categoryProduct: ['', Validators.required]

    });
  }

  ngOnInit() {
    this.loading = true;
    this.getProducts();
    setTimeout(()=>{
      this.loading = false;
    }, 200)
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

  loadInventoryDetails(id: string) {
    this.updating = true;
    this.productService.getProductById(id).subscribe(
      (instrument: any) => {
        const instrumentPatch: Instrument = instrument;
        this.inventoryForm.patchValue({
          name: instrumentPatch.name,
          unitDate: instrumentPatch.unitDate,
          notes: instrumentPatch.notes,
          expiryDate: instrumentPatch.expiryDate,
          instrumentalState: instrumentPatch.instrumentalState,
          categoryProduct: instrumentPatch.categoryProduct
        });


      },
      error => console.error(error)
    );
  }

  deleteProduct(id: string) {
    this.productService.deleteProduct(id).subscribe({
      next: (response: any) => {

        this.getProducts();

      },
      error: (error: Error) => {
        console.log(error)
      }
    })
  }

  getColumns() {
    const activeOption = this.tableOptions.find(option => option.active);
    this.displayedColumns = activeOption ? activeOption.table : [];
  }

  getInstrumentalQuantity(productArray: Product[], category: string) {
    const products = productArray.filter((product: Product) => product.categoryProduct === category);
    return products.length;
  }

  toggleActive(selectedOption: any) {
    this.tableOptions.forEach(option => option.active = false);
    selectedOption.active = true;
    this.getColumns();
    this.dataSource.data = this.getDataSourceProduct(selectedOption.buttonName);
  }

  gettingId(id: string): void {
    this.inventoryId = id;
  }

  gettingIdAndOpenModal(id: string): void {
    console.log(id, 'gettingIdAndOpenModal');
    this.updating = true;
    this.inventoryId = id;
    this.openModal(this.modalContent, id);
  }

  loadServicesDetails(id: string) {
    this.updating = true;
    this.productService.getProductById(id).subscribe(
      (service: any) => {
        const productPatch: Product = service;
        this.inventoryForm.patchValue({
          name: productPatch.name,
          unitDate: productPatch.unitDate,
          expiryDate: productPatch.expiryDate,
          instrumentalState: productPatch.instrumentalState,
          notes: productPatch.notes,
        });


      },
      error => console.error(error)
    );
  }


  openModal(templateRef: TemplateRef<any>, id?: string): void {

    if (!id) {
      this.updating = false;
      this.inventoryId = '';
      this.inventoryForm.reset();

    } else {
      this.updating = true;
      this.inventoryId = id;
      this.loadInventoryDetails(id);

    }

    this.dialogRef = this.dialog.open(templateRef, { width: '400px', height: '500px' });

    setTimeout(() => {
      this.cdr.detectChanges();

    }, 0);
  }



  closeModal(): void {
    this.dialogRef.close();
    this.updating = false;
  }


  getDataSourceProduct(productType: string): Product[] {
    return this.productList.filter((product: Product) => product.categoryProduct === productType);
  }

  getProducts() {
    this.productService.getProducts().subscribe({
      next: (products: any) => {
        this.productList = products;
        const option = this.tableOptions.find((table: TableOption) => table.active);
        const optionFilter = this.productList.filter((product: Product) => product.categoryProduct === option?.buttonName)
        this.instrumentalQuantity = optionFilter.length;
        this.dataSource.data = optionFilter;

        this.getColumns();
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  formatDate(date: string) {
    const fecha = new Date(date);
    const year = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');


    const fechaFormateada = `${year}-${mes}-${dia}`;

    return fechaFormateada;
  }


  selectProduct() {
    let option!: string;

    for (let i = 0; i < this.tableOptions.length; i++) {
      if (this.tableOptions[i].active) {
        option = this.tableOptions[i].buttonName
      }
    }

    return this.getDataSourceProduct(option)
  }

  createInstrument(instrument: Instrument) {
    this.productService.createProduct(instrument).subscribe({
      next: (response: any) => {
        this.getProducts();
      }
    })
  }

  updateInstrument(instrument: Instrument, id: string) {
    this.productService.updateProduct(instrument, id).subscribe({
      next: (response: any) => {
        this.getProducts();
      },
      error: (error: any) => {
        console.error(error);
      }
    })
  }

  submitForm() {
    if (this.inventoryForm.valid) {
      const formValue = this.inventoryForm.value;

      if (this.inventoryId) {
        this.updateInstrument(formValue, this.inventoryId)
        this.router.navigate(['/inventory']);
      } else {
        console.log(formValue)
        this.createInstrument(formValue);
      }

    } else {
      console.error('El formulario es inválido', this.inventoryForm.errors);
      Object.keys(this.inventoryForm.controls).forEach(key => {
        const controlErrors = this.inventoryForm.get(key)!.errors;
        if (controlErrors != null) {
            Object.keys(controlErrors).forEach(keyError => {
                console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
            });
        }
      });
    }
  }

}
