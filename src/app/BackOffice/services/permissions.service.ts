import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class PermissionsService {

  public permissions: boolean = false;
  public function

  constructor(private cookieService: CookieService, private _router: Router, private toastr: ToastrService) { }

  //get permissions
  getPermissions() {
    this.function = this.cookieService.get('role');
    if (this.function == 'Admin' || this.function == 'Gerente') {
      this.permissions = true;
    } else {
      this.permissions = false;
      this.toastr.error('Você não tem permissão para acessar essa página', 'Aviso');
      this._router.navigate(['/']);
    }
  }
}
