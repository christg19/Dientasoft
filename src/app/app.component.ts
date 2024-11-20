import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
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
    // settings: [
    //   { title: 'Mi Cuenta', icon: 'account_circle', url: '' },
    //   { title: 'Ajustes', icon: 'settings', url: '' },
    // ],
  };

  constructor(
    private router: Router
  ) { }

  redirect(url: string) {

    const allMenuOptions = [
      ...this.groupedMenu.general,
      ...this.groupedMenu.patients,
      ...this.groupedMenu.admin,
      ...this.groupedMenu.finance,
      // ...this.groupedMenu.settings,
    ];

    const submenu = allMenuOptions.find((option) => option.title === url);

    if (submenu && submenu.url) {
      this.router.navigate([submenu.url]);
    } else {
      console.error("URL no encontrada o no definida");
    }
  }

}
