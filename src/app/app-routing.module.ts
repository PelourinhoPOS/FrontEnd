import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationDialogComponent } from './authentication-dialog/authentication-dialog.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { FoodDrinksComponent } from './food-drinks/food-drinks.component';

const routes: Routes = [
  { path: "", component: AuthenticationComponent },
  { path: "authentication", component: AuthenticationDialogComponent },
  { path: "food&drinks", component: FoodDrinksComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
