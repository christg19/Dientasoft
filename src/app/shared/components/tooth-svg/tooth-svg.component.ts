import { Component, Input, OnInit, TemplateRef, ViewChild, AfterViewInit, Renderer2, Output, EventEmitter, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ToothStatus } from '../../const';
import { Tooth } from '../../interfaces/tooth.interface';

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

const statusColorMap: Record<ToothStatus, string> = {
  [ToothStatus.HEALTHY]: '#FFFFFF',
  [ToothStatus.DECAYED]: '#FF5722',
  [ToothStatus.MISSING]: '#9E9E9E',
  [ToothStatus.TREATED]: '#2196F3'
};

@Component({
  selector: 'app-tooth-svg',
  templateUrl: './tooth-svg.component.html',
  styleUrls: ['./tooth-svg.component.scss']
})
export class ToothSVGComponent implements OnInit, AfterViewInit {
  @ViewChild('toothContent') toothContent!: TemplateRef<any>;
  @Input() patient?: number;
  @Input() unableCreateTooths?:boolean;
  @Output() actualToothId = new EventEmitter<number>;
  @Input() componentTitle!:string;
  @Input() appointment!:boolean;
  colorOn:boolean = true;

  public toothList:Tooth[] = [];

  dialogRef!: MatDialogRef<any>;
  // public testToothData = [
  //   { position: 1, status: ToothStatus.HEALTHY },
  //   { position: 2, status: ToothStatus.DECAYED },
  //   { position: 3, status: ToothStatus.MISSING },
  //   { position: 4, status: ToothStatus.TREATED }
  // ];

  constructor(public dialog: MatDialog, private renderer: Renderer2, private elementRef: ElementRef) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    if(this.unableCreateTooths){
      this.removePaths();
    }
    if(!this.appointment) {
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

            this.openModal(this.toothContent, id)
          });
        } else {
          console.warn(`Element with ID ${toothId} not found or is not a <path>`);
        }
      });


      this.applyTestToothColors();
    }, 100);
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
    this.toothList.forEach((tooth) => {
      const svgId = Object.keys(toothIdMap).find(key => toothIdMap[key] === tooth.position);
      const toothElement = document.querySelector(`path#${svgId}`);
      if (toothElement) {
        const color = statusColorMap[tooth.status as ToothStatus];
        this.renderer.setAttribute(toothElement, 'fill', color);
      }
    });
  }

  SelectToothForAppointment() {
    setTimeout(() => {
      Object.keys(toothIdMap).forEach(toothId => {
        const toothElement = document.querySelector(`path#${toothId}`);
        if (toothElement) {
          
          this.renderer.listen(toothElement, 'mouseenter', () => {
            this.renderer.setStyle(toothElement, 'cursor', 'pointer');
          });
          this.renderer.listen(toothElement, 'mouseleave', () => {
            this.renderer.removeStyle(toothElement, 'cursor');
          });
  
          this.renderer.listen(toothElement, 'click', () => {
            const newColor = '#e8d061'; 
            if(this.colorOn){
              this.renderer.setStyle(toothElement, 'fill', newColor);
              this.colorOn = false;
            } else {
              this.renderer.removeStyle(toothElement, 'fill')
              this.colorOn = true;
            }
            this.renderer.addClass(toothElement, 'click-animate'); 
            
            this.getTooth(toothIdMap[toothId]); 
          });
        } else {
          console.warn(`Element with ID ${toothId} not found or is not a <path>`);
        }
      });
  
    }, 100);
  }

  openModal(templateRef: any, id: any): void {
    console.log(id);
    this.dialogRef = this.dialog.open(templateRef, {
      width: '80%',
      height: 'auto',
    });
  }
}