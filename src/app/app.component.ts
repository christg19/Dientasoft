import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent  {
  title = 'Dientasoft';

  menu = [{ title: 'General', icon: 'speed', url:'/general' },
  { title: 'Citas', icon: 'date_range', url: '/appointment' },
  { title: 'Pacientes', icon: 'group', url: '/patients' },
  { title: 'Inventario', icon: 'local_hospital', url: '' },
  { title: 'Trabajadores', icon: 'engineering', url: '' },
  { title: 'Medicamentos', icon: 'medical_services', url: '' },
  { title: 'Gastos', icon: 'attach_money', url: '' },
  { title: 'Ventas', icon: 'point_of_sale', url: '' },
  { title: 'Mi Cuenta', icon: 'account_circle', url: '' },
  { title: 'Ajustes', icon: 'settings', url: '' },
  { title: 'Cerrar sesion', icon: 'logout', url: '' }]

  constructor (
private router: Router
  ){ }

  redirect(url:string){
    let submenu = this.menu.filter((option)=>{
      return option.title === url
  })

  this.router.navigate([submenu[0].url])
  }
}
