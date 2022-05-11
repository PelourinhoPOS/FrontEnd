import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

import { DefaultComponent } from './default.component';
import { SharedModule } from '../../shared/shared.module';
import { DashboardComponent } from '../../modules/dashboard/dashboard.component';
import { ClientesComponent, CreateClientModalComponent } from '../../modules/clientes/clientes.component';
import { CreateEmployeeModalComponent, EmpregadosComponent } from '../../modules/empregados/empregados.component';
import { OnlineOfflineService } from '../../services/online-offline.service';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { VirtualKeyboardComponent } from '../../shared/components/virtual-keyboard/virtual-keyboard.component';
import { ArtigosComponent, CreateArticleModalComponent } from '../../modules/artigos/artigos.component';
import { CreateBoardModalComponent, MesasComponent } from '../../modules/mesas/mesas.component';
import { CategoriesComponent, CreateCategorieModalComponent, CreateSubCategorieModalComponent } from '../../modules/categories/categories.component';

import {MatPaginatorModule} from '@angular/material/paginator';

@NgModule({
  declarations: [
    DefaultComponent,
    DashboardComponent,
    ClientesComponent, 
    EmpregadosComponent,
    MesasComponent,
    ArtigosComponent,
    CategoriesComponent,
    CreateClientModalComponent,
    CreateEmployeeModalComponent,
    CreateArticleModalComponent,
    CreateCategorieModalComponent,
    CreateBoardModalComponent,
    CreateSubCategorieModalComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    MatSidenavModule,
    MatDividerModule,
    MatTableModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    MatProgressBarModule,
    MatPaginatorModule
  ],
  providers: [OnlineOfflineService],
})
export class DefaultModule { }
