import { Component, Input, OnInit, TemplateRef, ViewChild, AfterViewInit, Renderer2, Output, EventEmitter, ElementRef, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToothNames, ToothStatus } from '../../const/enums/tooth.enum';
import { Tooth } from '../../interfaces/tooth.interface';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { RefreshService } from '../../services/refresh.service';

const toothIdMap: { [key: string]: any } = {
  'svg_1': 1,
  'svg_4917': 2,
  'svg_4080': 3,
  'svg_3181': 4,
  'svg_2390': 5,
  'svg_1596': 6,
  'svg_798': 7,
  'svg_462': 8,
  'svg_468': 9,
  'svg_802': 10,
  'svg_1623': 11,
  'svg_2400': 12,
  'svg_3194': 13,
  'svg_4075': 14,
  'svg_4912': 15,
  'svg_5655': 16,
  'svg_7763': 17,
  'svg_8687': 18,
  'svg_9322': 19,
  'svg_10171': 20,
  'svg_11019': 21,
  'svg_11850': 22,
  'svg_12303': 23,
  'svg_12517': 24,
  'svg_12514': 25,
  'svg_12285': 26,
  'svg_11842': 27,
  'svg_11009': 28,
  'svg_10165': 29,
  'svg_9316': 30,
  'svg_8665': 31,
  'svg_7744': 32
};

const statusColorMap: Record<number, string> = {
  0: '#A8D5BA',
  1: '#FFD1A4', 
  2: '#FFB3BA', 
  3: '#A4C5E2',  
  4: '#FF6B6B',
  5: '#E0E0E0',
};

@Component({
  selector: 'app-tooth-svg',
  templateUrl: './tooth-svg.component.html',
  styleUrls: ['./tooth-svg.component.scss']
})
export class ToothSVGComponent implements OnInit, AfterViewInit {
  @ViewChild('toothContent') toothContent!: TemplateRef<any>;
  @Input() patient?: number;
  @Input() unableCreateTooths?: boolean;
  @Output() actualToothId = new EventEmitter<number>;
  @Output() arrayTooth = new EventEmitter<any>;
  @Input() componentTitle!: string;
  @Input() appointment!: boolean;
  @Input() statusButton!: TemplateRef<any>;
  @Input() statusOptions!: TemplateRef<any>;
  @Input() statusMap: any;
  @Input() actualToothArray!: Tooth[];
  @Input() changeStatus: boolean = false;
  private refreshSubscription!: Subscription;
  colorOn: boolean = true;
  selectedTeeth: { [key: string]: boolean } = {};
  private isSelectToothEnabled = true;
  private listeners: (() => void)[] = [];

  public toothList: Tooth[] = [];

  dialogRef!: MatDialogRef<any>;
  options1 = [
    { value: 'opcion1', viewValue: 'Opción 1' },
    { value: 'opcion2', viewValue: 'Opción 2' },
    { value: 'opcion3', viewValue: 'Opción 3' },
  ];

  options2 = [
    { value: 'opcionA', viewValue: 'Opción A' },
    { value: 'opcionB', viewValue: 'Opción B' },
    { value: 'opcionC', viewValue: 'Opción C' },
  ];

  constructor(public dialog: MatDialog, private renderer: Renderer2, private elementRef: ElementRef, private refreshService:RefreshService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['actualToothArray'] && !changes['actualToothArray'].firstChange) {
      this.applyTestToothColors();
    }
    if (changes['appointment']) {
      this.decidingToothMethods();
    }
  }
  

  ngOnInit(): void {
    if(this.appointment){
      this.SelectToothForAppointment();
    }
    this.refreshSubscription = this.refreshService.refresh$.subscribe(() => {
      this.refreshComponent();
    })
   }

  ngAfterViewInit(): void {
    this.decidingToothMethods();
  }

  refreshComponent(){
    this.applyTestToothColors();
  }

  decidingToothMethods() {
    if (this.unableCreateTooths) {
      this.removePaths();
    }
    if (!this.appointment) {
      this.openTooth();
      this.createTooth();
    } else {
      this.SelectToothForAppointment();
    }
  }

  createTooth() {
    setTimeout(() => {

      Object.keys(toothIdMap).forEach(toothId => {
        const id = toothIdMap[toothId];
        const toothElement = document.querySelector(`path#tooth-${id}`);

        if (toothElement) {
          this.renderer.listen(toothElement, 'mouseenter', () => {
            this.renderer.setStyle(toothElement, 'cursor', 'pointer');
          });
          this.renderer.listen(toothElement, 'mouseleave', () => {
            this.renderer.removeStyle(toothElement, 'cursor')
          });
          this.renderer.listen(toothElement, 'click', () => {
            this.renderer.addClass(toothElement, 'click-animate');
            this.actualToothId.emit(id);

            this.dialogCreateTooth(id);
          });
        } else {
          console.warn(`Element with ID ${toothId} not found or is not a <path>`);
        }
      });


      this.applyTestToothColors();
    }, 100);
  }

  async dialogCreateTooth(id: number) {
    const { value: formValues } = await Swal.fire({
      title: `Asignar datos a ${ToothNames[id]}`,
      html: `
        <select id="swal-select1" class="swal2-input" style="width: 80%; padding: 10px; margin: 10px;">
          ${this.options1
            .map((option) => `<option value="${option.value}">${option.viewValue}</option>`)
            .join('')}
        </select>
        <select id="swal-select2" class="swal2-input" style="width: 80%; padding: 10px; margin: 10px;">
          ${this.options2
            .map((option) => `<option value="${option.value}">${option.viewValue}</option>`)
            .join('')}
        </select>
      `,
      focusConfirm: false,
      preConfirm: () => {
        return [
          (document.getElementById('swal-select1') as HTMLSelectElement).value,
          (document.getElementById('swal-select2') as HTMLSelectElement).value,
        ];
      },
    });
  
    // Utilizar las opciones seleccionadas
    if (formValues) {
      Swal.fire(`Seleccionaste: ${formValues[0]} y ${formValues[1]}`);
      this.usarOpcionesSeleccionadas(formValues[0], formValues[1]);
    }
  }
  
  // Ejemplo de método para usar las opciones seleccionadas
  usarOpcionesSeleccionadas(opcion1: string, opcion2: string) {
    console.log(`Opción 1 seleccionada: ${opcion1}`);
    console.log(`Opción 2 seleccionada: ${opcion2}`);
    // Lógica adicional para manejar las opciones seleccionadas...
  }
  
  
  

  clearAllSelectedTeeth() {
    Object.keys(this.selectedTeeth).forEach(toothId => {
      if (this.selectedTeeth[toothId]) {
        const toothElement = document.querySelector(`path#${toothId}`);
        if (toothElement) {
          this.renderer.removeStyle(toothElement, 'fill');
        }
        this.selectedTeeth[toothId] = false;
      }
    });

    this.toothList = [];
    this.arrayTooth.emit(this.toothList);

    this.listeners.forEach(unlisten => unlisten());
    this.listeners = []; 

    this.openTooth();
  }

  removePaths() {
    const toothPaths = [
      'path#tooth-1', 'path#tooth-2', 'path#tooth-3', 'path#tooth-4', 'path#tooth-5', 'path#tooth-6', 'path#tooth-7', 'path#tooth-8',
      'path#tooth-9', 'path#tooth-10', 'path#tooth-11', 'path#tooth-12', 'path#tooth-13', 'path#tooth-14', 'path#tooth-15', 'path#tooth-16',
      'path#tooth-17', 'path#tooth-18', 'path#tooth-19', 'path#tooth-20', 'path#tooth-21', 'path#tooth-22', 'path#tooth-23', 'path#tooth-24',
      'path#tooth-25', 'path#tooth-26', 'path#tooth-27', 'path#tooth-28', 'path#tooth-29', 'path#tooth-30', 'path#tooth-31', 'path#tooth-32', 'path#svg_13809', 'path#svg_8942'
    ];

    toothPaths.forEach(selector => {
      const pathElement = this.elementRef.nativeElement.querySelector(`svg ${selector}`);
      if (pathElement) {
        pathElement.setAttribute('fill', '#B0B0B0');
        pathElement.style.pointerEvents = 'none';
      }
    });
  }


  onToothClick(event: MouseEvent | string): void {
    let element;
    let id;
    if (event instanceof MouseEvent) {
      element = event.target as HTMLElement;
      id = element.id;
    }
    if (id) {
      this.openModal(this.toothContent, id)
    }
  }

  getTooth(id: number) {
    this.actualToothId.emit(id)
  }

  openTooth() {
    setTimeout(() => {

      Object.keys(toothIdMap).forEach(toothId => {
        const toothElement = document.querySelector(`path#${toothId}`);
        if (toothElement) {

          this.renderer.listen(toothElement, 'mouseenter', () => {
            this.renderer.setStyle(toothElement, 'cursor', 'pointer');
          });
          this.renderer.listen(toothElement, 'mouseleave', () => {
            this.renderer.removeStyle(toothElement, 'cursor')
          });
          this.renderer.listen(toothElement, 'click', () => {
            this.renderer.addClass(toothElement, 'click-animate');
            this.getTooth(toothIdMap[toothId])
          });
        } else {
          console.warn(`Element with ID ${toothId} not found or is not a <path>`);
        }
      });



      this.applyTestToothColors();
    }, 100);
  }

  applyTestToothColors(): void {
    this.actualToothArray.forEach((tooth) => {
      const svgId = Object.keys(toothIdMap).find(key => toothIdMap[key] === tooth.toothPosition);
      const toothElement = document.querySelector(`path#${svgId}`);
      if (toothElement) {
        const color = statusColorMap[tooth.status];
        this.renderer.setAttribute(toothElement, 'fill', color);
      }
    });
  }

  SelectToothForAppointment() {

    setTimeout(() => {
      Object.keys(toothIdMap).forEach(toothId => {
        const toothElement = document.querySelector(`path#${toothId}`);
        if (toothElement) {
          const mouseEnterListener = this.renderer.listen(toothElement, 'mouseenter', () => {
            this.renderer.setStyle(toothElement, 'cursor', 'pointer');
          });
          const mouseLeaveListener = this.renderer.listen(toothElement, 'mouseleave', () => {
            this.renderer.removeStyle(toothElement, 'cursor');
          });
          const clickListener = this.renderer.listen(toothElement, 'click', () => {
            const newColor = '#e8d061';
            const toothPosition = toothIdMap[toothId];

            if (this.selectedTeeth[toothId]) {
              this.renderer.removeStyle(toothElement, 'fill');
              this.toothList = this.toothList.filter(pos => pos !== toothPosition);
              this.selectedTeeth[toothId] = false;
            } else {
              this.renderer.setStyle(toothElement, 'fill', newColor);
              this.toothList.push(toothPosition);
              this.selectedTeeth[toothId] = true;
            }

            this.arrayTooth.emit(this.toothList);
          });

          this.listeners.push(mouseEnterListener, mouseLeaveListener, clickListener);
        }
      });
    }, 100);
  }

  openModal(templateRef: any, id: any): void {
    this.dialogRef = this.dialog.open(templateRef, {
      width: '80%',
      height: 'auto',
    });
  }
}