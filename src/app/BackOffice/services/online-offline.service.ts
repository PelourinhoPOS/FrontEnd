import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnlineOfflineService {

  private statusConection$ = new Subject<boolean>();

  constructor() { 
    //evnet listener to know the status of connection
    window.addEventListener('online', () => this.refreshStatusConnection());
    window.addEventListener('offline', () => this.refreshStatusConnection());
  }

  get isOnline(): boolean{
    return !!window.navigator.onLine;
  }

  get statusConection(): Observable<boolean>{
    return this.statusConection$.asObservable();
  }

  refreshStatusConnection(){
    this.statusConection$.next(this.isOnline);
  }
}
