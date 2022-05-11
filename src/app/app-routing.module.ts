import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationDialogComponent } from './FrontOffice/authentication-dialog/authentication-dialog.component';
import { AuthenticationComponent } from './FrontOffice/authentication/authentication.component';
import { DefaultComponent } from './BackOffice/layouts/default/default.component';
import { ClientesComponent } from './BackOffice/modules/clientes/clientes.component';
import { DashboardComponent } from './BackOffice/modules/dashboard/dashboard.component';
import { EmpregadosComponent } from './BackOffice/modules/empregados/empregados.component';
import { BoardComponent } from './FrontOffice/board/board.component';
import { FoodDrinksComponent } from './FrontOffice/food-drinks/food-drinks.component';
import { ArtigosComponent } from './BackOffice/modules/artigos/artigos.component';
import { CategoriesComponent } from './BackOffice/modules/categories/categories.component';
import { MesasComponent } from './BackOffice/modules/mesas/mesas.component';
import { PaymentModalComponent } from './FrontOffice/payment-modal/payment-modal.component';

const routes: Routes = [
  { path: "", component: AuthenticationComponent },
  { path: "authentication", component: AuthenticationDialogComponent },
  { path: "food&drinks/:id", component: FoodDrinksComponent },
  { path: "food&drinks", component: FoodDrinksComponent },
  { path: "board", component: BoardComponent },
  { path: "payment", component: PaymentModalComponent },

  {
    path: "backoffice", component: DefaultComponent, children: [
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      { path: "dashboard", component: DashboardComponent }, 
      { path: "clientes", component: ClientesComponent }, 
      { path: "empregados", component: EmpregadosComponent },
      { path: "artigos", component: ArtigosComponent },
      { path: "categorias", component: CategoriesComponent },
      { path: "mesas", component: MesasComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
