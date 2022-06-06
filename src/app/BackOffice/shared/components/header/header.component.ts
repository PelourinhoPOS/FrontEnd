import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { UsersService } from 'src/app/BackOffice/modules/users/users.service';
import { authenticationService } from 'src/app/FrontOffice/authentication-dialog/authentication-dialog.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() toogleSidebarForMe: EventEmitter<any> = new EventEmitter();

  constructor(private cookieService: CookieService, private _router: Router, private usersService: UsersService, private authService: authenticationService ) { }

  public userId;
  public data;

  
  ngOnInit(): void {
    this.getUserData();
  }

  getUserData(){
    this.userId = parseInt(this.cookieService.get('userId'));

    this.usersService.getDataOffline().subscribe(data => {
      this.data = data.filter(item => item.id === this.userId);
      console.log(this.data);
    });

    // db.collection('empregado').doc({ id: this.userId }).get().then(user => {
    //   this.data = user;
    // })
  }

  logout(){
    this.authService.stopWatch();
    this.cookieService.delete('userId');
    this._router.navigate(['/']);
  }

  toogleSidebar() {
    this.toogleSidebarForMe.emit();
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
  }

}
