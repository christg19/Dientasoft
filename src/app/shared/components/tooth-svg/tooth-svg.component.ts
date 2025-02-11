import { Component, Input, OnInit, TemplateRef, ViewChild, AfterViewInit, Renderer2, Output, EventEmitter, ElementRef, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToothNames, ToothStatus } from '../../const/enums/tooth.enum';
import { Tooth } from '../../interfaces/tooth.interface';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { RefreshService } from '../../services/refresh.service';
import { lastValueFrom } from 'rxjs';
import { ServicesService } from '../../services/services.service';
import { BaseGridService } from '../../services/baseGrid.service';
import { apiRoutes } from '../../const/backend-routes';
import { ActivatedRoute } from '@angular/router';

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
  @Input() componentTitle?: string;
  @Input() appointment!: boolean;
  @Input() statusButton!: TemplateRef<any>;
  @Input() statusOptions!: TemplateRef<any>;
  @Input() statusMap: any;
  @Input() actualToothArray!: Tooth[];
  @Input() changeStatus: boolean = false;
  private refreshSubscription!: Subscription;
  colorOn: boolean = true;
  public odontogramId!: number; 
  selectedTeeth: { [key: string]: boolean } = {};
  private isSelectToothEnabled = true;
  private listeners: (() => void)[] = [];

  public toothList: Tooth[] = [];

  dialogRef!: MatDialogRef<any>;
 

  constructor(
    public dialog: MatDialog,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private refreshService: RefreshService,
    private servicesService: ServicesService,
    private baseGridService: BaseGridService,
    private route: ActivatedRoute
  ) { 
  
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['actualToothArray'] && !changes['actualToothArray'].firstChange) {
      this.applyTestToothColors();
    }
    if (changes['appointment']) {
      this.decidingToothMethods();
    }
  }
  

  ngOnInit(): void {
   
    this.route.paramMap.subscribe((params) => {
      // Suponiendo que el parámetro se llama "id"
      const id = params.get('id');
      if (id) {
        this.odontogramId = Number(id);
        console.log('OdontogramId almacenado:', this.odontogramId);
      }
    });
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
    try {
      // Obtener la lista de procedimientos desde el endpoint de services
      const procedures: any[] = await lastValueFrom(this.servicesService.getServices());
      // Generar el HTML de las opciones del select múltiple
      const optionsHtml = procedures
        .map(proc => `<option value="${proc.id}">${proc.name}</option>`)
        .join('');
    
      // Mostrar el modal con SweetAlert2, incluyendo dos botones:
      // - "Limpiar selección" para deseleccionar manualmente las opciones.
      // - "Quitar todos" para actualizar inmediatamente el diente con un array vacío.
      const { value: formValues } = await Swal.fire({
        title: `Asignar procedimientos a ${ToothNames[id]}`,
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem;">
            <select id="swal-procedure" class="swal2-input" style="width: 80%; padding: 10px; margin: 10px;" multiple>
              <option value="" disabled>Seleccione uno o más procedimientos...</option>
              ${optionsHtml}
            </select>
            <div style="display: flex; gap: 1rem;">
              <button id="clear-selection" style="background-color: transparent; border: 1px solid #ccc; border-radius: 4px; padding: 5px 10px; cursor: pointer;">
                Limpiar selección
              </button>
              <button id="remove-all" style="background-color: transparent; border: 1px solid #ccc; border-radius: 4px; padding: 5px 10px; cursor: pointer;">
                Quitar todos
              </button>
            </div>
            <input id="swal-note" class="swal2-input" placeholder="Agregar nota (opcional)" />
          </div>
        `,
        focusConfirm: false,
        didOpen: () => {
          const selectElement = document.getElementById('swal-procedure') as HTMLSelectElement;
          const clearButton = document.getElementById('clear-selection');
          const removeAllButton = document.getElementById('remove-all');
          if (clearButton && selectElement) {
            clearButton.addEventListener('click', () => {
              for (let i = 0; i < selectElement.options.length; i++) {
                selectElement.options[i].selected = false;
              }
            });
          }
          if (removeAllButton && selectElement) {
            removeAllButton.addEventListener('click', () => {
              // Deselecciona todas las opciones
              for (let i = 0; i < selectElement.options.length; i++) {
                selectElement.options[i].selected = false;
              }
              // Llama a la función de actualización con un array vacío
              this.assignProcedureToTooth(id, []);
              // Cierra el modal inmediatamente
              Swal.close();
            });
          }
        },
        preConfirm: () => {
          const selectElement = document.getElementById('swal-procedure') as HTMLSelectElement;
          const selectedOptions = Array.from(selectElement.selectedOptions).map(option => Number(option.value));
          const note = (document.getElementById('swal-note') as HTMLInputElement).value;
          return { procedureIds: selectedOptions, note };
        }
      });
    
      // Si se confirma con el botón "OK" (y no se pulsó "Quitar todos")
      if (formValues) {
        if (formValues.procedureIds.length === 0) {
          Swal.fire("Servicios limpiados", "", "success");
        } else {
          Swal.fire(`Procedimientos asignados: ${formValues.procedureIds.join(', ')}${formValues.note ? ' - Nota: ' + formValues.note : ''}`);
        }
        this.assignProcedureToTooth(id, formValues.procedureIds, formValues.note);
      }
    } catch (error) {
      console.error("Error al obtener procedimientos:", error);
      Swal.fire("Error", "No se pudieron cargar los procedimientos", "error");
    }
  }
  
  assignProcedureToTooth(toothId: number, procedureIds: number[], note?: string): void {
    console.log(`Procedimientos ${procedureIds} asignados al diente ${toothId} con nota: ${note}`);
  
    // Verificamos que se tenga un odontogramId (pasado por input)
    if (!this.odontogramId) {
      console.error('No se encontró el odontograma para el paciente.');
      Swal.fire("Error", "No se encontró el odontograma del paciente", "error");
      return;
    }
  
    // Construir el payload con odontogramId y serviceIds
    const payload = {
      odontogramId: this.odontogramId,
      serviceIds: procedureIds // Si el array está vacío, se limpiarán los servicios asignados
    };
  
    // Llama al método updateToothServiceIds de baseGridService con la URL correcta
    this.baseGridService.updateToothServiceIds(apiRoutes.tooth.main2, toothId, payload).subscribe({
      next: (updatedTooth: any) => {
        Swal.fire("El diente ha sido actualizado", "", "success");
        this.refreshService.triggerRefresh();
      },
      error: (error) => {
        console.error("Error al actualizar el diente:", error);
        Swal.fire("Error al actualizar el diente", "", "error");
      }
    });
  }
  

  
  
  // Ejemplo de método para usar las opciones seleccionadas
  usarOpcionesSeleccionadas(opcion1: string, opcion2: string) {
    console.log(`Opción 1 seleccionada: ${opcion1}`);
    console.log(`Opción 2 seleccionada: ${opcion2}`);
    // Lógica adicional para manejar las opciones seleccionadas...
  }
  
  clearAllSelectedTeethForm(){
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