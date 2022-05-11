import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { EmpregadosComponent } from 'src/app/BackOffice/modules/empregados/empregados.component';
import { EmpregadosService } from 'src/app/BackOffice/modules/empregados/empregados.service';
import { authenticationService } from 'src/app/FrontOffice/authentication-dialog/authentication-dialog.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  constructor(private cookieService: CookieService, private _router: Router, private empregadosService: EmpregadosService, private authService: authenticationService ) { }

  public userId;
  public data;

  
  ngOnInit(): void {
    this.getUserData();
  }

  getUserData(){
    this.userId = parseInt(this.cookieService.get('userId'));

    this.empregadosService.getDataOffline().subscribe(data => {
      this.data = data.filter(item => item.id === this.userId)[0];
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

}
