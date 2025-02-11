import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, switchMap } from 'rxjs';

export interface AppointmentSubject {
  patientName: string;
  date: string;
  seen: boolean;
  type: 'upcoming' | 'completed'
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private notificationsSubject = new BehaviorSubject<AppointmentSubject[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {
    interval(600000)
      .pipe(switchMap(() => this.fetchNotifications()))
      .subscribe((notifications) => {
        this.notificationsSubject.next(notifications);
      });
  }

  fetchNotifications() {
    return this.http.get<AppointmentSubject[]>('http://localhost:3000/api/v1/notifications/');
  }

  markAllAsRead(): Observable<void> {
    return this.http.patch<void>('http://localhost:3000/api/v1/notifications/mark-as-read', {});
  }
}
