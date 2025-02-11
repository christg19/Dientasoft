import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppointmentSubject } from '../shared/services/notifications.service';

@Component({
  selector: 'app-notification-dialog',
  templateUrl: './notification-dialog.component.html',
  styleUrls: ['./notification-dialog.component.scss']
})
export class NotificationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { notifications: AppointmentSubject[] }) { }

  markAsRead(notification: any) {
    notification.seen = true;
    console.log(`Notificación marcada como leída: ${notification.patientName}`);
  }

  getDay(dateString:string) {
    const date = new Date(dateString);

    const daysOfWeek = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const dayOfWeek = date.getDay();

    return daysOfWeek[dayOfWeek];
  }

  formatTime(dateString:string) {
    const date = new Date(dateString);
  
    let hours = date.getHours();
    const minutes = date.getMinutes(); 
    const ampm = hours >= 12 ? "PM" : "AM"; 
  
    hours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; 
  
    return `${hours}:${formattedMinutes} ${ampm}`;
  }
  
}
