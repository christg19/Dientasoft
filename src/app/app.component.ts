import { animate, group, query, style, transition, trigger, state } from '@angular/animations';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppointmentSubject, NotificationsService } from './shared/services/notifications.service';
import { MatDialog } from '@angular/material/dialog';
import { NotificationDialogComponent } from './notification-dialog/notification-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        style({ position: 'relative' }),
        query(':enter, :leave', [
          style({
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
          }),
        ]),
        query(':enter', [style({ opacity: 0, transform: 'translateX(100%)' })]),
        group([
          query(':leave', [
            animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-100%)' })),
          ]),
          query(':enter', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
          ]),
        ]),
      ]),
    ]),
    trigger('slideNotification', [
      state('hidden', style({
        height: '0px',
        padding: '0px',
        opacity: 0,
        overflow: 'hidden',
      })),
      state('visible', style({
        height: '40px',
        padding: '1rem 1rem',
        opacity: 1,
      })),
      transition('hidden <=> visible', [
        animate('300ms ease-in-out'),
      ]),
    ]),


  ],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Dientasoft';

  groupedMenu = {
    general: [
      { title: 'General', icon: 'speed', url: '/general' },
      { title: 'Citas', icon: 'date_range', url: '/appointment' },
    ],
    patients: [
      { title: 'Pacientes', icon: 'group', url: '/patients' },
      { title: 'Servicios', icon: 'medical_services', url: '/services' },
    ],
    admin: [
      { title: 'Inventario', icon: 'local_hospital', url: '/inventory' },
      { title: 'Trabajadores', icon: 'engineering', url: '' },
    ],
    finance: [
      { title: 'Cuotas', icon: 'attach_money', url: '/dues' },
      { title: 'Ventas', icon: 'point_of_sale', url: '' },
    ],
  };

  notificationState: 'hidden' | 'visible' = 'hidden';
  notifications: AppointmentSubject[] = [];
  private intervalId!: any;

  constructor(
    private router: Router,
    private notificationsService: NotificationsService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // Cargar las notificaciones al iniciar
    this.fetchNotifications();
  
    // Configurar el intervalo para actualizar las notificaciones
    this.intervalId = setInterval(() => {
      this.fetchNotifications();
    }, 10000);
  }

  private fetchNotifications() {
    this.notificationsService.fetchNotifications().subscribe((newNotifications) => {
      // Actualizar la lista local de notificaciones
      this.notifications = newNotifications;
      // Actualizar el estado de la barra de notificaciones
      this.updateNotificationState();
    });
  }


  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateNotificationState() {
    this.notificationState = this.unseenNotificationsCount > 0 ? 'visible' : 'hidden';
  }
 

  markAsSeen() {
    this.notificationsService.markAllAsRead().subscribe(() => {
      // Actualizar el estado local de las notificaciones
      this.notifications.forEach(notification => notification.seen = true);
      // Actualizar el estado de la barra de notificaciones
      this.updateNotificationState();
    });
  }
  
  toggleNotification(): void {
    this.dialog.open(NotificationDialogComponent, {
      width: '400px',
      data: { notifications: this.notifications }
    }).afterClosed().subscribe(() => {
      this.markAsSeen();
    });
  }
  



get unseenNotificationsCount(): number {
  return this.notifications.filter((n) => !n.seen).length;
}




  private showNotification(): void {
    this.notificationState = 'visible';
    setTimeout(() => {
      this.notificationState = 'hidden';
    }, 5000);
  }

  redirect(url: string): void {
    const allMenuOptions = [
      ...this.groupedMenu.general,
      ...this.groupedMenu.patients,
      ...this.groupedMenu.admin,
      ...this.groupedMenu.finance,
    ];

    const submenu = allMenuOptions.find((option) => option.title === url);

    if (submenu && submenu.url) {
      this.router.navigate([submenu.url]);
    } else {
      console.error('URL no encontrada o no definida');
    }
  }

  prepareRoute(outlet: RouterOutlet): any {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
