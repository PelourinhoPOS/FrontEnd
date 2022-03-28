import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationDialogComponent } from './authentication-dialog/authentication-dialog.component';
import { AuthenticationComponent } from './authentication/authentication.component';

const routes: Routes = [
  { path: "", component: AuthenticationComponent },
  { path: "authentication", component: AuthenticationDialogComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
