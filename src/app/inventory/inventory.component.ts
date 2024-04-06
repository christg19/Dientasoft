import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ProductService } from '../shared/services/product.service';
import { Product } from '../shared/interfaces/product.interface';

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
  public actions:boolean = true;
  public instrumentalQuantity: number = 0;
  public buttonsNames: string[] = ['Instrumentos', 'Quimicos', 'Desechables'];
  public productList: Product[] = [];
  public tableOptions: TableOption[] = [
    {
      buttonName: "INSTRUMENTAL",
      active: true,
      columns: ['Item', 'Cantidad disponible', 'Fecha de compra', 'Notas', 'Esterilizado / Limpiado / Empaquetado'],
      products: [],
      table: ['items', 'status', 'date', 'notes','actions']
    },
    {
      buttonName: "CHEMICAL",
      active: false,
      columns: ['Item', 'Cantidad disponible', 'Fecha de caducidad', 'Notas',],
      products: [],
      table: ['items', 'expiryDate', 'notes',  'actions']
    },
    {
      buttonName: "DISPOSABLE",
      active: false,
      columns: ['Item', 'Cantidad disponible', 'Fecha de caducidad', 'Notas' ],
      products: [],
      table: ['items', 'expiryDate', 'notes',  'actions']
    }
  ];

  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private productService: ProductService, private paginators: MatPaginatorIntl) {
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
    this.getProducts();
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


  addItem() {

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

}
